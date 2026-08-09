import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'GOG-to-GOG-games',
    description: 'Add an "Install" button to the GOG website that allows users to directly install game files from gog-games.to.',
    version: '2.0.0',
    permissions: [],
    host_permissions: [
      'https://gog-games.to/*',
      'https://www.gog.com/*'
    ],
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    }
  }
});
