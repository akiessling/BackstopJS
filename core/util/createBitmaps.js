const cloneDeep = require('lodash/cloneDeep');
const fs = require('./fs');
const _ = require('lodash');
const pMap = require('p-map');

const runPuppet = require('./runPuppet');
const { createPlaywrightBrowser, runPlaywright, disposePlaywrightBrowser } = require('./runPlaywright');

const ensureDirectoryPath = require('./ensureDirectoryPath');
const logger = require('./logger')('createBitmaps');

const CONCURRENCY_DEFAULT = 10;

function regexTest (string, search) {
  const re = new RegExp(search);
  return re.test(string);
}

function ensureViewportLabel (config) {
  if (typeof config.viewports === 'object') {
    config.viewports.forEach(function (viewport) {
      if (!viewport.label) {
        viewport.label = viewport.name;
      }
    });
  }
}

function decorateConfigForCapture (config, isReference) {
  let configJSON;

  if (typeof config.args.config === 'object') {
    configJSON = config.args.config;
  } else {
    configJSON = Object.assign({}, require(config.backstopConfigFileName));
  }
  configJSON.scenarios = configJSON.scenarios || [];
  ensureViewportLabel(configJSON);

  const totalScenarioCount = configJSON.scenarios.length;

  function pad (number) {
    let r = String(number);
    if (r.length === 1) {
      r = '0' + r;
    }
    return r;
  }

  const screenshotNow = new Date();
  let screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());
  screenshotDateTime = configJSON.dynamicTestId ? configJSON.dynamicTestId : screenshotDateTime;
  configJSON.screenshotDateTime = screenshotDateTime;
  config.screenshotDateTime = screenshotDateTime;

  if (configJSON.dynamicTestId) {
    logger.log(`dynamicTestId '${configJSON.dynamicTestId}' found. BackstopJS will run in dynamic-test mode.`);
  }

  configJSON.env = cloneDeep(config);
  configJSON.isReference = isReference;
  configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;
  configJSON.defaultMisMatchThreshold = config.defaultMisMatchThreshold;
  configJSON.backstopConfigFileName = config.backstopConfigFileName;
  configJSON.defaultRequireSameDimensions = config.defaultRequireSameDimensions;

  if (config.args.filter) {
    const scenarios = [];
    config.args.filter.split(',').forEach(function (filteredTest) {
      configJSON.scenarios.forEach(function (scenario) {
        if (regexTest(scenario.label, filteredTest)) {
          scenarios.push(scenario);
        }
      });
    });
    configJSON.scenarios = scenarios;
  }

  logger.log('Selected ' + configJSON.scenarios.length + ' of ' + totalScenarioCount + ' scenarios.');
  return configJSON;
}

function saveViewportIndexes (viewport, index) {
  return Object.assign({}, viewport, { vIndex: index });
}

class ProgressBar {
  constructor (total) {
    this.total = total;
    this.completed = 0;
    this.startTime = Date.now();
  }

