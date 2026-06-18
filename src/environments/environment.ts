/**
 * Development environment.
 *
 * `apiBase` is the Symfony backend entry point (same backend the inventory
 * back-office uses). The storefront only ever calls the public /api/shop/*
 * routes. `assetBase` is the origin that serves uploaded product images,
 * i.e. apiBase without the trailing /index.php.
 */
export const environment = {
  production: false,
  apiBase: 'http://127.0.0.1:8765/index.php',
  assetBase: 'http://127.0.0.1:8765',
};
