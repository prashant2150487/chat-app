# ChatApp Desktop

Electron + React + Vite desktop client for ChatApp.

## Prerequisites

- Node.js 20+
- npm

## Development

From this directory (`app/desktop`):

```bash
npm install
npm run dev
```

This starts the Vite dev server and opens the Electron window automatically.

From the repo root:

```bash
npm run desktop
```

## Verify preload bridge

In the Electron DevTools console:

```js
window.electronAPI.getAppVersion()
window.electronAPI.getPlatform()
```

## Production build

```bash
npm run electron:build
```

Output is written to `release/`.

## Project structure

```
electron/
  main.cjs      # Electron main process
  preload.cjs   # Secure bridge to renderer
src/            # React renderer (Vite)
```
