let openLoader;

module.exports = function open (...args) {
  openLoader ||= import('open').then(module => module.default);
  return openLoader.then(open => open(...args));
};
