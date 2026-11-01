import type { FootageSpec } from "../hotel-film/footage/types";

// Oakley Hall Hotel, near Basingstoke, Hampshire (Classic British Hotels): a dog-friendly
// Instagram/Facebook Story built on Scott's phone clip (IMG_4406, iPhone 15 Pro, 30 Apr
// 2026, GPS 51.2446 N 1.2004 W): a cavapoo sits on the lawn with the hall behind, then trots
// up to the camera. Transcoded to 1080x1920 H.264 with its audio stripped. Dog only: the
// Story ends as the dog reaches the camera (a restaurant photo after it was dropped as
// adding nothing). Copy drafted by Scott, from the Oakley Hall CBH page:
// dogs stay in designated dog-friendly Courtyard rooms, each set up with a bed, blanket,
// water and food bowls, a bag of treats and waste bags; dogs are welcome on the Glasshouse
// Restaurant's outdoor Garden Terrace and in the dog-friendly area of the restaurant; £35
// per dog per stay (kept off the asset); dogs on a lead in public areas.
//
// Music: "Upbeat Acoustic" by The_Mountain (Pixabay Content License), ~123 BPM (a bar every
// ~58.5 frames), trimmed to 25s. Its clean groove (8-22.4s, no lead line; a melody enters
// at ~24s) carries the film: downbeats at 9.01, 10.94 ... 16.70, 18.62, 20.53, 22.45s. The
// text lands on the 10.94s downbeat and the film ends on the 18.62s one, the clip's last
// frame, with the music faded over the last bar.

const P = "hotels/oakley-hall";

export const oakleyHallStory: FootageSpec = {
  id: "oakley-hall-story",
  music: {
    src: `${P}/upbeat-acoustic.mp3`,
    trimmedSeconds: 25,
    startAt: 235, // 7.83s: the 18.62s downbeat lands on the last frame
    gain: 0.75, // ~-15 LUFS (the track is -11.2)
    fadeFrom: 266, // the 16.70s downbeat: fade over the last bar
  },
  // The whole clip: it ends (10.8s) with the dog's face filling the frame.
  cuts: [],
  durationInFrames: 324, // 10.8s
  crossfade: 24,
  shots: [{ kind: "video", src: `${P}/dog-on-the-lawn.mp4`, from: 0 }],
  block: {
    eyebrow: "Bed, bowls and treats waiting",
    headline: "Room for one more",
    line: "Oakley Hall Hotel, Hampshire",
    at: 93, // the 10.94s downbeat, once the paw prints have faded
    until: 294, // clears as the dog gets up, so its face isn't under the text at the end
  },
  // Gold paw prints trot up the lawn to the dog as the Story opens, gone before the text.
  paws: { from: [760, 1880], to: [590, 1180] }, // clear of the CB mark
  // The CB watermark, grid-safe Stories spec; no end card, so the brand appears once.
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
