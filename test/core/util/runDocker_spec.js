const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('runDocker', function () {
  const originalCwd = process.cwd;
  const originalArgv = process.argv;

  afterEach(function () {
    process.cwd = originalCwd;
    process.argv = originalArgv;
  });

  it('should run correct docker command', function (done) {
    process.cwd = () => '/path/mock';
    process.argv = ['test'];
    const { runDocker } = proxyquire('../../../core/util/runDocker', {
      '../../package': { version: 'version.mock' },
      child_process: {
        spawn: function (dockerCommand) {
          assert.strictEqual(
            dockerCommand,
            'docker run --rm -it --mount type=bind,source="/path/mock",target=/src backstopjs/backstopjs:version.mock test' +
            ' "--moby=true" "--config=my_config.json" "--filter=my_filter"');
          done();
          return { on: () => {} };
        }
      }
    });

    const config = {
      args: {
        docker: true,
        config: 'my_config.json',
        filter: 'my_filter'
      }
    };

    runDocker(config, 'test');
  });

  it('should not pass undefined args to docker', function (done) {
    process.argv = ['test'];
    const { runDocker } = proxyquire('../../../core/util/runDocker', {
      child_process: {
        spawn: function (dockerCommand) {
          assert(!dockerCommand.includes('--filter'));
          done();
          return { on: () => {} };
        }
      }
    });

    const config = {
      args: {
        docker: true,
        filter: undefined
      }
    };

    runDocker(config, 'test');
  });

  it('should create tmp config file if config arg is an object', function (done) {
    process.argv = ['test'];
    const { runDocker } = proxyquire('../../../core/util/runDocker', {
      './fs': {
        writeFile: function () {
          return Promise.resolve();
        }
      },
      child_process: {
        spawn: function (dockerCommand) {
          assert(dockerCommand.includes('--config=backstop.config-for-docker.json'));
          done();
          return { on: () => {} };
        }
      }
    });

    const config = {
      args: {
        docker: true,
        config: {
          id: 'i_am_a_config_object'
        }
      }
    };

    runDocker(config, 'test');
  });
});
