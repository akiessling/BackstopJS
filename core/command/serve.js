const logger = require('../util/logger')('serve');
const path = require('path');
const fs = require('fs');
const express = require('express');
const portfinder = require('portfinder');
const open = require('opn');

module.exports = {
  execute: function (config) {
    const reportPath = path.resolve(config.html_report);
    const indexPath = path.join(reportPath, 'index.html');

    if (!fs.existsSync(reportPath)) {
      const msg = `Error: Report directory not found at ${reportPath}. Please run 'backstop test' or 'backstop regenerateReport' first.`;
      logger.error(msg);
      return Promise.reject(new Error(msg));
    }

    if (!fs.existsSync(indexPath)) {
      const msg = `Error: index.html not found in ${reportPath}. The report may be incomplete.`;
      logger.error(msg);
      return Promise.reject(new Error(msg));
    }

    return new Promise(function (resolve, reject) {
      portfinder.basePort = process.env.BACKSTOP_REMOTE_HTTP_PORT || 3000;
      portfinder.getPort((err, port) => {
        if (err) {
          logger.error('Error finding a free port:', err);
          return reject(err);
        }

        const app = express();
        const parentPath = path.dirname(reportPath);
        const reportFolder = path.basename(reportPath);

        // Load remote middleware
        const middleware = require('../../remote/index');
        middleware(app, {
          config,
          configPath: config.backstopConfigFileName
        });

        // Serve parent directory to allow relative access to sibling image folders
        app.use(express.static(parentPath));

        // Fallback: also serve the report folder itself at the root for standard index.html resolution
        app.use(express.static(reportPath));

        // Listen on 0.0.0.0 to handle both IPv4 and IPv6/localhost correctly
        app.listen(port, '0.0.0.0', (err) => {
          if (err) {
            logger.error('Error starting report server:', err);
            return reject(err);
          }

          const url = `http://127.0.0.1:${port}/${reportFolder}/index.html?remote`;
          logger.log(`Report server started at: ${parentPath}`);
          logger.log(`Report available at: ${url}`);

          open(url, { wait: false });

          logger.log('Press Ctrl + C to exit.');
          // Process remains open as long as the promise is pending.
        });
      });
    });
  }
};
