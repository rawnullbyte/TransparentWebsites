# Transparent Websites

A lightweight, real-time extension that dynamically scans and injects transparency styling into web pages. It automatically discovers structure layout elements, wrapper classes, and custom CSS variables to apply a transparent theme across websites.

## Features

- **Dynamic DOM Scanning**: Instantly scans web elements, classes, and inline styles for layout wrappers, background properties, and custom CSS variables.
- **Persistent Preferences**: Saves your transparency settings per domain using `chrome.storage.local`.
- **Real-Time Toggle**: Click the extension icon to seamlessly flip the transparency layout on or off without needing a full page reload.
- **Smart Extension Badges**: Visual indicators (`ON` in green / `OFF` in red) update dynamically on your browser toolbar based on the active tab's domain status.

## Architecture & Codebase

The extension relies on two core scripts working in tandem:

1. **Content Script (`scanner.js`)**: Runs directly within the webpage context. Collects structural elements (e.g., containers, streams, search blocks), isolates style variables, and dynamically injects/removes a dedicated style element (`#dynamic-transparency-css`).
2. **Background Service Worker (`background.js`)**: Tracks tab activation and navigation changes to update toolbar badges. Intercepts toolbar clicks to persist user configurations and coordinates real-time state changes with the content script.
