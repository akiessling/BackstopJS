const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('the runner', function () {
  it('should call the command/index with the correct config', function () {
    const runner = proxyquire('../../core/runner', {
      './util/makeConfig': function (command, args) {
        return { command, args };
      },
      './command/': function (command, config) {
        return Promise.resolve({ command, config });
      }
    });
    return runner('test', {}).then(function (args) {
      assert.strictEqual(args.command, 'test');
      assert.deepStrictEqual(args.config, { command: 'test', args: {} });
    });
  });
});
