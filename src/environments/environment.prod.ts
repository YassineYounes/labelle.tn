/**
 * Production environment. Points at the live Symfony backend that also hosts
 * the inventory back-office. Swapped in for environment.ts at build time via
 * the `fileReplacements` entry in angular.json (production configuration).
 */
export const environment = {
  production: true,
  apiBase: 'https://inventory.labelle.tn/ws/public/index.php',
  assetBase: 'https://inventory.labelle.tn/ws/public',
};
