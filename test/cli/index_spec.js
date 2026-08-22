const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const sinon = require('sinon');

describe('cli', function () {
  afterEach(function () {
    delete process.exitCode;
  });

  it('should call the runner without custom options correctly', function (done) {
    process.argv = ['node', 'backstop', 'test'];
    const promiseMock = Promise.resolve();
    const runnerMock = sinon.stub().returns(promiseMock);
    proxyquire('../../cli/index', { '../core/runner': runnerMock });

    promiseMock.then(() => {
      assert.strictEqual(process.exitCode, undefined);
      assert(runnerMock.calledWith('test'));
      done();
    });
  });

  it('should exit with code 1 if runner fails', function (done) {
    process.argv = ['node', 'backstop', 'test'];
    const promiseMock = Promise.reject(new Error('errorMock'));
    const runnerMock = sinon.stub().returns(promiseMock);
    proxyquire('../../cli/index', { '../core/runner': runnerMock });

    promiseMock.catch(() => {
      assert.strictEqual(process.exitCode, 1);
      done();
    });
  });
});
