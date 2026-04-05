const path = require('path');
const fs = require('../util/fs');
const logger = require('../util/logger')('regenerateReport');
const report = require('./report');

module.exports = {
  execute: function (config) {
    function toAbsolute (p) {
      return (path.isAbsolute(p)) ? p : path.join(config.projectPath, p);
    }

    const bitmapsTestPath = toAbsolute(config.bitmaps_test);
    return fs.readdir(bitmapsTestPath).then(args => {
      const dirs = args[0]; // The custom promisify in this codebase returns an array of callback arguments
      // Filter out files and non-timestamped/irrelevant folders if needed
      // Assuming directories are timestamped like '20231027-123456'
      const timestampDirs = dirs.filter(dir => /^\d{8}-\d{6}$/.test(dir)).sort().reverse();

      if (timestampDirs.length === 0) {
        throw new Error('No previous test results found in ' + bitmapsTestPath);
      }

      const latestRun = timestampDirs[0];
      config.screenshotDateTime = latestRun;
      const reportJsonPath = path.join(bitmapsTestPath, latestRun, 'report.json');

      logger.log('Regenerating report from: ' + reportJsonPath);

      return fs.readFile(reportJsonPath, 'utf8').then(args => {
        const data = args[0];
        const reporter = JSON.parse(data);

        reporter.tests.forEach(test => {
          const pair = test.pair;

          // Reconstruct paths from config to avoid issues with relative paths in JSON
          if (pair.reference) pair.reference = path.join(toAbsolute(config.bitmaps_reference), pair.fileName);
          if (pair.test) pair.test = path.join(toAbsolute(config.bitmaps_test), config.screenshotDateTime, pair.fileName);
          if (pair.diffImage) pair.diffImage = path.join(toAbsolute(config.bitmaps_test), config.screenshotDateTime, path.basename(pair.diffImage));

          test.passed = function () {
            return this.status === 'pass';
          };
        });

        return report.writeReport(config, reporter);
      });
    }).catch(err => {
      logger.error('Failed to regenerate report: ' + err.message);
      throw err;
    });
  }
};
