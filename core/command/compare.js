const path = require('path');
const fs = require('../util/fs');
const logger = require('../util/logger')('compare');

module.exports = {
  execute: function (config) {
    function toAbsolute (p) {
      if (!p) return '';
      return (path.isAbsolute(p)) ? p : path.join(config.projectPath, p);
    }

    const bitmapsTestPath = toAbsolute(config.bitmaps_test);

    return fs.readdir(bitmapsTestPath).then(args => {
      const dirs = args[0];
      const timestampDirs = dirs.filter(dir => /^\d{8}-\d{6}$/.test(dir)).sort().reverse();

      if (timestampDirs.length === 0) {
        throw new Error('No previous test results found in ' + bitmapsTestPath);
      }

      const latestRun = timestampDirs[0];
      config.screenshotDateTime = latestRun;
      const reportJsonPath = path.join(bitmapsTestPath, latestRun, 'report.json');

      logger.log('Reading previous results from: ' + reportJsonPath);

      return fs.readFile(reportJsonPath, 'utf8').then(args => {
        const data = args[0];
        const reporter = JSON.parse(data);

        // Try to load current config to apply updated thresholds/settings
        let currentConfig = {};
        try {
          currentConfig = require(config.backstopConfigFileName);
        } catch (e) {
          logger.log('Note: Could not load current backstop.json, using values from previous run.');
        }

        const testPairs = reporter.tests.map(test => {
          const pair = test.pair;

          // Find current scenario config if possible to apply updated settings
          const currentScenario = (currentConfig.scenarios || []).find(s => s.label === pair.label);

          // Reconstruct paths similar to how regenerateReport does it
          // This avoids issues with relative paths like '../bitmaps_test/...' in report.json
          const referencePath = path.join(toAbsolute(config.bitmaps_reference), pair.fileName);
          const testPath = path.join(bitmapsTestPath, latestRun, pair.fileName);
          
          return {
            reference: referencePath,
            test: testPath,
            selector: pair.selector,
            fileName: pair.fileName,
            label: pair.label,
            requireSameDimensions: currentScenario ? (currentScenario.requireSameDimensions !== undefined ? currentScenario.requireSameDimensions : currentConfig.requireSameDimensions) : pair.requireSameDimensions,
            misMatchThreshold: currentScenario ? (currentScenario.misMatchThreshold !== undefined ? currentScenario.misMatchThreshold : currentConfig.misMatchThreshold) : pair.misMatchThreshold,
            url: pair.url,
            referenceUrl: pair.referenceUrl,
            expect: pair.expect,
            viewportLabel: pair.viewportLabel,
            scenario: currentScenario || pair.scenario,
            viewport: pair.viewport
          };
        });

        const result = {
          compareConfig: {
            testPairs: testPairs
          }
        };

        logger.log('Re-comparing ' + testPairs.length + ' scenarios...');

        return fs.writeFile(config.tempCompareConfigFileName, JSON.stringify(result, null, 2)).then(() => {
          const executeCommand = require('./index');
          return executeCommand('_report', config);
        });
      });
    }).catch(err => {
      logger.error('Failed to run compare: ' + err.message);
      throw err;
    });
  }
};
