const initialState = {
  imageWidth: 400
};

const visibilityFilter = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return Object.assign({}, state, {
        [action.id]: !state[action.id]
      });

    case 'UPDATE_IMAGE_WIDTH':
      return Object.assign({}, state, {
        imageWidth: action.value
      });

    case 'UPDATE_IMAGE_HEIGHT':
      return Object.assign({}, state, {
        imageHeight: action.value
      });

    case 'TOGGLE_ALL_IMAGES':
      return Object.assign({}, state, {
        refImage: action.value,
        testImage: action.value,
        diffImage: action.value
      });

    default:
      return state;
  }
};

export default visibilityFilter;
