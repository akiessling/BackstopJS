const fs = require('./fs');

/**
 * Extract jsonReport from the jsonpReport
 *
 * @param {String} jsonpReport - jsonpReport `report(${jsonReport});`
 * @return {Object} an object of jsonReport
 */
function extractReport (jsonpReport) {
  const jsonReport = jsonpReport.substring(7, jsonpReport.length - 2);
  return JSON.parse(jsonReport);
}

/**
 * Helper function to modify the test status of the JSONP report based on the approved file name.
 *
 * @param {String} originalJsonpReport - jsonpReport `report(${jsonReport});`
 * @param {String} approvedFileName - the name of the screenshot that is approved
 * @return {String} jsonpReport - modified jsonpReport
 */
function modifyJsonpReportHelper (originalJsonpReport, approvedFileName) {
  const report = extractReport(originalJsonpReport);
  report.tests.forEach(test => {
    if (test.pair.fileName === approvedFileName) {
      test.status = 'pass';
      delete test.pair.diffImage;
    }
    return test;
  });

  const jsonReport = JSON.stringify(report, null, 2);
  const jsonpReport = `report(${jsonReport});`;
  return jsonpReport;
}

/**
 * Modify the test status of the JSONP report based on the approved file name. JSONP is used
 * to create the Backstop report in browser. This function ensures the UI consistency after
 * a user apporves a test in browser and refreshes the report without running a test.
 *
 * @param {Object} params - the input params
 * @param {String} params.reportConfigFilename - the path to the html report config file
 * @param {String} params.approvedFileName - the name of the screenshot that is approved
 * @return {Promise}
 */
async function modifyJsonpReport ({ reportConfigFilename, approvedFileName }) {
  return updateReportStatus({
    reportConfigFilename,
    filter: approvedFileName,
    status: 'pass'
  });
}

/**
 * Update the test status of the JSONP/JSON report.
 *
 * @param {Object} params - the input params
 * @param {String} params.reportConfigFilename - the path to the config.js file (JSONP)
 * @param {String} [params.reportJsonFilename] - the path to the report.json file (optional)
 * @param {String} params.filter - the name of the screenshot to update
 * @param {String} params.status - the new status ('pass', 'fail', 'acknowledged')
 * @return {Promise}
 */
async function updateReportStatus ({ reportConfigFilename, reportJsonFilename, filter, status }) {
  try {
    const result = await fs.readFile(reportConfigFilename, 'utf8');
    // The custom promisify implementation resolves with an array of arguments (e.g., [data])
    const configContent = Array.isArray(result) ? result[0] : result;
    const report = extractReport(configContent);

    report.tests.forEach(test => {
      if (test.pair.fileName === filter) {
        test.status = status;
        if (status === 'pass') {
          delete test.pair.diffImage;
        }
      }
    });

    const jsonReport = JSON.stringify(report, null, 2);
    const jsonpReport = `report(${jsonReport});`;

    const promises = [fs.writeFile(reportConfigFilename, jsonpReport)];
    if (reportJsonFilename) {
      promises.push(fs.writeFile(reportJsonFilename, jsonReport));
    }

    return Promise.all(promises);
  } catch (err) {
    throw new Error(`Failed to update the report status. ${err.message}.`);
  }
}

module.exports = {
  modifyJsonpReport,
  modifyJsonpReportHelper,
  updateReportStatus
};
