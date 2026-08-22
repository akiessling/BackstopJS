const { styleText } = require('node:util');

function color (format) {
  return value => styleText(format, String(value));
}

module.exports = {
  blue: color('blue'),
  green: color('green'),
  grey: color('gray'),
  magenta: color('magenta'),
  red: color('red'),
  reset: String,
  white: color('white'),
  yellow: color('yellow')
};
