import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Bootstrap token from URL query param (for iframe integration).
// Must run before Angular initialises so all services find the token in localStorage.
const _urlParams = new URLSearchParams(window.location.search);
const _urlToken = _urlParams.get('token');
if (_urlToken) {
  localStorage.setItem('token', _urlToken);
  // Remove token from the address bar so it doesn't leak via history or copy-paste.
  window.history.replaceState(
    {},
    '',
    window.location.pathname + window.location.hash
  );
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
