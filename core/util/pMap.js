let pMapLoader;

module.exports = function pMap (...args) {
  pMapLoader ||= import('p-map').then(module => module.default);
  return pMapLoader.then(pMap => pMap(...args));
};
