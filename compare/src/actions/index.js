export const approveTest = id => {
  return {
    type: 'APPROVE_TEST',
    id
  };
};

export const filterTests = status => {
  return {
    type: 'FILTER_TESTS',
    status
  };
};

export const findTests = value => {
  return {
    type: 'SEARCH_TESTS',
    value
  };
};

export const updateSettings = id => {
  return {
    type: 'UPDATE_SETTINGS',
    id
  };
};

export const toggleAllImages = value => {
  return {
    type: 'TOGGLE_ALL_IMAGES',
    value
  };
};

export const openModal = value => {
  return {
    type: 'OPEN_SCRUBBER_MODAL',
    value
  };
};

export const closeModal = value => {
  return {
    type: 'CLOSE_SCRUBBER_MODAL',
    value
  };
};

export const showScrubberTestImage = value => {
  return {
    type: 'SHOW_SCRUBBER_TEST_IMAGE',
    value
  };
};

export const showScrubberRefImage = value => {
  return {
    type: 'SHOW_SCRUBBER_REF_IMAGE',
    value
  };
};

export const showScrubberDiffImage = value => {
  return {
    type: 'SHOW_SCRUBBER_DIFF_IMAGE',
    value
  };
};

export const showScrubberDivergedImage = value => {
  return {
    type: 'SHOW_SCRUBBER_DIVERGED_IMAGE',
    value
  };
};

export const showScrubber = value => {
  return {
    type: 'SHOW_SCRUBBER',
    value
  };
};

export const openLogModal = value => {
  return {
    type: 'OPEN_LOG_MODAL',
    value
  };
};

export const updateImageWidth = value => {
  return {
    type: 'UPDATE_IMAGE_WIDTH',
    value
  };
};

export const updateImageHeight = value => {
  return {
    type: 'UPDATE_IMAGE_HEIGHT',
    value
  };
};

export const closeLogModal = value => {
  return {
    type: 'CLOSE_LOG_MODAL',
    value
  };
};

export const sortTests = method => {
  return {
    type: 'SORT_TESTS',
    method
  };
};

export const filterByDiff = percent => {
  return {
    type: 'FILTER_BY_DIFF',
    percent
  };
};

export const toggleViewport = viewportLabel => {
  return {
    type: 'TOGGLE_VIEWPORT',
    viewportLabel
  };
};

export const acknowledgeTest = (id, status) => {
  return {
    type: 'ACKNOWLEDGE_TEST',
    id,
    status
  };
};
