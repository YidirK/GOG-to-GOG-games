/**
 * DOM Manipulation and SPA URL Listener utilities for GOG extension.
 */

export function observeUrlChanges(onUrlChange: (newUrl: string) => void): () => void {
  let currentUrl = window.location.href;

  const checkUrl = () => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      onUrlChange(currentUrl);
    }
  };

  // Intercept pushState and replaceState for SPA routing detection
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    checkUrl();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    checkUrl();
  };

  window.addEventListener('popstate', checkUrl);

  // Interval check fallback for quiet client-side navigations
  const intervalId = setInterval(checkUrl, 1000);

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener('popstate', checkUrl);
    clearInterval(intervalId);
  };
}

export function getGameTitleFromDOM(): string {
  // 1. Try GOG main title header
  const h1 = document.querySelector('h1.productcard-basics__title, h1[class*="title"]');
  if (h1 && h1.textContent?.trim()) {
    return h1.textContent.trim();
  }

  // 2. Try Open Graph title meta tag
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    const content = ogTitle.getAttribute('content');
    if (content) return content.replace(/\s*on\s+GOG\.com/i, '').trim();
  }

  // 3. Fallback to document title
  return document.title.replace(/\s*on\s+GOG\.com/i, '').trim();
}

const CUSTOM_BTN_ID = 'gog-dl-install-button';

export function injectOrUpdateInstallButton(isAvailable: boolean, targetSlug: string): void {
  // 1. Check if GOG native install-button elements exist in DOM (legacy selector support)
  const legacyButtons = document.getElementsByClassName('install-button');
  if (legacyButtons && legacyButtons.length > 0) {
    const legacyBtn = legacyButtons[0] as HTMLElement;
    legacyBtn.classList.remove('ng-hide', 'is-hidden', 'hidden');

    if (isAvailable) {
      legacyBtn.textContent = 'Install from gog-games.to';
      legacyBtn.style.cursor = 'pointer';
      legacyBtn.style.opacity = '1';
      legacyBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`https://gog-games.to/game/${targetSlug}`, '_blank');
      };
    } else {
      legacyBtn.textContent = 'Not available on gog-games.to';
      legacyBtn.style.cursor = 'not-allowed';
      legacyBtn.style.opacity = '0.6';
      legacyBtn.onclick = null;
    }
    return;
  }

  // 2. Custom Modern Button Injection into GOG Action Area
  let customBtn = document.getElementById(CUSTOM_BTN_ID) as HTMLAnchorElement | null;

  if (!customBtn) {
    customBtn = document.createElement('a');
    customBtn.id = CUSTOM_BTN_ID;
    customBtn.className = 'gog-dl-btn';
  }

  // Style custom button to look native & high-end
  customBtn.style.display = 'inline-flex';
  customBtn.style.alignItems = 'center';
  customBtn.style.justifyContent = 'center';
  customBtn.style.gap = '8px';
  customBtn.style.padding = '10px 20px';
  customBtn.style.margin = '10px 0';
  customBtn.style.borderRadius = '4px';
  customBtn.style.fontWeight = '700';
  customBtn.style.fontSize = '14px';
  customBtn.style.textDecoration = 'none';
  customBtn.style.transition = 'all 0.2s ease-in-out';
  customBtn.style.fontFamily = 'Lato, sans-serif';

  if (isAvailable) {
    customBtn.textContent = '⬇ Install (gog-games.to)';
    customBtn.href = `https://gog-games.to/game/${targetSlug}`;
    customBtn.target = '_blank';
    customBtn.style.backgroundColor = '#86328a';
    customBtn.style.color = '#ffffff';
    customBtn.style.cursor = 'pointer';
    customBtn.style.boxShadow = '0 2px 8px rgba(134, 50, 138, 0.4)';

    customBtn.onmouseenter = () => {
      customBtn!.style.backgroundColor = '#9b39a0';
      customBtn!.style.transform = 'translateY(-1px)';
    };
    customBtn.onmouseleave = () => {
      customBtn!.style.backgroundColor = '#86328a';
      customBtn!.style.transform = 'none';
    };
  } else {
    customBtn.textContent = '❌ Not available on gog-games.to';
    customBtn.removeAttribute('href');
    customBtn.target = '';
    customBtn.style.backgroundColor = '#3b3b3b';
    customBtn.style.color = '#a0a0a0';
    customBtn.style.cursor = 'not-allowed';
    customBtn.style.boxShadow = 'none';
    customBtn.onmouseenter = null;
    customBtn.onmouseleave = null;
  }

  // Inject into target container if not yet attached
  if (!customBtn.parentElement) {
    const targetContainer = document.querySelector(
      '.product-actions, .product-actions-buy-box, .buy-box, .productcard-basics'
    );
    if (targetContainer) {
      targetContainer.appendChild(customBtn);
    } else {
      // Fallback injection near main title
      const titleEl = document.querySelector('h1');
      if (titleEl && titleEl.parentElement) {
        titleEl.parentElement.appendChild(customBtn);
      }
    }
  }
}
