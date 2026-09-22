# Rambling

A mobile-first, frontend-only music diary concept. A song captures a Moment; each Moment becomes a vinyl sleeve with a readable diary inside.

## Run

Use Node.js 22.12 or newer (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Demo journey

1. Open the player and choose **Rambling** beside the song details.
2. Swipe between **制作黑胶** and **我的黑胶**, or use the tabs.
3. Create a Moment. Its song and original timestamp are captured and locked.
4. Write a continuous diary with heading, subheading, and body blocks. Insert photos or decorations at the cursor and continue typing below them. Add selected-text highlights, one of five mood faces with your own label, and a sleeve style or local cover image.
5. Save and find the Moment in My vinyls.
6. Browse Week, Month (shelf or grid), or the twelve-month Year archive.
7. Pull out a sleeve, put it back, or open its vinyl to enter Reading Mode.
8. Pause/resume the rotating record, favorite the Moment, or edit it again.

The fictional tracks use simulated playback. No audio service, backend, authentication, or external music API is used. Eighteen fictional Moments are seeded relative to the first visit. The interface, dates, and seeded diaries use Simplified Chinese; song names retain their original language. Artwork and fonts are bundled locally. Uploaded images remain on the device; images up to 25 MB are resized to at most 1200 pixels and compressed before storage. Browser localStorage persists saved Moments; clearing site data removes them. Storage errors keep the editor draft available and show a retry message.

`Moment.blocks` stores ordered text, image, and sticker blocks independently of the editor. Legacy text/photos/stickers still render and are converted when edited. `sleeveImage` affects only the sleeve; the record center always uses the locked song artwork. Existing user-written diaries are preserved during localization.

## Architecture

- `src/types`: independent Song, Mood, and Moment domain types.
- `src/store`: creation, immutable song/timestamp protection, validation, and tests.
- `src/data`: fictional songs, moods, and seeded diary entries.
- `src/components`: shared record, sleeve, and diary rendering.
- `src/pages`: player, editor, collection, and reading screens.
- `src/App.tsx`: navigation, playback state, and localStorage boundary.
- `public`: local artwork, fonts, and favicon.

The app uses React, TypeScript, Vite, Framer Motion, Lucide icons, and plain CSS. The simple storage boundary can later be replaced without changing the Moment model or presentation components. There is intentionally no production infrastructure.

## GitHub Pages

Repository: [RheaLuang/music_mood_beta](https://github.com/RheaLuang/music_mood_beta) (`main`).

`.github/workflows/deploy.yml` installs dependencies, runs tests, builds, uploads the static artifact, and deploys to GitHub Pages. It runs on `main`, `master`, or manual dispatch. GitHub Actions is configured as this repository's Pages source.

Vite uses a relative base (`./`) so bundled JavaScript, CSS, fonts, and artwork work below `/music_mood_beta/`. Navigation uses URL hashes, avoiding server-side route fallback requirements. Reading links can be refreshed on the same device where their local Moment exists.

Live demo: [https://rhealuang.github.io/music_mood_beta/](https://rhealuang.github.io/music_mood_beta/)

## Verification

- TypeScript check and production build passed.
- Unit tests cover immutable captured songs/timestamps, duplicate song Moments, and stored-data validation.
- Dependency audit reports no known vulnerabilities for the installed versions.
- Browser checks covered creation, writing, optional title removal, highlighting, stickers, mood selection, sleeve customization, photo insertion, saving, editing, shelf inspection/return/opening, reading, pause/resume, favorites, refresh persistence, and year-to-month navigation.
- Production preview tested under `/music_mood_beta/`, including local artwork and phone viewport layout.
- GitHub Actions build and deployment succeeded. The live site was checked for Now Playing, Moment creation and saving, Month shelf inspection, Reading Mode, playback pause, and Year navigation.

## Assets

Original fictional diary writing and song names were created for this prototype. The user's diary reference informed only the fixed date/time hierarchy, whitespace, and editorial styling; its diary text was not copied.

Demo photographs are bundled from Unsplash image endpoints:

- Lake/boat: `photo-1476514525535-07fb3b4ae5f1`
- Forest: `photo-1448375240586-882707db888b`
- Mountain: `photo-1464822759023-fed622ff2c3b`
- Sea: `photo-1518837695005-2083093ee35b`

DM Sans and Libre Caslon Display are bundled from Google Fonts under the SIL Open Font License; license files are in `public/fonts`.
