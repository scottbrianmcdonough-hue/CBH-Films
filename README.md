# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npm run render:hythe          # out/hythe-imperial.mp4 (full film, ~35s)
npm run render:hythe-story    # out/hythe-imperial-story.mp4 (Stories, <15s)
npm run render:film -- <id>   # any film by composition id
npm run render                # out/slides.mp4 (the original three-slide demo)
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Hotel films

CBH hotel promo films (1080x1920, 30fps) are data-driven. `src/hotel-film/` is the engine: it
renders a `FilmSpec` (scenes, captions, camera moves, cut points, transitions, music). Each hotel
is one spec file in `src/hotels/`, with its photos and music in `public/hotels/<slug>/`, so a new
hotel means new photos, copy and music timings, not new code.

The process and house standards are in `.claude/skills/hotel-film/SKILL.md`. In short: CBH gold on
black, Cormorant Garamond and Open Sans (bundled in `public/fonts/`), full-bleed photos with slow
moves, a stacked three-room triptych, crossfades with at most three signature transitions, cuts on
the music's bar starts with the music fading over the final bar, captions kept clear of the
Reels/TikTok UI, and a Stories cut under 15s.

Tools:

- `scripts/analyze-beats.py <track>`: tempo, bar starts and likely phrase starts in video frames,
  plus loudness (needs `pip install librosa`).
- `scripts/render-film.sh <id>`: render and export via `scripts/to-mp4.sh` (H.264, standard-range
  yuv420p, AAC, faststart; needs `ffmpeg`).
- `public/brand/`: the official CBH primary logo (SVG) for dark and light backgrounds;
  `cbh-logo-gold.svg` is its gold paths only, used as the end-card shimmer mask.

### Hythe Imperial

`src/hotels/hythe-imperial.ts`: aerial, three-room triptych, champagne bar (with golden fizz), bar
interior, Coast Restaurant, spa, end card. The soundtrack is "Night Jazz Club" by Elisaveta
Stoycheva (first 45s, ~89 BPM).

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
