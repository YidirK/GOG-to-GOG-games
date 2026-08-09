import { defineContentScript } from 'wxt/sandbox';
import { browser } from 'wxt/browser';
import { extractSlugFromUrl } from '../utils/slug';
import { observeUrlChanges, getGameTitleFromDOM, injectOrUpdateInstallButton } from '../utils/dom';
import type { GameCheckResponse } from '../utils/api';

export default defineContentScript({
  matches: ['https://www.gog.com/*/game/*', 'https://www.gog.com/game/*'],

  main() {
    console.log('[GOG-to-GOG-games] Content script initialized on GOG page.');

    let isProcessing = false;

    const processCurrentPage = async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        const slug = extractSlugFromUrl(window.location.href);
        if (!slug) {
          isProcessing = false;
          return;
        }

        const title = getGameTitleFromDOM();
        console.log('[GOG-to-GOG-games] Page details:', { slug, title });

        const response = await browser.runtime.sendMessage({
          action: 'checkAvailability',
          slug,
          title
        }) as GameCheckResponse;

        if (response && response.available) {
          injectOrUpdateInstallButton(true, response.targetSlug || slug);
        } else {
          injectOrUpdateInstallButton(false, slug);
        }
      } catch (err) {
        console.error('[GOG-to-GOG-games] Error processing page:', err);
      } finally {
        isProcessing = false;
      }
    };

    // Initial check
    processCurrentPage();

    // Listen for SPA navigation
    observeUrlChanges(() => {
      console.log('[GOG-to-GOG-games] SPA navigation event triggered.');
      processCurrentPage();
    });

    // Re-inject button if GOG re-renders component tree
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const buttonExists =
          document.getElementById('gog-dl-install-button') !== null ||
          document.getElementsByClassName('install-button').length > 0;

        if (!buttonExists) {
          processCurrentPage();
        }
      }, 500);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});
