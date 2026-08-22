import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store.js';

import App from './components/App';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
