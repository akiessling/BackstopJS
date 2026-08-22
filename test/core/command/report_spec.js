const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const sinon = require('sinon');

describe('core report', function () {
  const config = {
    report: ['json'],
    json_report: '/test',
    compareJsonFileName: '/compareJson',
    compareConfigFileName: '/compareConfig',
    html_report: '/html_report',
    bitmaps_test: '/bitmaps_test',
    screenshotDateTime: 'screenshotDateTime',
    args: {
      config: {}
    }
  };

  it('should generate two json reports and a default browser report when config.report specifies json', function () {
    const reporterClass = { failed: () => undefined, passed: () => 'passed', getReport: () => { return { test: 123 }; } };
    const compareMock = sinon.stub().returns(Promise.resolve(reporterClass));
    const loggerMock = () => {
      return { log: sinon.stub(), error: sinon.stub() };
    };
    const writeFileStub = sinon.stub().returns(Promise.resolve());
    const fsMock = { ensureDir: () => Promise.resolve(), writeFile: writeFileStub, copy: () => Promise.resolve() };
    const report = proxyquire('../../../core/command/report', {
      '../util/compare/': compareMock,
      '../util/logger': loggerMock,
      '../util/fs': fsMock
    });

    return report.execute(config).then(() => {
      assert.strictEqual(writeFileStub.callCount, 3);
      assert.strictEqual(writeFileStub.calledWith('/compareJson'), true);
      assert.strictEqual(writeFileStub.calledWith('/compareConfig'), true);
      assert.strictEqual(writeFileStub.calledWith('/bitmaps_test/screenshotDateTime/report.json'), true);
    });
  });
});
