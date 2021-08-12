import React from 'react';
import ReactDOM from 'react-dom';

import { environment } from './environments/environment';
import App from './app/app';

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);
