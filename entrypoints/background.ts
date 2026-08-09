import { defineBackground } from 'wxt/sandbox';
import { browser } from 'wxt/browser';
import { findGameAvailability } from '../utils/api';

// Typed request shape for messaging
interface CheckAvailabilityRequest {
  action: 'checkAvailability';
  slug: string;
  title?: string;
}

export default defineBackground(() => {
  console.log('[GOG-to-GOG-games] Service worker initialized.');

  // Use `as any` cast on the listener to bypass WXT's strict `OnMessageListenerCallback`
  // return-type constraint (it only allows `true`, not `boolean`).
  // Runtime behaviour is identical: we return `true` for async and nothing otherwise.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  browser.runtime.onMessage.addListener(((
    request: unknown,
    _sender: unknown,
    sendResponse: (response?: unknown) => void
  ) => {
    const req = request as Partial<CheckAvailabilityRequest>;
    if (req && req.action === 'checkAvailability' && req.slug) {
      const { slug, title } = req as CheckAvailabilityRequest;
      console.log('[GOG-to-GOG-games] Checking availability for:', { slug, title });

      findGameAvailability(slug, title)
        .then((res) => sendResponse(res))
        .catch((err) => {
          console.error('[GOG-to-GOG-games] Background query error:', err);
          sendResponse({ available: false });
        });

      return true as const; // keep channel open for async sendResponse
    }
    // No return / undefined → WXT treats this as synchronous/no-response
  }) as Parameters<typeof browser.runtime.onMessage.addListener>[0]);
});

