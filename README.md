# Wanted Poster Generator — Vice City PD

A GTA VI-inspired experience built for the [Build with React Image Editor Challenge](https://github.com/unlayer/react-image-editor).

Upload a mugshot, and the app books your suspect into a Vice City Police Department
wanted poster — aged paper, a mugshot frame, a police-bulletin header — then hands
the poster straight to the **Unlayer React Image Editor** so you can add the suspect's
name, charges, and bounty with the text tool, stamp it, crop it, or run it through a
filter. Finished posters get pinned to a "precinct board" gallery saved on your device.

**#BuiltWithImageEditor**

## Live demo

`<ADD YOUR DEPLOYED LINK HERE AFTER DEPLOYING>`

## How it uses React Image Editor

- `@unlayer/react-image-editor`'s `<ImageEditor />` component is the core editing
  surface — see [`src/App.jsx`](./src/App.jsx).
- Before the editor loads, [`src/lib/composePoster.js`](./src/lib/composePoster.js)
  composites the user's uploaded photo onto a hand-drawn poster frame (paper texture,
  border, "WANTED" header, footer) using the Canvas API, so the editor opens on a real
  poster rather than a bare photo.
- Inside the editor, users customize the poster with the built-in tools: **Text** (name,
  charges, bounty), **Stamps/Stickers**, **Shapes**, **Filters**, **Crop**, and **Draw**.
- `onSave` receives the flattened `dataUrl`/`blob` of the finished poster, which the app
  then displays, offers as a download, and saves into a local gallery
  (see [`src/lib/gallery.js`](./src/lib/gallery.js)).

## Requirement checklist

- [x] Original GTA VI-inspired experience (Vice City PD wanted-poster bulletin board)
- [x] React Image Editor used as a core part of the implementation
- [x] Users can edit/customize a visual (poster text, stamps, filters, crop)
- [x] Public GitHub repo with this README
- [ ] Deployed with a working live link — add your link above after deploying
- [ ] Shared with `#BuiltWithImageEditor` (optional)

## Running locally

Requires Node.js 18+ and React 18+ (this project uses React 19).

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Building for production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

The build output goes to `dist/`.

## Deploying

This is a standard Vite + React app, so it deploys as-is to Vercel or Netlify:

**Vercel**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --build
```

No environment variables are required — the app runs entirely client-side and only
uses React Image Editor's free manual editing tools (no `projectId` / AI Assistant
configured). To enable the paid AI Assistant, add your Unlayer `projectId` to the
`options` prop in `src/App.jsx`.

## Project structure

```
src/
  App.jsx              Main flow: upload → customize → result, plus the gallery
  App.css              Vice City bulletin-board styling
  lib/
    composePoster.js   Canvas compositing: photo + poster frame → base image
    gallery.js         localStorage-backed "precinct board" gallery
  main.jsx             React entry point
```

## Credits

Built with [Unlayer's React Image Editor](https://github.com/unlayer/react-image-editor).
Not affiliated with or endorsed by Rockstar Games.
