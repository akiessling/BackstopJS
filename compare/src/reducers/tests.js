const applyFiltersAndSort = (all, status, searchValue, minDiff, sortMethod) => {
  let filtered = [...all];

  // Status Filter
  if (status !== 'all') {
    filtered = filtered.filter(test => test.status === status);
  }

  // Search Filter
  if (searchValue && searchValue.length > 0) {
    const search = searchValue.toLowerCase();
    filtered = filtered.filter(test => {
      const label = (test.pair && test.pair.label || '').toLowerCase();
      const fileName = (test.pair && test.pair.fileName || '').toLowerCase();
      return label.includes(search) || fileName.includes(search);
    });
  }

  // Diff Filter
  if (minDiff > 0) {
    filtered = filtered.filter(test => {
      const misMatch = (test.pair && test.pair.diff && test.pair.diff.misMatchPercentage) || 0;
      return parseFloat(misMatch) >= parseFloat(minDiff);
    });
  }

  // Sorting
  if (sortMethod && sortMethod !== 'default') {
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortMethod.startsWith('diff')) {
        valA = parseFloat((a.pair && a.pair.diff && a.pair.diff.misMatchPercentage) || 0);
        valB = parseFloat((b.pair && b.pair.diff && b.pair.diff.misMatchPercentage) || 0);
      } else if (sortMethod.startsWith('label')) {
        valA = (a.pair && a.pair.label || '').toLowerCase();
        valB = (b.pair && b.pair.label || '').toLowerCase();
      }

      if (valA < valB) return sortMethod.endsWith('Asc') ? -1 : 1;
      if (valA > valB) return sortMethod.endsWith('Asc') ? 1 : -1;
      return 0;
    });
  }

  return filtered;
};

const tests = (state = { all: [], filtered: [], filterStatus: 'all', searchValue: '', minDiff: 0, sortMethod: 'default' }, action) => {
  let newState;
  switch (action.type) {
    case 'APPROVE_TEST':
      newState = Object.assign({}, state, {
        all: state.all.map(test => {
          if (test.pair && (test.pair.fileName === action.id)) {
            return Object.assign({}, test, { status: 'pass' });
          }
          return test;
        })
      });
      break;

    case 'FILTER_TESTS':
      newState = Object.assign({}, state, { filterStatus: action.status });
      break;

    case 'SEARCH_TESTS':
      newState = Object.assign({}, state, { searchValue: action.value });
      break;

    case 'FILTER_BY_DIFF':
      newState = Object.assign({}, state, { minDiff: action.percent });
      break;

    case 'SORT_TESTS':
      newState = Object.assign({}, state, { sortMethod: action.method });
      break;

    default:
      return state;
  }

  // After any relevant action, re-apply all filters and sorts
  return Object.assign({}, newState, {
    filtered: applyFiltersAndSort(
      newState.all,
      newState.filterStatus,
      newState.searchValue,
      newState.minDiff,
      newState.sortMethod
    )
  });
};

export default tests;
