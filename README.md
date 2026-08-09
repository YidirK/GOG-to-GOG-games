<p align="center">
  <img src="/logo.png" alt="logo" width="200"/>
</p>

# GOG-to-GOG-games

---
An extension that add an “Install” button to the GOG website that allows users to directly install game files from the site.

If you like this project, consider giving it a star ⭐ or a tip if you feel generous!

---
## 📥 Installation on Chrome, Edge, Brave, or any other Chromium-based browser

[![Download Extension](https://img.shields.io/badge/⬇️_Download-Releases-blue?style=for-the-badge&logo=github)](https://github.com/YidirK/GOG-to-GOG-games/releases)

For now, you need to install it in developer mode, but it will be available on the stores soon.


## 📥 Installation on Firefox Browser

[![Download Extension](https://img.shields.io/badge/⬇️_Download-Releases-orange?style=for-the-badge&logo=firefox)](https://github.com/YidirK/GOG-to-GOG-games/releases)

For now, you need to install it in developer mode, but it will be available on the stores soon.


---

# 📝 Changelog

## [2.0.0] - 2026-08-09

### ⚡ Migrated to WXT (Vite + TypeScript)
- Replaced the separate `chromium/` and `firefox/` folders with a single unified **WXT** project
- Chrome (Manifest V3) and Firefox (Manifest V2) builds are now generated automatically via `wxt build`
- Added TypeScript across the entire codebase for type safety

### 🔍 Improved Game Discovery (4-Stage Lookup)
The extension can now find far more games by trying multiple slug variants before giving up:
1. **Direct slug** — exact match from the GOG URL
2. **Separator swap** — retries with `_` → `-` and `-` → `_`
3. **Edition suffix stripping** — removes common suffixes (`_complete_edition`, `_goty_edition`, `_remastered`, `_definitive_edition`, `_deluxe_edition`, `_ultimate_edition`, `_gold_edition`, `_enhanced_edition`, `_special_edition`, `_anniversary_edition`, `_director_s_cut`, etc.) and retries
4. **Text search fallback** — queries the search API using the game title scraped from the GOG page DOM (`<h1>` or `<meta og:title>`)

### 🚀 SPA Navigation Support
- The extension now detects Single Page Application (SPA) navigation on GOG (no more missing buttons when browsing between games without a full page reload)
- Implemented via `history.pushState` / `history.replaceState` patching, `popstate` listener, and a `MutationObserver` with debounce

### 🧠 Session Caching
- Availability results are cached in memory per slug for the duration of the session, eliminating redundant network requests when revisiting the same game page

### 🎨 Smarter Button Injection
- The button injector first attempts to reuse the existing GOG native install button element
- Falls back to injecting a styled custom button into the GOG product action container
- Button styling matches GOG's native purple color scheme with hover animations

---

## [1.0.1] - 2025-10-18

- Now the extension works for Firefox too

---

## [1.0.0] - 2025-10-01

- Initial release for Chromium-based browsers

---

## 🛠️ Development

This project uses [WXT](https://wxt.dev/) (Vite + TypeScript).

```bash
npm install             # Install dependencies

npm run dev             # Dev mode — Chrome (live reload)
npm run dev:firefox     # Dev mode — Firefox (live reload)

npm run build           # Production build — Chrome MV3 → .output/chrome-mv3/
npm run build:firefox   # Production build — Firefox MV2 → .output/firefox-mv2/

npm run zip             # Package for Chrome Web Store
npm run zip:firefox     # Package for Firefox Add-ons

npm run compile         # TypeScript type check (no emit)
```

---

##  🤝 Contributing
Contributions are welcome! Feel free to submit a Pull Request or report an issue.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
### ⭐ Enjoying the extension? Show your support with a star — or a tip if you feel generous! ⭐
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S61G68F3)