  update () {
    this.completed++;
    const verbosity = parseInt(process.env.BACKSTOP_VERBOSITY || 0);
    if (verbosity > 0 || !process.stdout.isTTY) return;

    const percent = Math.round((this.completed / this.total) * 100);
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.completed / elapsed;
    const remaining = isFinite(rate) && rate > 0 ? Math.round((this.total - this.completed) / rate) : 0;
    const barLength = 20;
    const filled = Math.floor((this.completed / this.total) * barLength);
    const bar = '[' + '#'.repeat(filled) + '-'.repeat(barLength - filled) + ']';

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${bar} ${percent}% | ${this.completed}/${this.total} targets | ETA: ${remaining}s`);

    if (this.completed === this.total) {
      process.stdout.write('\n');
    }
  }
}

function delegateScenarios (config) {
  const scenarios = [];
  const scenarioViews = [];

  config.viewports = config.viewports.map(saveViewportIndexes);

  // casper.each(scenarios, function (casper, scenario, i) {
  config.scenarios.forEach(function (scenario, i) {
    // var scenarioLabelSafe = makeSafe(scenario.label);
    scenario.sIndex = i;
    scenario.selectors = scenario.selectors || [];
    if (scenario.viewports) {
      scenario.viewports = scenario.viewports.map(saveViewportIndexes);
    }
    scenarios.push(scenario);

    if (!config.isReference && _.has(scenario, 'variants')) {
      scenario.variants.forEach(function (variant) {
        // var variantLabelSafe = makeSafe(variant.label);
        variant._parent = scenario;
        scenarios.push(scenario);
      });
    }
  });

  let scenarioViewId = 0;
  scenarios.forEach(function (scenario) {
    let desiredViewportsForScenario = config.viewports;

    if (scenario.viewports && scenario.viewports.length > 0) {
      desiredViewportsForScenario = scenario.viewports;
    }

    desiredViewportsForScenario.forEach(function (viewport) {
      scenarioViews.push({
        scenario,
        viewport,
        config,
        id: scenarioViewId++
      });
    });
  });

  const pb = new ProgressBar(scenarioViews.length);
  const asyncCaptureLimit = config.asyncCaptureLimit === 0 ? 1 : config.asyncCaptureLimit || CONCURRENCY_DEFAULT;

  if (config.engine.startsWith('puppet')) {
    const wrappedPuppet = (view) => {
      return runPuppet(view).then(res => {
        pb.update();
        return res;
      });
    };
    return pMap(scenarioViews, wrappedPuppet, { concurrency: asyncCaptureLimit });
  } else if (config.engine.startsWith('play')) {
    const wrappedPlaywright = (view) => {
      return runPlaywright(view).then(res => {
        pb.update();
        return res;
      });
    };
    return new Promise((resolve, reject) => {
      createPlaywrightBrowser(config).then(browser => {
        logger.log('Browser created');

        for (const view of scenarioViews) {
          view._playwrightBrowser = browser;
        }

        pMap(scenarioViews, wrappedPlaywright, { concurrency: asyncCaptureLimit }).then(out => {
          disposePlaywrightBrowser(browser).then(() => resolve(out));
        }, e => {
          disposePlaywrightBrowser(browser).then(() => reject(e));
        });
      }, e => reject(e));
    });
  } else if (/chrom./i.test(config.engine)) {
    logger.error('Chromy is no longer supported in version 5+. Please use version 4.x.x for chromy support.');
  } else {
    logger.error(`Engine "${(typeof config.engine === 'string' && config.engine) || 'undefined'}" not recognized! If you require PhantomJS or Slimer support please use backstopjs@3.8.8 or earlier.`);
  }
}

function writeCompareConfigFile (comparePairsFileName, compareConfig) {
  const compareConfigJSON = JSON.stringify(compareConfig, null, 2);
  ensureDirectoryPath(comparePairsFileName);
  return fs.writeFile(comparePairsFileName, compareConfigJSON);
}

function flatMapTestPairs (rawTestPairs) {
  return rawTestPairs.reduce((acc, result) => {
    let testPairs = result.testPairs;
    if (!testPairs) {
      testPairs = {
        diff: {
          isSameDimensions: '',
          dimensionDifference: {
            width: '',
            height: ''
          },
          misMatchPercentage: ''
        },
        reference: '',
        test: '',
        selector: '',
        fileName: '',
        label: '',
        scenario: result.scenario,
        viewport: result.viewport,
        msg: result.msg,
        error: result.originalError && result.originalError.name
      };
    }
    return acc.concat(testPairs);
  }, []);
}

module.exports = function (config, isReference) {
  const promise = delegateScenarios(decorateConfigForCapture(config, isReference))
    .then(rawTestPairs => {
      const result = {
        compareConfig: {
          testPairs: flatMapTestPairs(rawTestPairs)
        }
      };
      return writeCompareConfigFile(config.tempCompareConfigFileName, result);
    });

  return promise;
};
