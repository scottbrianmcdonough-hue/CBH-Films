import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import { LOGOS } from "./logos";
import { BIG25, BIGYEARS, DIAMOND, LOCKUP } from "./mark25";

// Nick Saunders's wordmark on the thank-you card (as on his speaker card)
loadFont({ family: "Source Serif 4", url: staticFile("fonts/SourceSerif4-Bold.woff2"), weight: "700" });

// The post-AMC reel, AMC 2026 (the 25th Anniversary AMC, Forest of Arden, 19 Oct). Third cut
// (Scott: "you already made a cool collage so the video just keep the momentum ... get creative"):
// the AMC wall come to life. The frame is a wall of panels that rebuilds itself on the beat, one
// shot full frame, then two side by side, a big one over two, each new panel pushing in over the
// last the way the wall's tiles do, with the house text set in a black tile among the photos.
// The day runs in order, morning to night; the host's "And the winner is" over the room, then
// Donnington Group named on the track's big moment and the room's own cheer under the music as
// they go up (the second phone's 1080p clip, steady from the walk-up to the hugs). It ends on the
// giant "25", a window onto the gala team, gold rising through it to land on the track's last hit.
// Polish pass (Scott: "take out the weaker shots"): the exhibitors' backs, the banner, the soft
// Phill close-up, the two distant speakers and the cut-off Donnington trophy photo are out.
// One edit, any track (Scott: "try a few different tracks"): the scenes are in beats, and each
// track says where its big moment is (the name lands there), its beat, and where its ending is.
// People over empty rooms, nothing twice, stills on the barely-there push, corner CB.
// `AmcReel` is the 4:5 LinkedIn cut, `AmcStory` the Story (the awards only).

const A = "campaigns/amc-2026/";
// the room under "And the winner is": the first phone's (awards-donnington.mp4; its sound is out, Scott could
// barely hear Phill) steady pan across the room (30.77-32.43s), in
// real slow motion (0.44x, minterpolate), ending the frame before "Donnington Group" comes up on the
// screen at 32.5s (Scott: "it says Donnington Group on the screen ... it reveals Donnington Group
// before the drop"); the clip before 30.77 drops frames as the phone zooms out
const ROOM_WINNER = { src: "awards-room-winner-slow.mp4", clip: 0.1, stop: 3.65 };
const NAME = 48; // the beat Donnington Group is named on, on the track's big moment
// the winners board: each award holds a beat before the next (Scott: "too fast to read ... hold a beat to register")
// then (Scott: "still too fast to read ... extend the song a beat or two") a beat and a half
const BOARD_AT = 66.3; // the beat the board comes up on (scripts/amc-25-sfx.py reads these three)
const ROWS_AT = 66.8; // the first award's beat
const ROW_EVERY = 2; // beats between awards (Scott: "3 beats longer ... not rushed")
const BOARD_END = 84; // the full board holds from the last award to here
const G = 8; // gutter
const PUSH = 14; // frames a panel takes to push in, centred on its beat
const STAGGER = 3; // frames between the panels of a new layout

export type Track = {
  id: string; // names its sound for the 25 (`sfx/counter-<id>.wav`, scripts/amc-25-sfx.py)
  src: string;
  beat: number; // s a beat
  name: number; // s into the track of its big moment, a downbeat: NAME lands here
  outro: number; // s into the track the end card's music plays from (a downbeat)
  hit: number; // s into the track of its last hit, where the gold lands
  start?: number; // the reel's first beat, if the track is silent at the usual start (-4)
  storyFrom?: number; // beats before the name the Story starts (16: Rachel's welcome)
  storyHold?: number; // frames the Story holds after the hit (95)
  rewindAt?: number; // beats after the name where the music jumps back (a downbeat), if it runs short
  rewindBack?: number; // beats it jumps back
  crash?: number; // s into the track where the thank-you card's CB pops (else Light it Up Boy's last note, 91.475)
  gain?: number; // the track's level against the others (its master may be louder)
  boardTicks?: [number, number]; // s from the winners board coming up to its first award, and between awards (scripts/amc-25-sfx.py), if not the usual beats
};

export const AMC_TRACKS = {
  // Light it Up Boy (Mixkit 849, 119 BPM): even, so the name lands where the horns lift in;
  // the end card jumps on a bar to two bars before the last hit
  light: { id: "light", src: "music/mixkit-light-it-up-boy-849.mp3", beat: 0.5042, name: 58.754, outro: 86.99, hit: 91.24 },
  // Dirty Thinkin' (Mixkit 989, 120 BPM): the night runs through its breakdown (62-69.5s), the
  // name as the band comes back full; the end card back on a bar so its last hit lands the gold
  // (it runs out before the reel does, so 20 beats after the name it goes back 16 beats, on a
  // downbeat, into the same full-band groove, and arrives at its outro on the end card's bar)
  dirty: {
    id: "dirty",
    src: "music/mixkit-dirty-thinkin-989.mp3",
    beat: 0.5,
    name: 70.02,
    outro: 80.02,
    hit: 85.52,
    rewindAt: 20,
    rewindBack: 16,
  },
  // Soul Funky Vibes (soundoffreedom, Pixabay 578186, 120 BPM): two stabs, the band stops dead,
  // "And the winner is" over the quiet pickup, the name as the whole band crashes back in
  soul: {
    id: "soul",
    src: "music/soundoffreedom-soul-funky-vibes-578186.mp3",
    beat: 0.5,
    name: 112.06,
    outro: 172.06,
    hit: 176.06,
  },
  // Attraction (47643651, Pixabay 450602, 104 BPM): the night through its second breakdown
  // (120-128s, the bass out), the name as the kick comes back harder; its last bar stops at 184.66s
  attraction: {
    id: "attraction",
    src: "music/47643651-attraction-nudisco-pop-450602.mp3",
    beat: 0.5769,
    name: 129.28,
    outro: 180.05,
    hit: 184.66,
    start: -2, // the usual start lands on a second of silence (a break bar); its music enters here
  },
  // Glorious (Instrumental Version) by Adelyn Paik (Epidemic Sound; Bianca's pick, 27 Oct: "the edit is spot on,
  // just needs to be to this track"), 154.66 BPM, a grid fitted to its onsets (a beat every 0.387955s from
  // 0.13431s); kick and snare on alternate odd beats, sections starting on beats 4n + 3. The edit keeps its
  // seconds (`glorious()` below): the count over the second chorus, the flags on its last hit (140.20s, beat
  // 361), the night in the bridge, "And the winner is" on the last drum hits before the bridge falls silent,
  // the name as the final chorus crashes in (172.02s, beat 443; `name` here, the takes set their own); the end
  // card jumps to four bars before the song's last hit (196.85s, beat 507) so the CB pops on that hit (202.28s,
  // beat 521), which then rings out
  glorious: {
    id: "glorious",
    src: "music/es-glorious-instrumental-adelyn-paik.mp3",
    beat: 0.387955,
    name: 171.998, // beat 443 on the grid (0.13431s + 0.387955s n, fitted to its strong hits to within 2ms)
    outro: 196.827,
    hit: 202.259,
    crash: 202.259,
    gain: 0.76, // its master is -10.7 LUFS: this sits the film near -15
    boardTicks: [0.387955, 1.163865], // the awards a beat after the board, then three beats apart (`glorious()`)
  },
} satisfies Record<string, Track>;

// The grade (Scott: "give them a grade"): one film from two lights. The day's flat, cool daylight
// warmed (blue down, red up) with a little contrast; the night's neon magenta stage light tamed to
// a warm rose (blue pulled down and into green, so skin comes back), deeper blacks and less
// saturation. Colour matrix, then contrast about a pivot, then saturation, as SVG filters.
type Grade = "day" | "night";
const GRADES: Record<Grade, { m: number[][]; contrast: number; pivot: number; sat: number }> = {
  day: {
    m: [
      [1.04, 0.02, 0, -0.01],
      [0, 1, 0, 0],
      [0, 0, 0.9, 0.01],
    ],
    contrast: 1.06,
    pivot: 0.5,
    sat: 1.04,
  },
  night: {
    m: [
      [0.94, 0.08, 0, 0],
      [0.06, 0.88, 0.12, 0],
      [0.02, 0.2, 0.55, 0.03],
    ],
    contrast: 1.1,
    pivot: 0.45,
    sat: 0.75,
  },
};
const NIGHT = 32; // the beat the night comes in on
const gradeUrl = (g: Grade) => `url(#amc-grade-${g})`;

const GradeFilters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {(Object.keys(GRADES) as Grade[]).map((g) => {
        const { m, contrast, pivot, sat } = GRADES[g];
        const values = m.map(([r, gr, b, o]) => `${r} ${gr} ${b} 0 ${o}`).join(" ") + " 0 0 0 1 0";
        const fn = { type: "linear" as const, slope: contrast, intercept: pivot * (1 - contrast) };
        return (
          <filter key={g} id={`amc-grade-${g}`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={values} />
            <feComponentTransfer>
              <feFuncR {...fn} />
              <feFuncG {...fn} />
              <feFuncB {...fn} />
            </feComponentTransfer>
            <feColorMatrix type="saturate" values={String(sat)} />
          </filter>
        );
      })}
    </defs>
  </svg>
);

type Side = "l" | "r" | "t" | "b" | "pop"; // where a panel comes in from ("pop": cut in on its beat with a punch)
type Media = {
  src: string;
  caption?: Tile; // a small label in the panel's corner
  clip?: number;
  stop?: number; // s into the clip where its usable footage ends: slowed if it would run past
  pos?: string;
  spos?: string; // the Story's crop, where 9:16 needs its own
  zoom?: number;
  whole?: boolean; // the whole width of the photo, softly blurred copy above and below
  szoom?: number; // the Story's zoom, where 9:16 needs its own (with `whole`: towards `pos`)
  edge?: number; // with `whole` and `zoom`, the reel only: the photo's x (0-1) held at the frame's left edge
  pull?: number; // a Ken Burns pull-out: starts at this scale and eases out to the whole frame
  pullTo?: number; // with `whole` and `pull`: the scale the pull-out ends on (else 1, the whole photo)
  a?: number; // with `whole`: the source's aspect, so its soft edges fade on the side it stops short of
  pending?: string; // not here yet: a placeholder card naming the file it waits for
};
type Tile = { caps: string; lines: string[] };
type Content = Media | Tile;
type Layout = "F" | "V2" | "T3" | "B3" | "Q4" | "G6" | "C3"; // C3: three columns; B3: two on top, one wide below
type Scene = {
  b: number;
  layout: Layout;
  from: Side[];
  panels: Content[];
  stagger?: number; // beats between its panels' arrivals (else a few frames: arriving as one)
  swaps?: { b: number; i: number; from: Side; to: Content }[];
  grade?: Grade; // its own grade (else day before the night, night after)
};

const SCENES: Scene[] = [
  // morning: registration, arrivals and Rachel at the welcome stand
  // the desk's steady second at half speed (Scott: stop before the camera pans to the burgundy
  // jacket), then the arrivals, then Rachel at the welcome stand
  // Lorraine at the desk a second longer (Scott), at a third of speed; the arrivals two seconds
  // (Scott: a short look was "too fast"), the time taken from the day wall
  { b: -4, layout: "F", from: ["r"], panels: [{ src: "registration-desk-slow.mp4", clip: 0, stop: 3.1, pos: "30% 50%" }] },
  { b: 2, layout: "F", from: ["r"], panels: [{ src: "registration-arrivals.mp4", clip: 0.3, stop: 2.45 }] },
  { b: 6, layout: "F", from: ["r"], panels: [{ src: "welcome-stand.jpg", pos: "72% 50%" }] },
  // the keynote: Phill, the room under Stronger Together
  {
    b: 10,
    layout: "T3",
    from: ["t", "l", "r"],
    panels: [
      { src: "phill-keynote.mp4", clip: 0.3, pos: "78% 30%", zoom: 1.4 },
      { caps: "THE KEYNOTE", lines: ["Side by side", "since 2001"] },
      { src: "stronger-together-room.jpg", pos: "62% 60%" },
    ],
  },
  // the talks: the sales panel, Louise, the wedding report
  {
    b: 15, // the keynote a beat longer so its tile reads (Scott: "any other labels too quick")
    layout: "T3",
    from: ["t", "l", "r"],
    panels: [
      { src: "sales-panel.mp4", clip: 7.4, pos: "50% 50%" },
      { src: "speaker-lectern.jpg", pos: "50% 30%" },
      { src: "speaker-wedding-report.mp4", clip: 3.0, pos: "50% 40%" },
    ],
  },
  // the day as a wall (Scott: "another collage section"): six tiles building in a half beat
  // apart, then swapping in turn, the day's text in one of them
  {
    b: 19,
    layout: "G6",
    from: ["l", "r", "l", "r", "l", "r"],
    stagger: 0.5,
    panels: [
      { src: "stronger-together-speaker.jpg", pos: "45% 60%" },
      { src: "sales-panel.jpg", pos: "45% 60%" },
      { src: "exhibitors-walk.mp4", clip: 14.0, pos: "40% 50%" },
      { src: "speaker-afternoon.mp4", clip: 0.1, stop: 2.0, pos: "60% 50%" },
      { src: "room-wide.jpg", pos: "50% 60%" },
      { src: "speaker-data.mp4", clip: 2.0, pos: "45% 50%" },
    ],
    swaps: [
      { b: 22, i: 3, from: "r", to: { src: "stronger-together.jpg", pos: "88% 50%" } },
      { b: 24, i: 0, from: "t", to: { src: "exhibitors-walk.mp4", clip: 5.0, pos: "55% 50%" } },
      { b: 26, i: 4, from: "l", to: { caps: "19 OCTOBER 2026", lines: ["25 years,", "one room"] } },
      { b: 28, i: 5, from: "b", to: { src: "venue-flags-terrace.mp4", clip: 1.0, stop: 8.8, pos: "40% 50%" } },
    ],
  },
  // the night: Rachel opens the Gala Awards Dinner (Scott: "make sure she's featured"), then the awards
  // her low-light phone shot, enlarged to fill the frame, went soft on her face (Scott), so it is
  // shown at its full width over its own soft copy, zoomed only part way towards her: smaller
  // than the photo in the reel, about its own size in the Story
  {
    b: 32,
    layout: "F",
    from: ["b"],
    // its left edge held in the gap between "Gala" and "Awards" on the slide (Scott: not "la Awards Dinner")
    panels: [{ src: "rachel-welcome.jpg", whole: true, pos: "80% 45%", spos: "100% 45%", zoom: 1.6, szoom: 1.95, edge: 0.3385 }],
  },
  // the Marketing Champion clip is out (Scott: "fast and doesn't add much"): Rachel holds to the winners
  {
    b: 38, // six beats, three seconds (Scott: "still too quick to register"); the song runs two beats longer
    layout: "V2",
    from: ["t", "b"],
    panels: [
      { src: "winner-imperial.jpg", pos: "50% 50%", caption: { caps: "MARKETING CHAMPION", lines: ["The Imperial"] } },
      { src: "winner-hogarths.jpg", pos: "55% 50%", caption: { caps: "ENQUIRY ACE", lines: ["Hogarths"] } },
    ],
  },
  { b: NAME - 4, layout: "F", from: ["r"], panels: [ROOM_WINNER] },
  { b: NAME, layout: "F", from: ["l"], panels: [{ src: "awards-donnington-1080.mp4", clip: 3.2, stop: 5.7 }] },
  {
    b: NAME + 4,
    layout: "F",
    from: ["b"],
    panels: [{ src: "awards-donnington-1080.mp4", clip: 10.0, stop: 18.4, pos: "78% 50%", spos: "65% 50%" }],
  },
  // the winners on stage (Georgina's only shot, left with the bottle: clean for two seconds),
  // then the winners board over them
  {
    b: NAME + 14,
    layout: "T3",
    from: ["t", "l", "r"],
    panels: [
      { src: "winners-stage.jpg", pos: "79% 45%" }, // clear of the sound man at the left (Scott)
      { src: "table-3-selfie.jpg", pos: "50% 50%" },
      { src: "team-balloons-25-years-wide.jpg", pos: "50% 55%" },
    ],
  },
  // the whole team, edge to edge (Scott: "get Bianca on the left in too, everyone in")
  { b: BOARD_END, layout: "F", from: ["b"], panels: [{ src: "team-gala.webp", whole: true }] },
];
// The 16:9 cut (Bianca, 22 Oct): landscape, opening on motion, the day in order with nothing twice
// (each clip and photo used once; the Lorraine slow-motion "still" and the second registration
// angle out, the keynote still and its 1s clip replaced by the keynote with the audience), every
// group and every tall shot whole over its soft copy (`whole` with `a`, so no one is cropped out),
// the winners full frame (16:9 photos fill a 16:9 frame uncropped), the Donnington walk-up at full
// width (the 4:5 crop sat on the woman waving them up; the whole frame is the winners walking on),
// and no flipbook count: the 25 is a window onto the gala team from the start. `pending` panels are
// the clips still to come, named for the files they will be (H.264 proxies, as the rest).
// Rachel heard (Scott: "i want her heard"): her welcome from 12.6s of 20261019_194348
// (`sfx/rachel-voice.wav` is 12.5-17.75s, cleaned and levelled). Her voice comes in a beat before her
// shot, over the day's last panel, and plays in sync through it; the music dips under her.
const WIDE_NIGHT = 29; // the 16:9 cut's night, Rachel held longer (Scott)
const WIDE_WIN = 40; // the 16:9 cut's "And the winner is" lands here; the winners a bar apart to the name (48)
const WIDE_TEAM_POS = "50% 55%"; // the gala team full bleed in 16:9 (Scott), and its end card framed alike
// ending on "... it's obvious we have a phenomenal team" (Scott), 17.6s, a breath before her next phrase
const RACHEL = { src: "sfx/rachel-voice.wav", at: WIDE_NIGHT - 1, from: 12.5, clip: 12.0, len: 5.25, duck: 0.4 };
const LANDSCAPE: Scene[] = [
  // the venue, flags in the wind, then the registration desk at full speed (Scott: the corridor out)
  { b: -16, layout: "F", from: ["r"], panels: [{ src: "venue-flags-terrace.mp4", clip: 0.6 }] },
  // cut before Georgina comes into frame at 1.2s (Scott), its first 1.18s in true slow motion at 0.75x
  // (registration-desk-smooth.mp4, minterpolate: slowing the 30fps clip in the player repeated frames,
  // Scott: "jerky ... like a flipbook")
  { b: -11, layout: "F", from: ["r"], panels: [{ src: "registration-desk-smooth.mp4", clip: 0.0 }] },
  // arrivals, Rachel at the welcome stand (both whole)
  {
    b: -8,
    layout: "V2",
    from: ["l", "r"],
    panels: [
      // full bleed, like the 4:5's collage (Scott)
      // Liz and Georgina at the welcome stand on the left, the arrivals on the right (Scott)
      { src: "welcome-stand.jpg", pos: "52% 50%" },
      { src: "registration-arrivals.mp4", clip: 0.0, pos: "50% 45%" }, // at full speed, its last frame held as the next panel comes in
    ],
  },
  // the morning: breakfast, the stands, the walk in, the room filling (IMG_5097), a beat longer (Scott)
  {
    b: -3.5,
    layout: "Q4",
    from: ["l", "r", "l", "r"],
    stagger: 0.5,
    panels: [
      { src: "breakfast-spread.mp4", clip: 0.0 },
      { src: "exhibitor-stands.mp4", clip: 0.0 }, // 0.5s on in IMG_5078
      { src: "exhibitors-mingle.mp4", clip: 0.0 }, // the stands busy, coffee in hand (was the walk past empty tables, Scott)
      { src: "exhibitor-fango.mp4", clip: 0.0 }, // the Fango stand (IMG_5078, 7.3s), another exhibitor (Scott)
    ],
  },
  // the keynote: Phill under his slide, then the faces listening (IMG_5109, its steady second, then held:
  // the camera jerks into a pan after it, Scott: "jitters"; the room under Stronger
  // Together, IMG_5102, out: Scott, "too fast and doesn't add anything")
  // Phill and the label held longer (Scott: "the label too fast")
  { b: 2, layout: "F", from: ["b"], panels: [{ src: "phill-keynote.mp4", clip: 0.3 }] },
  { b: 9, layout: "F", from: ["r"], panels: [{ src: "audience-faces.mp4", clip: 0.0 }] },
  // the talks: the panel, the data talk, the tables (IMG_5155), the colour energies session (IMG_5176)
  {
    b: 12,
    layout: "Q4",
    from: ["l", "r", "l", "r"],
    stagger: 0.5,
    panels: [
      { src: "sales-panel.mp4", clip: 7.4 },
      { src: "speaker-data.mp4", clip: 2.0 },
      // the room from the back (IMG_5155 and IMG_5102 both jittered here: hand-held while walking, Scott)
      { src: "room-wide.jpg" },
      { src: "colour-energies-talk.mp4", clip: 0.1 },
    ],
  },
  // the speakers in three columns, full bleed (Scott: "three not two"): Louise 11:31, Nick Saunders
  // 13:28, the wedding report 16:11
  {
    b: 16,
    layout: "C3",
    from: ["t", "b", "t"],
    panels: [
      { src: "speaker-lectern.jpg", pos: "50% 50%" },
      { src: "stills/wide/20261019_132813.jpg", pos: "77% 50%" },
      { src: "speaker-wedding-report.mp4", clip: 3.0, pos: "50% 50%" },
    ],
  },
  // the team under the 25 Years balloons, the day's line beside them, held three seconds (Scott: "so I read")
  {
    b: 21, // the colour energies handshake out (Scott: Nick's slide is behind it)
    layout: "V2",
    from: ["l", "r"],
    panels: [
      { caps: "19 OCTOBER 2026", lines: ["Here's to", "25 years"] }, // to the balloons beside it (Scott)
      { src: "team-balloons-25-years-wide.jpg", pos: "50% 55%" },
    ],
  },
  // the night: Rachel's welcome, then "And the winner is" over the room, then the winners pop in
  // one a bar (Scott: "boom winner on stage, boom winner on stage, boom winner on stage")
  { b: WIDE_NIGHT, layout: "F", from: ["b"], panels: [{ src: "rachel-gala-welcome.mp4", clip: 0 }] },
  { b: WIDE_WIN - 4, layout: "F", from: ["r"], panels: [ROOM_WINNER] },
  {
    b: WIDE_WIN,
    layout: "F",
    from: ["pop"],
    panels: [{ src: "winner-imperial.jpg", caption: { caps: "MARKETING CHAMPION", lines: ["The Imperial"] } }],
  },
  {
    b: WIDE_WIN + 4,
    layout: "F",
    from: ["pop"],
    panels: [{ src: "winner-hogarths.jpg", caption: { caps: "ENQUIRY ACE", lines: ["Hogarths"] } }],
  },
  // the name pops in on the beat (Scott: "not a left slide ... more like a pop")
  // the name pops straight onto the woman in black coming up with the award, her face to camera
  // (Scott: the wide of the same clip before it was a duplicate)
  // it plays on under the trophy cabinet (winners-stage.jpg is the quiz winners, not the awards,
  // Scott: it comes after), then Table 3 and the whole team
  {
    b: NAME,
    layout: "F",
    from: ["pop"],
    panels: [{ src: "awards-donnington-1080.mp4", clip: 9.4, stop: 18.4, pos: "78% 38%", zoom: 1.8 }],
  },
  // the quiz winners, after the awards and with no label (Scott: "just not as Donnington")
  // zoomed in past the man filming and the sound man at the left (Scott: "crop out the sound guys")
  { b: 68, layout: "F", from: ["r"], panels: [{ src: "winners-stage.jpg", pos: "72% 58%", zoom: 1.42 }] },
  { b: 72, layout: "F", from: ["r"], panels: [{ src: "table-3-selfie.jpg", pos: "50% 45%", pull: 1.12 }] }, // full bleed (Scott)
  // full bleed (Scott: "blend that or make it full bleed"): everyone across the width, the stage floor
  // and the ceiling cropped
  { b: 76, layout: "F", from: ["b"], panels: [{ src: "team-gala.webp", pos: WIDE_TEAM_POS }] },
];
// the 16:9 count's flipbook (Scott: "we need the counter for real", "try not to use the duplicate
// shots ... or too similar shots"): only shots unlike anything in the film and unlike each other,
// day to night (with four of the Event Photography folder's day photos, `stills/wide/2026...`; the
// other six matched shots in the film), each held for one or two numbers; 25 is the gala team, the shot before it
const WIDE_FLIP: Flip[] = [
  // the 1 opens on the Classic British banner at the door, its gold CB inside the numeral, guests walking
  // in behind (Scott: the terrace "isn't inspiring, just a building wall"; the lamp post after it didn't
  // land either)
  { src: "banner-arrivals.jpg", a: 0.75, f: [0.32, 0.26], z: 1.6, grade: "day" },
  { src: "stills/wide/20261019_095046.jpg", a: 1.776, f: [0.55, 0.5], z: 1, grade: "day" }, // the STR stand, 09:50
  { src: "stronger-together.jpg", a: 1.3333, f: [0.42, 0.45], z: 1, grade: "day" },
  { src: "stills/wide/panel-wide.jpg", a: 1.7778, f: [0.5, 0.55], z: 1, grade: "day" }, // the panel from the side (Scott: a different shot from the room)
  { src: "stills/wide/20261019_115429.jpg", a: 1.776, f: [0.5, 0.5], z: 1, grade: "day" }, // "From visibility to value", 11:54
  { src: "stills/wide/speaker-afternoon.jpg", a: 1.7778, f: [0.6, 0.5], z: 1, grade: "day" },
  { src: "stills/marketing-champion.jpg", a: 1.7778, f: [0.5, 0.5], z: 1, grade: "night" },
  { src: "winner-donnington.jpg", a: 1.7762, f: [0.56, 0.45], z: 1, grade: "night" },
];

// Bianca's amends (23 Oct): the count and the 25 open the film, then the day (the desk out, Liz and
// Hayley whole at the welcome stand, every speaker moving); each award its category on the screen,
// then the winners' photo, then the hotel; the people having fun after the awards, the team on
// stage pulled out to everyone; then thank you to the sponsors and speakers, and see you next year
const WIDE2_NIGHT = 27; // Rachel to the room at 37, ~5s
// the three winners quicker, two and a half beats apart (Bianca: "make the 3 x winner pics flash a bit
// faster"), Donnington still on the name
const WIDE2_WIN = NAME - 5;
// the drum roll's hit after the opening 25 (27.95s, beat -13.1); the flags' push (centred on its beat)
// moved half a push earlier so it lands on the hit (Scott: "the crash is slightly before the swipe")
const WIDE2_FLAGS = -13.1 - PUSH / 2 / (30 * 0.5042);
const LANDSCAPE2: Scene[] = [
  // the venue from the air (Bianca: "not the best reel to showcase the venue ... use one of their aerial
  // shots"; Scott's photo, as a depth push over the lake to the hotel, scripts/still-depth-dolly.py)
  { b: WIDE2_FLAGS, layout: "F", from: ["r"], panels: [{ src: "forest-of-arden-aerial.mp4", clip: 0, stop: 3.15 }] },
  // the venue shot shorter (Bianca: "went on too long, it just shows a row of golf carts")
  {
    b: -10,
    layout: "V2",
    from: ["l", "r"],
    panels: [
      { src: "welcome-stand.jpg", pos: "30% 50%" }, // Liz whole on the left (Bianca), Hayley on the right
      // slowed a touch with interpolation so it lasts the shot (its last frame held, Scott: "this frame freezes")
      { src: "registration-arrivals-slower.mp4", clip: 0.0, pos: "50% 45%" }, // slowed to last the panel (Scott: it stopped a second early)
    ],
  },
  // the morning: the buffet, then a guest walking in to the room
  {
    b: -3.5,
    layout: "V2",
    from: ["l", "r"],
    stagger: 0.5,
    panels: [
      { src: "breakfast-spread-slow.mp4", clip: 0.0 }, // slowed a touch: the proxy froze at 2.9s
      // just him walking in (Scott, 26 Oct: crop out the empty table), the crop following him to the doors
      { src: "exhibitors-walk-in.mp4", clip: 0 },
    ],
  },
  // the exhibitors as one wall of smaller pictures (Bianca, 26 Oct: "change the way that frame is displayed
  // by making the pics smaller ... fit more exhibitor pics in, eg the Double Dutch stand"; Eventurous out):
  // La Bottega with both its people, Alkimii, Double Dutch (IMG_5089, cropped clear of La Bottega's board),
  // fango, Paul Robinson Wines and the exhibition floor by WedPro (IMG_5088), each stand once
  {
    b: 1,
    layout: "G6",
    from: ["t", "b", "t", "b", "t", "b"],
    stagger: 0.5,
    grade: "day",
    panels: [
      { src: "stand-la-bottega.jpg", pos: "50% 40%" },
      { src: "stand-alkimii.jpg", pos: "40% 50%" },
      { src: "stand-double-dutch.jpg", pos: "100% 55%", zoom: 1.6 },
      { src: "stand-fango.jpg", pos: "45% 50%" },
      { src: "stand-paul-robinson.jpg", pos: "62% 45%" },
      { src: "exhibitors-floor.jpg", pos: "0% 62%", zoom: 1.12 },
    ],
  },
  // the keynote and the faces a little longer, as the night starts later for the quicker winners
  { b: 7, layout: "F", from: ["b"], panels: [{ src: "phill-keynote.mp4", clip: 0.3 }] },
  // the faces listening: the clip is one held frame, so it is a still with a gentle pull-out, not a freeze
  // Scott's uncompressed crowd clip (26 Oct; jerky, so its sharpest frame as a still), lightly sharpened
  { b: 12.5, layout: "F", from: ["r"], panels: [{ src: "audience-faces-hq-sharp.jpg", pull: 1.06 }] },
  // the talks: the panellists, the data talk, the panel on stage, Nick's Colour Energies handshake (just the
  // handshake, its slide blurred frame by frame: scripts/blur-slide.py; Scott: "blur Nick's slide about the colours")
  {
    b: 16.5,
    layout: "Q4",
    from: ["l", "r", "l", "r"],
    stagger: 0.5,
    panels: [
      // the marketing panel, "Marketing That Matters" (Bianca, 26 Oct: "cant see the marketing panel anywhere, pls
      // replace the top left one"; Scott's closer photo, cropped to the four of them and their slide)
      { src: "marketing-panel-sharp.jpg", pos: "78% 58%", zoom: 1.3 },
      { src: "speaker-data.mp4", clip: 2.0 },
      { src: "sales-panel.mp4", clip: 7.4 },
      { src: "colour-energies-duo-blur.mp4", clip: 0 },
    ],
  },
  // the speakers, all on video (Bianca: "action video here for everyone? First 2 are still images")
  {
    b: 22,
    layout: "C3",
    from: ["t", "b", "t"],
    panels: [
      // Allen Simpson, UKH's Chief Executive (Bianca, 26 Oct: "need Allen Simpson from UKH ... instead of the
      // left hand speaker"), framed with the UKH logo on his slide
      { src: "allen-simpson-sharp.jpg", pos: "57% 45%", pull: 1.25 }, // a Ken Burns pull-out from him to the UKH logo, moving beside two clips (Scott)
      // Nick Saunders on video (Scott: "replace still of Nick with real footage"; 20261019_132952, the 4K
      // phone clip at 30fps, `nick-saunders.mp4`, its only dropped frames at 6.3s, clear of this stretch)
      { src: "nick-saunders.mp4", clip: 0.5, pos: "72% 50%" },
      { src: "speaker-wedding-report.mp4", clip: 3.0, pos: "50% 50%" },
    ],
  },
  // the night: Rachel's welcome, then "And the winner is" over the room first, then the three winners
  // accepting, a bar apart (Scott: "and the winner is goes first before the awards then three photos of
  // them accepting"), each captioned with its award; Donnington's walk-up under its label
  // her clip from 1.1s, after the phone's zoom in (Scott: "cut the zoom in on the camera"), slowed a touch
  // with interpolation so it fills her shot (the room from the back out: Scott, "don't need this shot")
  { b: WIDE2_NIGHT, layout: "F", from: ["b"], panels: [{ src: "rachel-gala-welcome-slow.mp4", clip: 0 }] },
  // Rachel ~4.8s (Scott: 6.5s was "too long"); the gala room mingling out (Scott: the room shot after it is
  // similar), so the day carries four beats more and the night starts later
  { b: WIDE2_WIN - 6, layout: "F", from: ["r"], panels: [ROOM_WINNER] },
  {
    b: WIDE2_WIN,
    layout: "F",
    from: ["pop"],
    panels: [{ src: "winner-imperial-sharp.jpg", caption: { caps: "MARKETING CHAMPION", lines: ["The Imperial"] } }],
  },
  {
    b: WIDE2_WIN + 2.5,
    layout: "F",
    from: ["pop"],
    panels: [{ src: "winner-hogarths-sharp.jpg", caption: { caps: "ENQUIRY ACE", lines: ["Hogarths"] } }],
  },
  {
    b: NAME,
    layout: "F",
    from: ["pop"],
    // their photo with the award, not the walk-up with their backs turned (Scott), the trophy cabinet over it
    panels: [{ src: "winner-donnington-sharp.jpg", pos: "50% 45%" }],
  },
  // the people (Bianca: "all the people shots rotating"), the 25 years line beside them; then the
  // celebrating and the mingling (Scott: "get the photos of mingling celebrating")
  {
    b: 68,
    layout: "V2",
    from: ["l", "r"],
    panels: [
      { caps: "19 OCTOBER 2026", lines: ["Here's to", "25 years"] },
      { src: "team-balloons-25-years-wide-sharp.jpg", pos: "50% 55%" },
    ],
    // the Table 3 selfie out (Scott: "don't use this shot"), and the second balloons photo (the same four)
  },
  // Table 7 with their quiz medals, glasses up (Scott: "towards the end after the awards")
  { b: 72, layout: "F", from: ["r"], panels: [{ src: "table-7-medals-sharp.jpg", pos: "50% 45%", pull: 1.06 }] },
  // Hayley's table added (Bianca: "any other group shots, add them all in"); the stage shot stays (Scott)
  { b: 74, layout: "F", from: ["r"], panels: [{ src: "table-3-selfie-sharp.jpg", pos: "50% 42%", pull: 1.06 }] },
  // the quiz winners: Scott's sharper photo of the moment (26 Oct), the bottle raised
  { b: 76.5, layout: "F", from: ["r"], panels: [{ src: "winners-stage-cheer-sharp.jpg", pos: "48% 30%", zoom: 1.08 }] },
  // the team on stage, pulling out further (Bianca: "final team shot needs to zoom out more")
  {
    b: 78.5, // a beat longer (Scott: "hold that a tad longer"), taken from the three shots before
    layout: "F",
    from: ["b"],
    // Bianca (26 Oct): "too zoomed in - can you add a border": it pulls out from close in, past full bleed, to the
    // line-up framed inside an even black border
    panels: [{ src: "team-gala-sharp.jpg", pos: WIDE_TEAM_POS, pull: 1.3, pullTo: 0.88 }],
  },
];
// the opening count's flipbook, none of it in the film after
const WIDE_FLIP2: Flip[] = WIDE_FLIP.filter(
  (f) => !["stills/wide/speaker-afternoon.jpg", "stills/marketing-champion.jpg", "winner-donnington.jpg"].includes(f.src),
);
// the sponsors' and speakers' logos for the thank you (Bianca), from the exhibitor slide and the
// speaker cards: official files in `logos/src/`, trimmed by scripts/amc-logos.py and shown in their
// own colours (Scott: "don't recolour them"), each on a light tile, or a charcoal one if it is white
// or pale (`LOGOS`); Nick Saunders, a personal brand, is his name set as on his speaker card (`type`);
// a slot with no file yet waits with its name in it
// in Bianca's order (26 Oct): Access, Alkimii, La Bottega Collective (in place of Vanity Group, its
// parent; its own light logo on a charcoal tile, like the other white ones), UKH, SiteMinder | STR, Venue Directory, Wedding Dates, Eventurous, Nick, Trajectory, then the
// rest, Paul Robinson Wines in place of Clarity; a tile with no file shows its name until the logo comes
const THANKS_LOGOS: { name: string; file?: string; type?: boolean; text?: [string, string] }[] = [
  { name: "Access Hospitality", file: "access-hospitality" },
  { name: "Alkimii", file: "alkimii" },
  { name: "La Bottega Collective", file: "la-bottega-collective" }, // its light logo, from its own site (Scott)
  { name: "UKHospitality", file: "ukhospitality" },
  { name: "SiteMinder", file: "siteminder" },
  { name: "STR", file: "str" },
  { name: "Venue Directory", file: "venue-directory" },
  { name: "Wedding Dates", file: "wedding-dates" },
  { name: "Eventurous", file: "eventurous" },
  { name: "Nick Saunders", file: "nick-saunders" }, // his own logo, "saunders" lower case as he sets it (Scott)
  { name: "Trajectory", file: "trajectory" },
  { name: "fango", file: "fango" },
  { name: "Double Dutch", file: "double-dutch" },
  { name: "Duni", file: "duni-poppies" },
  // no logo (Scott: "just put it in text ... don't think he has one"): set as a simple wordmark
  { name: "Paul Robinson Wines", text: ["Paul Robinson", "WINES"] },
];

const END_PHOTO: Media = { src: "team-gala.webp", pos: "50% 45%" };
// the counter's flipbook (Scott: "as the counter goes up cycle through different shots ... like a
// Marvel flipbook or shutter"): numbers 1 to 24 each open on a shot of the day, in order, morning
// to night (stills from the clips in `stills/`); 25 is the gala team
// Each is placed by hand (Scott: "20 23 21 and 24 need better crops"): `f` is where its people
// are, as fractions of the photo, put at the numerals' middle; `z` zooms past a cover fit; `a`
// is the photo's aspect. 24, held longest, is the gala team, faces across the numerals.
type Flip = { src: string; a: number; f: [number, number]; z: number; grade: Grade };
const FLIP: Flip[] = [
  { src: "stills/venue-flags.jpg", a: 1.7778, f: [0.5, 0.5], z: 1, grade: "day" },
  { src: "stills/registration-desk.jpg", a: 1.7778, f: [0.45, 0.45], z: 1.3, grade: "day" },
  { src: "stills/registration-arrivals.jpg", a: 0.5625, f: [0.5, 0.5], z: 1, grade: "day" },
  { src: "welcome-stand.jpg", a: 1.3333, f: [0.45, 0.45], z: 1, grade: "day" },
  { src: "stills/exhibitors.jpg", a: 1.7778, f: [0.5, 0.38], z: 1, grade: "day" },
  { src: "stronger-together.jpg", a: 1.3333, f: [0.42, 0.45], z: 1, grade: "day" },
  { src: "stills/phill-keynote.jpg", a: 1.7778, f: [0.62, 0.45], z: 1, grade: "day" },
  { src: "stronger-together-room.jpg", a: 1.7762, f: [0.5, 0.5], z: 1, grade: "day" },
  { src: "speaker-lectern.jpg", a: 0.563, f: [0.6, 0.45], z: 1.25, grade: "day" },
  { src: "sales-panel.jpg", a: 1.3333, f: [0.55, 0.6], z: 1.2, grade: "day" },
  { src: "stronger-together-speaker.jpg", a: 1.7762, f: [0.5, 0.55], z: 1, grade: "day" },
  { src: "stills/wedding-report.jpg", a: 0.5625, f: [0.4, 0.5], z: 1.25, grade: "day" },
  { src: "room-wide.jpg", a: 1.7762, f: [0.5, 0.55], z: 1, grade: "day" },
  { src: "team-balloons-25-years.jpg", a: 0.75, f: [0.5, 0.42], z: 1.05, grade: "day" },
  { src: "rachel-welcome.jpg", a: 1.7762, f: [0.82, 0.48], z: 1.3, grade: "night" },
  { src: "stills/marketing-champion.jpg", a: 1.7778, f: [0.5, 0.5], z: 1, grade: "night" },
  { src: "winner-imperial.jpg", a: 1.7762, f: [0.62, 0.45], z: 1.5, grade: "night" },
  { src: "winner-hogarths.jpg", a: 1.7762, f: [0.6, 0.5], z: 1.5, grade: "night" },
  { src: "stills/donnington-room.jpg", a: 1.7778, f: [0.5, 0.55], z: 1, grade: "night" },
  { src: "stills/donnington-stage.jpg", a: 1.7778, f: [0.66, 0.45], z: 1.8, grade: "night" },
  { src: "winner-donnington.jpg", a: 1.7762, f: [0.56, 0.45], z: 1.5, grade: "night" },
  { src: "winners-stage.jpg", a: 1.7762, f: [0.5, 0.5], z: 1.4, grade: "night" },
  { src: "table-3-selfie.jpg", a: 1.3333, f: [0.5, 0.5], z: 1, grade: "night" },
  { src: "team-gala.webp", a: 1.001, f: [0.5, 0.48], z: 1.15, grade: "night" },
];

// where a flipbook photo sits: its people at (cx, cy), covering the frame
const placeFlip = (fl: Flip, W: number, H: number, cx: number, cy: number) => {
  const cover = fl.a > W / H ? { w: H * fl.a, h: H } : { w: W, h: W / fl.a };
  const w = cover.w * fl.z;
  const h = cover.h * fl.z;
  const clamp = (v: number, lo: number) => Math.min(0, Math.max(lo, v));
  return { w, h, left: clamp(cx - fl.f[0] * w, W - w), top: clamp(cy - fl.f[1] * h, H - h) };
};

type Cut = {
  track: Track;
  w: number;
  h: number;
  start: number; // beat the film starts on
  end: number; // beat the end card comes in on (a downbeat; the music goes to the track's outro)
  hold: number; // frames after the hit
  label: [number, number] | null; // beats
  mark: { right: number; bottom: number; w: number };
  lineSize: number;
  bottom: number; // the labels' clearance from the bottom
  end25: { size: number; base: number; lineTop: number };
  lockupY: number; // where the 25 Years lockup's centre sits
  big25: { scale: number; cy: number }; // the count's 25 (the lockup's own): its scale on the file's units, its centre
  lockScale: number; // the lockup's size: frame px a pixel of the file
  scenes?: Scene[]; // its own edit (else SCENES)
  count?: boolean; // the flipbook count to 25 (else the 25 is there from the start, a window onto the team)
  boardAt?: number; // the winners board's first beat (else BOARD_AT)
  boardEnd?: number; // the winners board's last beat (else BOARD_END)
  voice?: { src: string; at: number; len: number; duck: number };
  night?: number; // the beat the night comes in on (else NIGHT)
  winnerAt?: number; // the beat "And the winner is" builds to (else NAME)
  nameUntil?: number; // the beat the Donnington label goes (else NAME + 10.5)
  late?: number; // frames the count and the 25 land after the track's `hit` (onto a later note)
  open25?: boolean; // the count opens the film, its flipbook running back from night to morning
  openUntil?: number; // with open25: the beat the 25 holds to (else OPEN_FLAGS)
  endTeam?: boolean; // ends on the gala team full bleed, "Empowering Independents" over it
  endThanks?: boolean; // ends on thank you to the sponsors and speakers, then see you next year
  outroLead?: number; // with endThanks: the end card (and its music) comes in this many beats before the outro
  noName?: boolean; // no Donnington label on the walk-up (its photo carries the name)
  flip?: Flip[]; // its own flipbook for the count (else FLIP)
  flip24?: Flip; // a shot for 24 alone, the rest of the flipbook spread over 1-23 // a voice from beat `at`, `len` s, the music dipped to `duck`
  labels?: { from: number; to: number; caps: string; lines: string[] }[]; // labels of its own, in beats
  labelCaps?: string; // the opening label's caps, if not FOREST OF ARDEN
  winHits?: number[]; // beats before `winnerAt` the words of "And the winner is" land on (else WINNER_HITS)
  rowsAfter?: number; // beats from the board coming up to its first award (else ROWS_AT - BOARD_AT)
  rowEvery?: number; // beats between awards (else ROW_EVERY)
  nightLen?: number; // beats the gala label holds (else 5.6)
};

const reel = (track: Track): Cut => ({
  track,
  w: 1080,
  h: 1350,
  start: track.start ?? -4, // a bar before the day starts moving, so the label has the first shot to itself
  end: NAME + 40, // a downbeat: the end card's music comes in on the bar
  hold: 95, // the 25 lands on the last hit and holds, black and gold (Scott)
  label: [(track.start ?? -4) + 0.5, 5.5], // held through the arrivals (Scott), gone before Rachel at 6
  mark: { right: 56, bottom: 52, w: 84 },
  lineSize: 80,
  bottom: 112,
  end25: { size: 1100, base: 1092, lineTop: 180 },
  lockupY: 660,
  big25: { scale: 4.4, cy: 620 }, // YEARS clear of the bottom fifth, where LinkedIn's player controls sit (Scott)
  lockScale: 1.59,
});

const story = (track: Track): Cut => ({
  track,
  w: 1080,
  h: 1920,
  start: NAME - (track.storyFrom ?? 16), // from Rachel's welcome (Scott: she must be in it), the winners' split all of it
  end: NAME + 12,
  hold: track.storyHold ?? 95,
  label: null,
  // the Stories UI: clear of the reply bar and the right-hand buttons
  mark: { right: 60, bottom: 360, w: 100 },
  lineSize: 80,
  bottom: 470,
  end25: { size: 1140, base: 1380, lineTop: 500 },
  lockupY: 940,
  big25: { scale: 5.6, cy: 1008 },
  lockScale: 1.42, // clear of the Story's edges
});

const landscape = (track: Track): Cut => ({
  track,
  w: 1920,
  h: 1080,
  start: -16, // on a downbeat, sixteen bars before the name
  end: NAME + 32, // shorter than the reel: the walk-up is short
  hold: 95,
  label: [-15.5, -8.2],
  mark: { right: 56, bottom: 48, w: 76 },
  lineSize: 72,
  bottom: 240, // clear of the player's controls and time (Scott: "lift this past the safe zone")
  end25: { size: 900, base: 820, lineTop: 70 },
  lockupY: 540,
  big25: { scale: 4.0, cy: 510 }, // the 25 as big as the 24 before it, YEARS clear of the player's bar
  lockScale: 1.2,
  // her shot starts where her voice has got to by NIGHT
  scenes: LANDSCAPE.map((sc) =>
    sc.b === WIDE_NIGHT
      ? { ...sc, panels: [{ ...(sc.panels[0] as Media), clip: RACHEL.from - RACHEL.clip + (WIDE_NIGHT - RACHEL.at) * track.beat }] }
      : sc,
  ),
  // Rachel's voice out (Scott: it doesn't carry over the music); RACHEL still sets her clip's in-point
  night: WIDE_NIGHT,
  winnerAt: WIDE_WIN,
  nameUntil: NAME + 4, // gone with the close-up, before all the winners on stage
  flip: WIDE_FLIP,
  // the 25 on the beat after the track's last note (Scott: "the logo, it's early", then "still half a
  // beat off"): 91.475s plus half a beat, as the last chord rings into the stop
  late: Math.round((91.475 + track.beat / 2 - track.hit) * 30),
  // 24 is the gala team on stage (Scott: "the team photo should be the 24"), 25 the window onto it
  flip24: { src: "team-gala.webp", a: 1.001, f: [0.5, 0.42], z: 1, grade: "night" }, // the full width, everyone in
  boardAt: NAME + 4.3,
  boardEnd: 68,
  labels: [{ from: 2.3, to: 8.8, caps: "WELCOME", lines: ["Side by side", "since 2001"] }],
});

const fB = (cut: Cut, b: number) => Math.round((b - cut.start) * cut.track.beat * 30);
// s into the track of beat b
const at = (cut: Cut, b: number) => cut.track.name + (b - NAME) * cut.track.beat;
const endOf = (cut: Cut) => fB(cut, cut.end);
// beats the end card's music starts before the track's outro (it comes in that much earlier)
const leadOf = (cut: Cut) => (cut.outroLead ?? 0) * cut.track.beat;
const hitOf = (cut: Cut) =>
  endOf(cut) + Math.round((cut.track.hit - cut.track.outro + leadOf(cut)) * 30) + (cut.late ?? 0);
const totalOf = (cut: Cut) => hitOf(cut) + cut.hold;

type Box = { x: number; y: number; w: number; h: number };
const boxes = (layout: Layout, W: number, H: number): Box[] => {
  const hw = (W - G) / 2;
  const hh = (H - G) / 2;
  const top = Math.round(H * 0.593);
  switch (layout) {
    case "F":
      return [{ x: 0, y: 0, w: W, h: H }];
    case "V2":
      return [
        { x: 0, y: 0, w: hw, h: H },
        { x: hw + G, y: 0, w: hw, h: H },
      ];
    case "T3":
      return [
        { x: 0, y: 0, w: W, h: top },
        { x: 0, y: top + G, w: hw, h: H - top - G },
        { x: hw + G, y: top + G, w: hw, h: H - top - G },
      ];
    case "B3": {
      // two on top, one across the bottom, taller, for a stand with its people, backdrop and products
      const up = Math.round(H * 0.34);
      return [
        { x: 0, y: 0, w: hw, h: up },
        { x: hw + G, y: 0, w: hw, h: up },
        { x: 0, y: up + G, w: W, h: H - up - G },
      ];
    }
    case "G6": {
      if (W > H) {
        // three across, two down in a wide frame
        const tw = (W - 2 * G) / 3;
        return [0, 1].flatMap((r) => [0, 1, 2].map((c) => ({ x: c * (tw + G), y: r * (hh + G), w: tw, h: hh })));
      }
      const th = (H - 2 * G) / 3;
      return [0, 1, 2].flatMap((r) => [
        { x: 0, y: r * (th + G), w: hw, h: th },
        { x: hw + G, y: r * (th + G), w: hw, h: th },
      ]);
    }
    case "C3": {
      const cw = (W - 2 * G) / 3;
      return [0, 1, 2].map((c) => ({ x: c * (cw + G), y: 0, w: cw, h: H }));
    }
    case "Q4":
      return [
        { x: 0, y: 0, w: hw, h: hh },
        { x: hw + G, y: 0, w: hw, h: hh },
        { x: 0, y: hh + G, w: hw, h: hh },
        { x: hw + G, y: hh + G, w: hw, h: hh },
      ];
  }
};

// a panel's box grown by half a gutter on its inner sides, so neighbours meet and the gutters
// arrive with the panels (black), never showing the layout underneath
const withGutter = (b: Box, W: number, H: number) => {
  const l = b.x > 0 ? G / 2 : 0;
  const t = b.y > 0 ? G / 2 : 0;
  const r = b.x + b.w < W ? G / 2 : 0;
  const d = b.y + b.h < H ? G / 2 : 0;
  return { outer: { x: b.x - l, y: b.y - t, w: b.w + l + r, h: b.h + t + d }, inset: { l, t, r, d } };
};

type Layer = {
  key: string;
  box: Box;
  content: Content;
  from: Side;
  at: number; // frame its push is centred on
  until: number; // frame it is gone by
  out: number | null; // frame its replacement's push is centred on
  drift: Side | null; // pushed aside by a swap in the same box (else it dims under a new layout)
  first: boolean; // already there when the film starts
  grade: Grade;
};

// the frame panel i of a scene arrives on
const arrival = (cut: Cut, s: Scene, i: number) =>
  s.stagger ? fB(cut, s.b + i * s.stagger) : fB(cut, s.b) + STAGGER * i;

const layersOf = (cut: Cut): Layer[] => {
  const out: Layer[] = [];
  const all = cut.scenes ?? SCENES;
  const scenes = all.filter((s, i) => {
    const next = all[i + 1]?.b ?? Infinity;
    return next > cut.start && s.b < cut.end;
  });
  scenes.forEach((s, si) => {
    const bx = boxes(s.layout, cut.w, cut.h);
    const next = scenes[si + 1];
    const nextAt = next ? fB(cut, next.b) : endOf(cut);
    const nextDone = next ? arrival(cut, next, next.panels.length - 1) + PUSH / 2 : endOf(cut) + 10;
    s.panels.forEach((c, i) => {
      const swaps = (s.swaps ?? []).filter((w) => w.i === i && w.b > cut.start);
      const chain: { content: Content; at: number; from: Side }[] = [
        { content: c, at: arrival(cut, s, i), from: s.from[i] },
        ...swaps.map((w) => ({ content: w.to, at: fB(cut, w.b), from: w.from })),
      ];
      // in the Story, a swap before the start replaces its panel's first content
      const pre = (s.swaps ?? []).filter((w) => w.i === i && w.b <= cut.start).pop();
      if (pre) chain[0] = { content: pre.to, at: chain[0].at, from: chain[0].from };
      chain.forEach((k, j) => {
        const nx = chain[j + 1];
        out.push({
          key: `${s.b}-${i}-${j}`,
          box: bx[i],
          content: k.content,
          from: k.from,
          at: k.at,
          until: nx ? nx.at + PUSH / 2 : nextDone,
          out: nx ? nx.at : next ? nextAt : null,
          drift: nx ? nx.from : null,
          first: k.at <= 0,
          grade: s.grade ?? (s.b < (cut.night ?? NIGHT) ? "day" : "night"),
        });
      });
    });
  });
  return out;
};

const isTile = (c: Content): c is Tile => (c as Tile).caps !== undefined;

const push = (local: number) =>
  interpolate(local, [0, PUSH], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

const shift = (side: Side, amount: number) => {
  if (side === "pop") return "";
  const [x, y] = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] }[side];
  return `translate(${x * amount}%, ${y * amount}%)`;
};

const Caps: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: sans,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.26em",
      color: colors.gold,
      paddingBottom: 10,
      marginBottom: 18,
      borderBottom: `2px solid ${colors.gold}`,
      whiteSpace: "nowrap",
    }}
  >
    {/* the last letter unspaced, so the underline ends exactly under it */}
    {text.slice(0, -1)}
    <span style={{ letterSpacing: 0 }}>{text.slice(-1)}</span>
  </div>
);

const TextTile: React.FC<{ tile: Tile }> = ({ tile }) => (
  <AbsoluteFill
    style={{
      background: colors.black,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      flexDirection: "column",
    }}
  >
    <Caps text={tile.caps} size={22} />
    <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 70, lineHeight: 1.05, color: colors.cream }}>
      {tile.lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  </AbsoluteFill>
);

const MediaView: React.FC<{ m: Media; life: number; tall: boolean; grade: Grade; boxA: number; plain: boolean }> = ({
  m,
  life,
  tall,
  grade,
  boxA,
  plain,
}) => {
  const frame = useCurrentFrame();
  const pos = (tall && m.spos) || m.pos || "50% 50%";
  const style: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: pos,
    transformOrigin: pos,
    filter: gradeUrl(grade),
  };
  if (m.pending) {
    // a clip still to come: its slot held by a card naming it, so the edit runs as it will
    return (
      <AbsoluteFill
        style={{
          background: LOCK.ink,
          border: `2px solid ${colors.gold}`,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.2em", color: colors.gold }}>
          TO COME
        </div>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 44, color: colors.cream }}>{m.pending}</div>
      </AbsoluteFill>
    );
  }
  // `whole`: the frame shows all of it, over a soft dark copy of itself, the edges where it stops
  // short fading into the copy (top and bottom for a wide shot in a tall frame, the sides for a
  // tall shot in a wide one)
  const fadeSides = m.a !== undefined && m.a < boxA;
  // `plain` (the 16:9 cut; Scott: "not feeling the little crop ... blend it with a black card"): no
  // soft copy, the picture fading into black over a wider edge
  const e = plain ? 14 : 9;
  const fade = `linear-gradient(to ${fadeSides ? "right" : "bottom"}, transparent 0%, black ${e}%, black ${100 - e}%, transparent 100%)`;
  const soft: React.CSSProperties = {
    ...style,
    objectPosition: "50% 50%",
    filter: `${gradeUrl(grade)} blur(28px) brightness(0.55)`,
    transform: "scale(1.15)",
  };
  if (m.clip === undefined && m.whole) {
    // with `pull`: from full bleed out to the whole photo (Bianca: "pan out")
    const s = m.pull
      ? interpolate(frame, [0, life * 0.7], [m.pull, m.pullTo ?? 1], {
          easing: Easing.inOut(Easing.sin),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : ((tall ? m.szoom : m.zoom) ?? 1) * interpolate(frame, [0, life], [1.0, 1.03]);
    const at = m.zoom || m.szoom ? pos : "50% 50%"; // zoomed towards its subject
    // or, with `edge`, a point of the photo pinned to the frame's left edge, the push growing from it
    const pin = !tall && m.edge !== undefined && m.zoom ? { z: m.zoom, k: s / m.zoom } : null;
    return (
      <AbsoluteFill>
        {plain ? null : <Img src={staticFile(A + m.src)} style={soft} />}
        <Img
          src={staticFile(A + m.src)}
          style={{
            ...style,
            objectFit: "contain",
            objectPosition: "50% 50%",
            transformOrigin: pin ? "0% 45%" : at,
            transform: pin ? `scale(${pin.k}) translateX(${-pin.z * (m.edge ?? 0) * 100}%) scale(${pin.z})` : `scale(${s})`,
            maskImage: fade,
            WebkitMaskImage: fade,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (m.clip === undefined) {
    // the barely-there push, unbroken from arrival to exit
    // with `pullTo` below 1: the pull-out carries on past full bleed, so the photo ends framed inside an even
    // black border (Bianca: "add a border to make it less in your face")
    const framed = m.pullTo !== undefined && m.pullTo < 1;
    const s = m.pull
      ? interpolate(frame, [0, framed ? life * 0.7 : life], [m.pull, m.pullTo ?? 1], {
          easing: framed ? Easing.inOut(Easing.sin) : Easing.out(Easing.sin),
          extrapolateRight: "clamp",
        })
      : (m.zoom ?? 1) * interpolate(frame, [0, life], [1.0, 1.05]);
    const img = <Img src={staticFile(A + m.src)} style={{ ...style, transform: `scale(${s})`, ...(framed ? { transformOrigin: "50% 50%" } : {}) }} />;
    return framed ? <AbsoluteFill style={{ background: colors.black }}>{img}</AbsoluteFill> : img;
  }
  const video = {
    src: staticFile(A + m.src),
    trimBefore: Math.round(m.clip * 30),
    playbackRate: m.stop === undefined ? 1 : Math.min(1, ((m.stop - m.clip) * 30) / life),
    muted: true,
  };
  if (m.whole) {
    return (
      <AbsoluteFill>
        {plain ? null : <OffthreadVideo {...video} style={soft} />}
        <OffthreadVideo
          {...video}
          style={{ ...style, objectFit: "contain", objectPosition: "50% 50%", maskImage: fade, WebkitMaskImage: fade }}
        />
      </AbsoluteFill>
    );
  }
  return <OffthreadVideo {...video} style={{ ...style, transform: m.zoom ? `scale(${m.zoom})` : undefined }} />;
};

// a panel's own label, small, in the house order, rising in once the panel has landed
// `big`: a full-frame panel, so the caption is the size of the film's labels (Scott: "why is the text
// so small compared to Donnington Group"); the half-width panels keep the small one
const Caption: React.FC<{ tile: Tile; show: number; bottom: number; big?: boolean }> = ({ tile, show, bottom, big }) => (
  <AbsoluteFill style={{ opacity: show }}>
    <AbsoluteFill
      style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 50%, rgba(9,9,10,0.7) 90%)" }}
    />
    {/* level with the film's labels (bottom 112), clear of the player's controls (Scott: "these need bringing up") */}
    <div style={{ position: "absolute", left: big ? 72 : 40, bottom, transform: `translateY(${(1 - show) * 24}px)` }}>
      <Caps text={tile.caps} size={big ? 26 : 20} />
      <div
        style={{
          fontFamily: serif,
          fontWeight: 500,
          fontSize: big ? 84 : 58,
          lineHeight: 1.04,
          color: colors.cream,
          textShadow: "0 3px 20px rgba(9,9,10,0.5)",
        }}
      >
        {tile.lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

const Panel: React.FC<{ layer: Layer; cut: Cut; start: number }> = ({ layer, cut, start }) => {
  const frame = useCurrentFrame() + start; // film frame
  const { outer, inset } = withGutter(layer.box, cut.w, cut.h);
  const p = layer.first ? 1 : push(frame - (layer.at - PUSH / 2));
  const q = layer.out === null ? 0 : push(frame - (layer.out - PUSH / 2));
  const outT = layer.drift ? shift(layer.drift, -33 * q) : "";
  return (
    <div
      style={{
        position: "absolute",
        left: outer.x,
        top: outer.y,
        width: outer.w,
        height: outer.h,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colors.black,
          // a pop cuts in on its beat and settles from 1.12x, like the words before it
          transform:
            layer.from === "pop" && !layer.first
              ? `scale(${1 + 0.12 * (1 - progress(frame - layer.at, 0, 9, EASE_OUT))}) ${outT}`
              : `${shift(layer.from, (1 - p) * 100)} ${outT}`,
          opacity: layer.from === "pop" && !layer.first && frame < layer.at ? 0 : 1,
          boxShadow: p < 1 && layer.from !== "pop" ? "0 0 40px rgba(0,0,0,0.55)" : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: inset.l,
            top: inset.t,
            right: inset.r,
            bottom: inset.d,
            overflow: "hidden",
            filter: q > 0 ? `brightness(${1 - 0.45 * q})` : undefined,
          }}
        >
          {isTile(layer.content) ? (
            <TextTile tile={layer.content} />
          ) : (
            <MediaView
              m={layer.content}
              life={layer.until - start}
              tall={cut.h > 1600}
              plain={cut.w > cut.h}
              grade={layer.grade}
              boxA={layer.box.w / layer.box.h}
            />
          )}
          {!isTile(layer.content) && layer.content.caption ? (
            <Caption
              tile={layer.content.caption}
              bottom={layer.box.w === cut.w ? cut.bottom : cut.bottom + 8}
              big={layer.box.w === cut.w}
              show={progress(frame, layer.at + PUSH / 2, 12, EASE_OUT)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

// a label in the house order: gold caps over its still underline, then the name in Cormorant
const Label: React.FC<{ cut: Cut; len: number; caps: string; lines: string[] }> = ({ cut, len, caps, lines }) => {
  const frame = useCurrentFrame();
  const inP = progress(frame, 0, 20, EASE_OUT);
  const out = 1 - progress(frame, len - 14, 14);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 45%, rgba(9,9,10,0.55) 70%, rgba(9,9,10,0.72) 100%)",
          opacity: inP,
        }}
      />
      {cut.w > cut.h ? (
        // a soft dark pool behind the words in the wide cut, so they read over busy signs (Scott: "hard to read")
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse 42% 38% at 18% 70%, rgba(9,9,10,0.62), rgba(9,9,10,0) 100%)",
            opacity: inP,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: cut.bottom,
          opacity: inP,
          transform: `translateY(${(1 - inP) * 40}px)`,
        }}
      >
        <Caps text={caps} size={26} />
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 84,
            lineHeight: 1.04,
            color: colors.cream,
            textShadow: "0 3px 24px rgba(9,9,10,0.5)",
          }}
        >
          {lines.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// the host's words, over the room as it waits, a word a beat (Scott: "like a drum ... boom boom
// boom", then "pop more, like boom boom boom boom"): "And", "the", "winner", "is" on four beats,
// each slamming in at 1.45x and settling with a little overshoot, the room kicking with it (see
// `kick` in Film); the name lands on the next downbeat. Every word keeps its place from the start
// (unseen until its beat), so the line never shifts as it builds.
// "And the winner is": a word a beat, the beats before the name
const WINNER_HITS: [string, number][] = [
  ["And", -4],
  ["the", -3],
  ["winner", -2],
  ["is", -1],
];

const Line: React.FC<{ cut: Cut; len: number; words: { text: string; at: number }[] }> = ({ cut, len, words }) => {
  const frame = useCurrentFrame();
  const shade = progress(frame, 0, 10, EASE_OUT);
  const out = 1 - progress(frame, len - 4, 4); // up until the name lands
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 80% 40% at 50% 38%, rgba(9,9,10,0.5), rgba(9,9,10,0) 100%)",
          opacity: shade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cut.h * 0.17,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 112,
          color: colors.cream,
          textShadow: "0 3px 28px rgba(9,9,10,0.6)",
        }}
      >
        {words.map((w, i) => {
          const on = progress(frame, w.at, 1);
          const punch = interpolate(frame, [w.at, w.at + 4, w.at + 8], [1.45, 0.96, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={w.text}
              style={{
                display: "inline-block",
                marginRight: i < words.length - 1 ? "0.25em" : 0,
                opacity: on,
                transform: `scale(${punch})`,
                transformOrigin: "0% 70%", // grows out ahead of itself, clear of the word before
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// The winners board (Scott: "maybe do like a cool overlay for the winners", with the post's
// list): all six awards over the winners on stage, so the three without a photo are named too.
// The shot dims and softens; "This year's winners" comes up, then a row a half beat, each award
// in gold caps tracking in from wide to the house spacing over the winner in cream Cormorant.
// No underlines on the rows (Scott: "too many underlines in gold").
const WINNERS: [string, string][] = [
  ["FOUNDER MEMBER AWARD", "Ramside Estates"],
  ["REVENUE ROCKSTAR AWARD", "Hythe Imperial Hotel"],
  ["SALES SUPERSTAR AWARD", "Donnington Group"],
  ["MARKETING CHAMPION AWARD", "The Imperial Hotel, Llandudno"],
  ["THE ENQUIRY ACE AWARD", "Hogarths Stone Manor Hotel"],
  ["GUEST EXPERIENCE AWARD", "Ilsington Country House Hotel and Spa"],
];


// a small gold trophy over each award in the wide cut (Scott: "a little trophy by each one"), drawn
// in the house gold rather than the emoji, so it matches the type
const Trophy: React.FC<{ size: number; pop: number }> = ({ size, pop }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ display: "block", margin: "0 auto 8px", transform: `scale(${0.6 + 0.4 * pop})`, opacity: pop }}
  >
    <path
      fill={colors.gold}
      d="M7 3h10v2h3a1 1 0 0 1 1 1v1.5c0 2.6-1.9 4.7-4.4 5A5.5 5.5 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1a5.5 5.5 0 0 1-3.6-3.4C4.9 12.2 3 10.1 3 7.5V6a1 1 0 0 1 1-1h3V3zm10 4v3.4c1.2-.4 2-1.5 2-2.9V7h-2zM5 7v.5c0 1.4.8 2.5 2 2.9V7H5z"
    />
  </svg>
);

const WinnersBoard: React.FC<{ len: number; rowAt: number[]; wide: boolean }> = ({ len, rowAt, wide }) => {
  const frame = useCurrentFrame();
  const scrim = progress(frame, 0, 10, EASE_OUT) * (1 - progress(frame, len - 10, 10, EASE_IN_OUT));
  const head = progress(frame, 2, 14, EASE_OUT);
  return (
    <AbsoluteFill style={{ opacity: scrim }}>
      {/* dark and soft enough that no face reads under the type (Scott: the heading sat over a face) */}
      <AbsoluteFill style={{ backdropFilter: "blur(22px)", backgroundColor: "rgba(9,9,10,0.8)" }} />
      {/* in the wide cut, centred in the picture above the player's bar (Scott: "centre that") */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: wide ? 110 : 0 }}
      >
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: wide ? 100 : 84,
            color: colors.cream,
            marginBottom: wide ? 64 : 58,
            opacity: head,
            transform: `translateY(${(1 - head) * 24}px)`,
          }}
        >
          The trophy cabinet
        </div>
        {/* a wide frame takes the awards in two columns of three, read down the left first */}
        <div
          style={
            wide
              ? { display: "grid", gridTemplateColumns: "auto auto", gridTemplateRows: "repeat(3, auto)", gridAutoFlow: "column", columnGap: 140, rowGap: 40 }
              : {}
          }
        >
        {WINNERS.map(([award, name], i) => {
          const r = progress(frame, rowAt[i], 12, EASE_OUT);
          return (
            // a clear gap between the awards (Scott: "give some separation here between each")
            <div
              key={award}
              style={{
                marginBottom: !wide && i < WINNERS.length - 1 ? 50 : 0,
                opacity: r,
                transform: `translateY(${(1 - r) * 22}px)`,
              }}
            >
              {wide ? <Trophy size={46} pop={progress(frame, rowAt[i], 8, Easing.out(Easing.back(2)))} /> : null}
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: wide ? 26 : 22,
                  letterSpacing: `${0.6 - 0.36 * r}em`,
                  color: colors.gold,
                  marginBottom: 6,
                }}
              >
                {award}
              </div>
              <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 54, whiteSpace: wide ? "nowrap" : undefined, lineHeight: 1.05, color: colors.cream }}>
                {name}
              </div>
            </div>
          );
        })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Mark: React.FC<{ cut: Cut }> = ({ cut }) => (
  <Img
    src={staticFile("brand/cb-watermark.png")}
    style={{
      position: "absolute",
      right: cut.mark.right,
      bottom: cut.mark.bottom,
      width: cut.mark.w,
      height: cut.mark.w * 1.08,
    }}
  />
);

// The end (Scott: "something fancier than a black end card"; "unless it turns to gold"; then
// "make the 25 pop more, that's a big deal, maybe a counter"): the gala team carries on while
// the room goes dark round giant numerals, a window onto the party with a gold hairline round
// them, counting up from 1, quick at first and slowing as it nears, landing on 25 on the track's
// last hit, each number opening on a different shot of the day, in order (a flipbook); the
// last is the gala team. There the gold floods the numerals, they pop and glow, the logo's light sweep
// crosses them, and "Empowering Independents" comes in above (Scott), YEARS in gold beneath.
// The CBH 25 Years lockup (Scott: "bonus points if you can get it like the lock up ... at the end",
// then "just use the real file", then "blend it, it just looks like it's tacked on"):
// public/brand/cbh-25-years-lockup.png itself, with its own thin white keyline, grown out of the
// count: the gold 25 shrinks and travels onto the lockup's own 25 while the diamond grows out
// behind it (its outline, traced by scripts/amc-25-mark.py, filled in the lockup's ink), the
// film's YEARS closes up into the lockup's; the file's diamond takes over as they land, then
// the bar runs out to the right behind it. Drawn in the file's own pixel units, scaled to the frame.
const LOCK = { src: "brand/cbh-25-years-lockup.png", ink: "#282825", key: "#f8f6f5", gold: "#b08d47" };
const LOCK_INTO = 26; // frames the 25 takes to shrink onto the lockup's
// off: Scott chose to end on the black and gold 25, "Empowering Independents" above it, over
// going on to the charcoal lockup (it read as a second ending after the music's last hit)
const END_ON_LOCKUP = false;
// where the lockup puts a point of the file (in its pixel units) on the frame
const lockAt = (cut: Cut, x: number, y: number) => ({
  x: cut.w / 2 + (x - LOCKUP.width / 2) * cut.lockScale,
  y: cut.lockupY + (y - LOCKUP.centre.y) * cut.lockScale,
});

const Lockup: React.FC<{ cut: Cut; t: number; follow: { x: number; y: number } }> = ({ cut, t, follow }) => {
  // t: frames since the 25 began to shrink; follow: how far (px) the 25 still is from its place
  const grow = progress(t, 10, 20, EASE_OUT); // the diamond, out from behind the shrinking 25
  const take = progress(t, LOCK_INTO - 6, 10); // the file's own diamond and 25 as they land
  const bar = progress(t, LOCK_INTO + 4, 24, EASE_OUT);
  const breathe = interpolate(t, [LOCK_INTO + 28, LOCK_INTO + 200], [1, 1.025], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sc = cut.lockScale;
  const { width, height, centre: c, bar: B } = LOCKUP;
  const left = (cut.w - width * sc) / 2;
  const top = cut.lockupY - c.y * sc;
  const id = `${cut.w}x${cut.h}`;
  const pic = <image href={staticFile(LOCK.src)} x={0} y={0} width={width} height={height} />;
  const about = (k: number) => `translate(${c.x} ${c.y}) scale(${k}) translate(${-c.x} ${-c.y})`;
  return (
    <svg
      width={width * sc}
      height={height * sc}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", left, top, overflow: "visible" }}
    >
      <defs>
        {/* the bar with its keyline, running out from behind the diamond */}
        <clipPath id={`lock-bar-${id}`}>
          <rect x={c.x} y={B.y0 - 3} width={(width - c.x) * bar} height={B.y1 - B.y0 + 6} />
        </clipPath>
        {/* the diamond, a touch larger than its traced outline so its keyline comes too */}
        <clipPath id={`lock-diamond-${id}`}>
          <path d={DIAMOND} transform={about(1.025)} />
        </clipPath>
      </defs>
      <g transform={about(breathe)}>
        <g clipPath={`url(#lock-bar-${id})`}>{pic}</g>
        <g
          opacity={progress(t, 10, 5)}
          transform={`translate(${follow.x / sc} ${follow.y / sc}) ${about(0.2 + 0.8 * grow)}`}
        >
          <path d={DIAMOND} fill={LOCK.ink} stroke={LOCK.key} strokeWidth={2.4} />
        </g>
        <g opacity={take} clipPath={`url(#lock-diamond-${id})`}>
          {pic}
        </g>
      </g>
    </svg>
  );
};

const EndCard: React.FC<{ cut: Cut; open?: boolean }> = ({ cut, open = false }) => {
  const frame = useCurrentFrame();
  const { w, h } = cut;
  const E = cut.end25;
  const hit = hitOf(cut) - endOf(cut); // the opening count lands the same time in
  const len = open ? fB(cut, cut.openUntil ?? OPEN_FLAGS) + PUSH : totalOf(cut) - endOf(cut);
  const dark = progress(frame, 2, 22, EASE_IN_OUT);
  const landDark = progress(frame, hit - 14, 12, EASE_IN_OUT); // the background to black as 25 lands
  const COUNT_FROM = 14 + (cut.late ?? 0); // the whole count moves with `late`, so its ticks keep their sound
  const LAND = hit - 4; // 25 shows a beat's breath before the hit, so only 25 takes the gold
  const countAt = (k: number) => {
    const v = Math.min(1, Math.max(0, (k - COUNT_FROM) / (LAND - COUNT_FROM)));
    return k < COUNT_FROM ? 1 : Math.min(25, 1 + Math.floor(24 * (1 - Math.pow(1 - v, 2.4)) + 1e-6));
  };
  const n = cut.count === false ? 25 : countAt(frame);
  // the flipbook's shot for each number: one a number, or held across several when the cut's
  // flipbook is shorter than 24
  // opening the film, the flipbook runs backwards, night to morning, into the day
  const f24 = open ? undefined : cut.flip24;
  const base = open ? [...(cut.flip ?? FLIP)].reverse() : (cut.flip ?? FLIP);
  const flips = f24 ? [...base, f24] : base;
  const spread = f24 ? 23 : 24; // the numbers the flipbook (less any 24 of its own) runs over
  const shotOf = (k: number) =>
    k >= 25 ? -1 : f24 && k === 24 ? flips.length - 1 : Math.floor(((k - 1) * (flips.length - (f24 ? 1 : 0))) / spread);
  // the frame the shot last changed, so each new shot can kick in like a shutter
  let tickAt = frame;
  while (tickAt > 0 && shotOf(countAt(tickAt - 1)) === shotOf(n)) tickAt -= 1;
  const kick = 1 + 0.06 * (1 - progress(frame - tickAt, 0, 4, EASE_OUT));
  const flip = n < 25 ? flips[shotOf(n)] : null;
  const settle = progress(frame, 2, hit, EASE_OUT);
  // the landing: a quick swell and settle, the gold flooding up in a few frames
  const popUp = progress(frame, LAND, 5, EASE_OUT);
  const popDown = progress(frame, hit + 3, 20, EASE_IN_OUT);
  const s0 = (1.12 - 0.12 * settle) * (1 + 0.09 * popUp - 0.09 * popDown);
  const cx = w / 2;
  const cy = E.base - E.size * 0.33; // the middle of the lining figures
  // then the gold 25 shrinks onto the lockup's own 25 as the diamond grows out behind it, and
  // only hands over once it is there
  const K0 = END_ON_LOCKUP ? hit + 46 : len + 1000; // past the end when off
  const into = progress(frame, K0, LOCK_INTO, EASE_IN_OUT);
  const gone = 1 - progress(frame, K0 + LOCK_INTO - 6, 10);
  const { x: tx, y: ty } = lockAt(cut, LOCKUP.mark.x, LOCKUP.mark.y);
  const ratio = (LOCKUP.mark.h * cut.lockScale) / (E.size * 0.66);
  const s = s0 * (1 - (1 - ratio) * into);
  // the count lands on the lockup's own 25 (Scott: "the 25 looks different now is the issue"),
  // with its YEARS, traced large (BIG25, BIGYEARS), so shrinking into the lockup is one mark
  const is25 = n === 25;
  const B = cut.big25;
  const c25 = { x: cx + (tx - cx) * into, y: B.cy + (ty - B.cy) * into };
  const s25 = B.scale * s0 * (1 - into) + cut.lockScale * into;
  const markT = `translate(${c25.x} ${c25.y}) scale(${s25}) translate(${-LOCKUP.mark.x} ${-LOCKUP.mark.y})`;
  const gold = is25 ? LOCK.gold : colors.gold;
  const glyph = (extra: React.SVGProps<SVGPathElement> & React.SVGProps<SVGTextElement>) =>
    is25 ? (
      <path d={BIG25} transform={markT} {...extra} />
    ) : (
      <text {...numerals} {...extra}>
        {n}
      </text>
    );
  const place = flip ? placeFlip(flip, w, h, cx, cy) : { w, h, left: 0, top: 0 };
  const outline = progress(frame, 10, 14);
  const fill = progress(frame, LAND, 7, EASE_OUT);
  const glow = interpolate(frame, [hit - 2, hit + 4, hit + 60], [0, 1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // the light sweep across the 25 and YEARS, as across the CB in the logo (CBLogo: a soft band
  // at 110 degrees, -60% to 160% over 30 frames), once the line and YEARS are in (Scott: "a
  // shimmer over the 25 too like the CB")
  // in the wide cut it sweeps half a second after the hit, while the music still rings (Scott: "the
  // shimmer ... comes too late after the music")
  const sweepAt = w > h ? hit + 14 : hit + 40;
  const sweep = interpolate(frame, [sweepAt, sweepAt + 30], [-60, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markBox = { x0: 83, y0: 41, x1: 167, y1: 205 }; // the gold 25 and YEARS in the file's units
  const dir = { x: Math.sin((110 * Math.PI) / 180), y: -Math.cos((110 * Math.PI) / 180) };
  const across = (markBox.x1 - markBox.x0) * dir.x + (markBox.y1 - markBox.y0) * dir.y;
  const at = (pc: number) => ({
    x: markBox.x0 + dir.x * across * (pc / 100),
    y: markBox.y0 + dir.y * across * (pc / 100),
  });
  const bandFrom = at(sweep - 25);
  const bandTo = at(sweep + 25);
  const line = progress(frame, hit + 10, 20, EASE_OUT);
  const years = progress(frame, hit + 18, 20, EASE_OUT);
  const EDGE = 40; // the soft top of the rising gold
  const zoom = interpolate(frame, [0, len], [1.03, 1.06]); // on from the gala shot's own push
  const id = `amc25-${w}x${h}`;
  const numerals = {
    x: cx,
    y: E.base,
    textAnchor: "middle" as const,
    fontFamily: serif,
    fontWeight: 700,
    fontSize: E.size,
    style: { fontVariantNumeric: "lining-nums tabular-nums" as const, letterSpacing: "-0.02em" },
    transform: `translate(${cx + (tx - cx) * into} ${cy + (ty - cy) * into}) scale(${s}) translate(${-cx} ${-cy})`,
  };
  // the whole team, framed as the shot before it (edge to edge, its blurred copy above and below)
  const fade = "linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)";
  const img: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectPosition: "50% 50%",
    transformOrigin: "50% 50%",
  };
  // the 16:9 cut's flipbook a little sharper and brighter behind the numerals, enough to make out
  // the faces (Scott)
  const wide = w > h;
  const photo = open ? (
    <AbsoluteFill style={{ backgroundColor: colors.black }} />
  ) : (
    <AbsoluteFill>
      {wide ? null : (
        <Img
          src={staticFile(A + END_PHOTO.src)}
          style={{ ...img, objectFit: "cover", transform: "scale(1.15)", filter: `${gradeUrl("night")} blur(28px) brightness(0.55)` }}
        />
      )}
      <Img
        src={staticFile(A + END_PHOTO.src)}
        style={
          wide
            ? { ...img, objectFit: "cover", objectPosition: WIDE_TEAM_POS, transformOrigin: WIDE_TEAM_POS, transform: `scale(${zoom})`, filter: gradeUrl("night") }
            : {
                ...img,
                objectFit: "contain",
                transform: `scale(${zoom})`,
                filter: gradeUrl("night"),
                maskImage: fade,
                WebkitMaskImage: fade,
              }
        }
      />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            {glyph({})}
          </clipPath>
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={is25 ? 36 / s25 : 36} />
          </filter>
        </defs>
      </svg>
      {/* behind the numerals the flipbook runs faintly across the whole frame, soft and dim, so each
          shot reads as a shot and the numerals are the bright windows; black once 25 lands */}
      {frame >= COUNT_FROM && flip ? (
        <Img
          src={staticFile(A + flip.src)}
          style={{
            position: "absolute",
            width: place.w,
            height: place.h,
            left: place.left,
            top: place.top,
            transform: `scale(${kick})`,
            transformOrigin: `${cx - place.left}px ${cy - place.top}px`,
            filter: `${gradeUrl(flip.grade)} blur(${wide ? 2.5 : 6}px)`,
          }}
        />
      ) : (
        <AbsoluteFill>{photo}</AbsoluteFill>
      )}
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: Math.max(dark * (wide ? 0.68 : 0.74), landDark) }} />
      {/* the card takes the lockup's own charcoal as it arrives (Scott: "blend it ... with the black end
          card"), so its diamond and bar sit in the card: the keyline, the gold and the words remain */}
      <AbsoluteFill style={{ backgroundColor: LOCK.ink, opacity: progress(frame, K0 + 6, 30, EASE_IN_OUT) }} />
      {/* the lockup, under the numerals: its diamond grows out behind the shrinking 25 */}
      {frame >= K0 ? <Lockup cut={cut} t={frame - K0} follow={{ x: c25.x - tx, y: c25.y - ty }} /> : null}
      {/* the glow behind the gold numerals as they land */}
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: glow * fill * gone }}>
        {glyph({ fill: gold, filter: `url(#${id}-glow)` })}
      </svg>
      <AbsoluteFill style={{ clipPath: `url(#${id})`, opacity: progress(frame, 0, 12) * gone }}>
        {flip ? (
          <Img
            src={staticFile(A + flip.src)}
            style={{
              position: "absolute",
              width: place.w,
              height: place.h,
              left: place.left,
              top: place.top,
              transform: `scale(${kick})`,
              transformOrigin: `${cx - place.left}px ${cy - place.top}px`,
              filter: gradeUrl(flip.grade),
            }}
          />
        ) : (
          photo
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: fill * (h + EDGE),
            background: `linear-gradient(to top, ${gold} calc(100% - ${EDGE}px), ${gold}00 100%)`,
          }}
        />
      </AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {glyph({ fill: "none", stroke: gold, strokeWidth: 2.5 / (is25 ? s25 : s), opacity: outline * gone })}
        {/* the lockup's YEARS under its 25, travelling with it */}
        <path d={BIGYEARS} transform={markT} fill={gold} opacity={is25 ? years * gone : 0} />
        {is25 && sweep > -60 && sweep < 160 ? (
          <g transform={markT} opacity={gone}>
            <defs>
              <linearGradient
                id={`${id}-sweep`}
                gradientUnits="userSpaceOnUse"
                x1={bandFrom.x}
                y1={bandFrom.y}
                x2={bandTo.x}
                y2={bandTo.y}
              >
                <stop offset={0} stopColor="rgb(255,246,220)" stopOpacity={0} />
                <stop offset={0.5} stopColor="rgb(255,246,220)" stopOpacity={0.95} />
                <stop offset={1} stopColor="rgb(255,246,220)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={BIG25} fill={`url(#${id}-sweep)`} />
            <path d={BIGYEARS} fill={`url(#${id}-sweep)`} opacity={years} />
          </g>
        ) : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: E.lineTop,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 500,
          fontSize: cut.lineSize,
          color: colors.cream,
          opacity: line * (1 - progress(frame, K0, 10)),
          transform: `translateY(${(1 - line) * 30}px)`,
        }}
      >
        Empowering Independents
      </div>
      <Mark cut={cut} />
    </AbsoluteFill>
  );
};

// The ending when the count has opened the film (Scott: "this photo should be last"): the gala team
// full bleed, popping in on the outro's downbeat with a slow push, "Empowering Independents" rising
// over a soft shade, the music played straight to its last hit, a short fade to black.
const TeamEnd: React.FC<{ cut: Cut }> = ({ cut }) => {
  const frame = useCurrentFrame();
  const len = totalOf(cut) - endOf(cut);
  const pop = 1 + 0.08 * (1 - progress(frame, 0, 9, EASE_OUT));
  const line = progress(frame, 24, 22, EASE_OUT);
  const out = progress(frame, len - 18, 18, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Img
        src={staticFile(A + END_PHOTO.src)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: WIDE_TEAM_POS,
          transformOrigin: WIDE_TEAM_POS,
          transform: `scale(${pop * interpolate(frame, [0, len], [1, 1.06])})`,
          filter: gradeUrl("night"),
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, rgba(9,9,10,0) 50%, rgba(9,9,10,0.7) 88%)",
          opacity: line,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: cut.bottom,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 88,
          color: colors.cream,
          textShadow: "0 3px 24px rgba(9,9,10,0.6)",
          opacity: line,
          transform: `translateY(${(1 - line) * 30}px)`,
        }}
      >
        Empowering Independents
      </div>
      <Mark cut={cut} />
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: out }} />
    </AbsoluteFill>
  );
};

// The ending after Bianca's amends (the count now opens the film): thank you to the sponsors and
// speakers over their logos, played on the track's outro, then "See you next year" and the CB logo
// on the last hit, its light sweep, a short fade to black.
const ThanksEnd: React.FC<{ cut: Cut }> = ({ cut }) => {
  const frame = useCurrentFrame();
  const len = totalOf(cut) - endOf(cut);
  // the CB lands on the track's last cymbal crash (91.475s; Scott: "land sooner on the last cymbal hit"),
  // its 40-frame reveal ending there and its light sweep starting on it
  const crash = Math.round(((cut.track.crash ?? 91.475) - cut.track.outro + leadOf(cut)) * 30);
  const thanks = progress(frame, 0, 14, EASE_OUT);
  // the wall pops in on the beat the card lands on, overshooting a touch (Scott: "pop more")
  const wallPop = progress(frame, 0, 12, Easing.out(Easing.back(2.4)));
  // the line comes up just before the crash, the CB pops in on it (Scott: "the logo on beat")
  const away = progress(frame, crash - 30, 12, EASE_IN_OUT);
  const next = progress(frame, crash - 16, 14, EASE_OUT);
  const cbPop = progress(frame, crash, 12, Easing.out(Easing.back(2.2)));
  const out = progress(frame, len - 18, 18, EASE_IN_OUT);
  // the team dissolves into the card's black (its layer runs on 10 frames under it), not a hard cut
  const ground = progress(frame, 0, 10, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: ground }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 120,
          opacity: thanks * (1 - away),
          transform: `translateY(${(1 - thanks) * 30 - away * 20}px)`,
        }}
      >
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 88, lineHeight: 1, color: colors.cream, marginBottom: 14 }}>
          {/* Bianca's copy (26 Oct): "change copy to 'With Thanks to Our Partners'" */}
          With Thanks to Our Partners
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 280px)", columnGap: 36, rowGap: 26, marginTop: 50 }}>
          {THANKS_LOGOS.map((l) => {
            // the whole wall at once, so it is there to read from the start (Scott: "come in all at once")
            const on = Math.min(1, wallPop * 1.6);
            const logo = l.file ? LOGOS[l.file] : undefined;
            // the same ink area for each, so a long wordmark and a compact block weigh alike
            const lw = logo ? Math.min(224, Math.sqrt(7600 * logo.a), 84 * logo.a) : 0;
            return (
              <div
                key={l.name}
                style={{
                  height: 118,
                  borderRadius: 10,
                    background: l.type || l.text || logo?.tile === "light" ? "#FFFFFF" : logo ? "#282825" : "transparent", // CBH charcoal
                  border: l.type || l.text || logo?.tile === "light" ? "none" : "1px solid rgba(195,158,85,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: on,
                  transform: `scale(${0.7 + 0.3 * wallPop})`,
                }}
              >
                {l.type ? (
                  // his wordmark: "Nick" in a heavy serif over "saunders" in a light one, slate ink
                  <div style={{ color: "#3B3A45", lineHeight: 0.86, textAlign: "left" }}>
                    <div style={{ fontFamily: "Source Serif 4", fontWeight: 700, fontSize: 52, letterSpacing: "-0.02em" }}>Nick</div>
                    <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 55, letterSpacing: "-0.01em" }}>Saunders</div>
                  </div>
                ) : l.text ? (
                  // a name with no logo, set plainly in dark ink like a wordmark
                  <div style={{ color: "#2B2A28", textAlign: "center", lineHeight: 1 }}>
                    <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 40 }}>{l.text[0]}</div>
                    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 15, letterSpacing: "0.42em", paddingLeft: "0.42em", marginTop: 8 }}>
                      {l.text[1]}
                    </div>
                  </div>
                ) : logo ? (
                  <Img src={staticFile(`${A}logos/${l.file}.png`)} style={{ width: lw, height: lw / logo.a }} />
                ) : (
                  <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 15, letterSpacing: "0.2em", color: "rgba(195,158,85,0.6)" }}>
                    {l.name.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: next,
          transform: `translateY(${(1 - next) * 30}px)`,
        }}
      >
        {/* on one line, the logo bigger beneath it (Scott) */}
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 92, lineHeight: 1, color: colors.cream, textAlign: "center", whiteSpace: "nowrap" }}>
          See you next year
        </div>
        <div style={{ marginTop: 48, transform: `scale(${0.8 + 0.2 * cbPop})`, opacity: Math.min(1, cbPop * 2) }}>
          <CBLogo start={crash - 2} width={330} shimmerAt={crash + 12} cbOnly revealFrames={8} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: out }} />
    </AbsoluteFill>
  );
};

const Film: React.FC<{ cut: Cut }> = ({ cut }) => {
  const endAt = endOf(cut);
  const total = totalOf(cut);
  // where the music jumps back, if its track runs short of the reel
  const rewindAt =
    cut.track.rewindAt !== undefined && NAME + cut.track.rewindAt < cut.end ? fB(cut, NAME + cut.track.rewindAt) : null;
  const MUSIC_GAIN = 0.8 * (cut.track.gain ?? 1);
  const span = (a: number, b: number) => ({ from: fB(cut, a), durationInFrames: fB(cut, b) - fB(cut, a) });
  const inside = (a: number) => a >= cut.start && a < cut.end;
  const boardAt = cut.boardAt ?? BOARD_AT; // its rows (and their ticks) keep their spacing from it
  const boardEnd = cut.boardEnd ?? BOARD_END;
  const night = cut.night ?? NIGHT;
  const winAt = cut.winnerAt ?? NAME;
  const winHits = cut.winHits ?? WINNER_HITS.map(([, b]) => b);
  const lineFrom = winAt + winHits[0] - 0.3; // the line comes up just before its first word
  // the music dips under the voice, in 0.025 steps (a per-frame value overflowed ffmpeg's expression)
  const voiceAt = cut.voice ? fB(cut, cut.voice.at) : 0;
  const voiceEnd = cut.voice ? voiceAt + Math.round(cut.voice.len * 30) : 0;
  const duck = (f: number) =>
    cut.voice
      ? Math.round(
          interpolate(f, [voiceAt - 6, voiceAt + 6, voiceEnd - 12, voiceEnd + 6], [1, cut.voice.duck, cut.voice.duck, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * 40,
        ) / 40
      : 1;
  // the room kicks a little on each word of "And the winner is", like the drum hits it lands on
  const frame = useCurrentFrame();
  const kick =
    1 +
    winHits.reduce((k, b) => {
      const at = fB(cut, winAt + b);
      return frame >= at ? k + 0.035 * (1 - progress(frame, at, 9, EASE_OUT)) : k;
    }, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <GradeFilters />
      {cut.open25 ? (
        <Sequence durationInFrames={fB(cut, cut.openUntil ?? OPEN_FLAGS) + PUSH}>
          <EndCard cut={cut} open />
        </Sequence>
      ) : null}
      <AbsoluteFill style={{ transform: `scale(${kick})` }}>
        {layersOf(cut).map((layer) => {
          const start = layer.first ? 0 : layer.at - PUSH / 2;
          return (
            <Sequence key={layer.key} from={start} durationInFrames={layer.until - start}>
              <Panel layer={layer} cut={cut} start={start} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <FilmFinish />
      {cut.label ? (
        <Sequence {...span(cut.label[0], cut.label[1])}>
          <Label
            cut={cut}
            len={span(cut.label[0], cut.label[1]).durationInFrames}
            caps={cut.labelCaps ?? "FOREST OF ARDEN"}
            lines={["25th Anniversary", "AMC"]}
          />
        </Sequence>
      ) : null}
      {(cut.labels ?? []).map((l) => (
        <Sequence key={l.caps} {...span(l.from, l.to)}>
          <Label cut={cut} len={span(l.from, l.to).durationInFrames} caps={l.caps} lines={l.lines} />
        </Sequence>
      ))}
      {inside(night) ? (
        <Sequence {...span(night + 0.3, night + (cut.nightLen ?? 5.6))}>
          <Label
            cut={cut}
            len={span(night + 0.3, night + (cut.nightLen ?? 5.6)).durationInFrames}
            caps="GALA AWARDS DINNER"
            lines={["Then came", "the trophies"]}
          />
        </Sequence>
      ) : null}
      {inside(winAt + winHits[0]) ? (
        <Sequence {...span(lineFrom, winAt + 0.1)}>
          <Line
            cut={cut}
            len={span(lineFrom, winAt + 0.1).durationInFrames}
            words={WINNER_HITS.map(([text], i) => ({ text, at: fB(cut, winAt + winHits[i]) - fB(cut, lineFrom) }))}
          />
        </Sequence>
      ) : null}
      {cut.noName ? null : (
        <Sequence {...span(NAME + 0.3, cut.nameUntil ?? NAME + 10.5)}>
          <Label
            cut={cut}
            len={span(NAME + 0.3, cut.nameUntil ?? NAME + 10.5).durationInFrames}
            caps="SALES SUPERSTAR 2026"
            lines={["Donnington Group"]}
          />
        </Sequence>
      )}
      {inside(boardAt) ? (
        <Sequence {...span(boardAt, boardEnd)}>
          <WinnersBoard
            wide={cut.w > cut.h}
            len={span(boardAt, boardEnd).durationInFrames}
            rowAt={WINNERS.map(
              (_, i) => fB(cut, boardAt + (cut.rowsAfter ?? ROWS_AT - BOARD_AT) + (cut.rowEvery ?? ROW_EVERY) * i) - fB(cut, boardAt),
            )}
          />
        </Sequence>
      ) : null}
      <Sequence durationInFrames={endAt + 10}>
        <Mark cut={cut} />
      </Sequence>
      <Sequence from={endAt}>
        {cut.endThanks ? <ThanksEnd cut={cut} /> : cut.endTeam ? <TeamEnd cut={cut} /> : <EndCard cut={cut} />}
      </Sequence>
      {/* the groove to the end card, on top all the way (Scott: "if you can't blend it just put the
          music over": the host's voice was too thin to dip the music for, so the room is only
          its cheer, under the music) */}
      <Sequence durationInFrames={(rewindAt ?? endAt) + 3}>
        <Audio
          src={staticFile(cut.track.src)}
          trimBefore={Math.round(at(cut, cut.start) * 30)}
          volume={(f) =>
            MUSIC_GAIN *
            duck(f) *
            interpolate(f, [0, 3, rewindAt ?? endAt, (rewindAt ?? endAt) + 3], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
      {rewindAt !== null ? (
        <Sequence from={rewindAt} durationInFrames={endAt + 3 - rewindAt}>
          <Audio
            src={staticFile(cut.track.src)}
            trimBefore={Math.round((at(cut, NAME + (cut.track.rewindAt ?? 0)) - (cut.track.rewindBack ?? 0) * cut.track.beat) * 30)}
            volume={(f) =>
              MUSIC_GAIN *
              interpolate(f, [0, 3, endAt - rewindAt, endAt - rewindAt + 3], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ) : null}
      {/* then on a bar to the track's outro, under the 25, filtered (Scott: "or use filtered
          sound"): muffled as the room goes dark, opening with the count, full band as 25 lands
          (`sfx/outro-<id>.wav`, scripts/amc-25-sfx.py) */}
      <Sequence from={endAt} durationInFrames={total - endAt}>
        <Audio
          src={staticFile(cut.endTeam || cut.endThanks ? cut.track.src : `${A}sfx/outro-${cut.track.id}.wav`)}
          trimBefore={cut.endTeam || cut.endThanks ? Math.round((cut.track.outro - leadOf(cut)) * 30) : undefined}
          volume={(f) =>
            MUSIC_GAIN *
            interpolate(f, [0, 3, total - endAt - 20, total - endAt], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
      {cut.voice ? (
        <Sequence from={voiceAt} durationInFrames={voiceEnd - voiceAt}>
          <Audio src={staticFile(A + cut.voice.src)} />
        </Sequence>
      ) : null}
      {/* the winners board's sound: a breath as it comes up, a soft tick for each award */}
      {inside(boardAt) ? (
        <Sequence {...span(boardAt, boardEnd)}>
          <Audio src={staticFile(`${A}sfx/board-${cut.track.id}.wav`)} />
        </Sequence>
      ) : null}
      {/* the 25's sound (Scott: "add sound effects to the 25"): the ticks, the landing, the shimmer */}
      {/* moved with `late` like the count itself, so the ticks start as the 1 turns over (Scott: "the
          counter starts ticking but the one remains") */}
      {cut.open25 ? (
        <Sequence from={cut.late ?? 0} durationInFrames={fB(cut, cut.openUntil ?? OPEN_FLAGS) - (cut.late ?? 0)}>
          <Audio src={staticFile(`${A}sfx/counter-${cut.track.id}.wav`)} volume={0.7} />
        </Sequence>
      ) : null}
      {cut.count !== false && !cut.endTeam && !cut.endThanks ? (
        <Sequence from={endAt + (cut.late ?? 0)} durationInFrames={total - endAt - (cut.late ?? 0)}>
          <Audio src={staticFile(`${A}sfx/counter-${cut.track.id}.wav`)} volume={0.7} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export type AmcTrackId = keyof typeof AMC_TRACKS;
export const AMC_REEL_W = 1080;
export const AMC_REEL_H = 1350;
export const AMC_STORY_W = 1080;
export const AMC_STORY_H = 1920;
// the count first (Scott: "try to put the ticking 25 at the beginning ... going back in time"): it
// lands on the downbeat four beats before the flags, the day follows, the gala team last
const OPEN_FLAGS = -16;
const landscapeOpen = (track: Track): Cut => ({
  ...landscape(track),
  start: OPEN_FLAGS - 4 - (track.hit - track.outro) / track.beat,
  end: NAME + 28, // Table 3, then the team as the end card
  open25: true,
  endTeam: true,
});
// Bianca's amends (23 Oct): the count opens, the day, the awards one by one, the people, the team,
// then thank you and see you next year
const landscapeAmends = (track: Track): Cut => ({
  ...landscape(track),
  // the film starts a beat earlier, so the 25 holds a beat longer before the flags (Scott: "hold a beat
  // longer"); it now lands on the downbeat a bar before them
  start: OPEN_FLAGS - 5 - (track.hit - track.outro) / track.beat,
  // the end card a beat sooner, the music with it, so the sponsors' wall holds a beat longer and the
  // CB still lands on the last crash (Scott: "hold the sponsor wall a beat longer")
  end: NAME + 35,
  outroLead: 1,
  open25: true,
  // the 25 holds through the drum roll and the flags cut in on its hit (27.95s into the track, beat
  // -13.1; Scott: "hold until drum roll then next shot on drum roll")
  openUntil: WIDE2_FLAGS,
  labelCaps: "FOREST OF ARDEN HOTEL & COUNTRY CLUB", // the hotel's full name (Bianca)
  label: [WIDE2_FLAGS + 0.4, -9.6], // a touch shorter with the venue shot; fades with the push into the welcome stand, clear of Liz
  labels: [{ from: 7.3, to: 12.2, caps: "WELCOME", lines: ["Empowering independents", "since 2001"] }], // with Phill, after the stands (Bianca's copy, 26 Oct; 2001, Scott)
  endThanks: true,
  scenes: LANDSCAPE2,
  night: WIDE2_NIGHT,
  winnerAt: WIDE2_WIN, // "And the winner is" builds to the first winner
  // them accepting with the Sales Superstar label, the trophy cabinet over the walk-up, as before the
  // amends (Scott: "go back to them accepting and the label as it was before")
  nameUntil: NAME + 4,
  // the opening count runs its flipbook backwards (EndCard `open`), so this list goes in night first: the
  // 1 opens on the Classic British banner at the door, its gold CB inside the numeral (Scott: "make
  // sure it's a good photo inside"; the slide in it read as coloured blocks)
  // the slide (11:54) read as coloured blocks in 20-24, the longest held, so the panel on stage goes last
  flip: ["stills/wide/panel-wide.jpg", "stills/wide/20261019_115429.jpg", "stronger-together.jpg", "stills/wide/20261019_095046.jpg", "banner-arrivals.jpg"].map(
    (src) => WIDE_FLIP2.find((f) => f.src === src) as Flip,
  ),
  boardAt: NAME + 4.3,
  boardEnd: 68,
});
// The same edit on another track (Bianca, 27 Oct: Glorious; "the edit is spot on, just needs to be to this
// track"): every beat of the edit (laid out on Light it Up Boy, a beat every 0.5042s) keeps its place in
// seconds through anchors (the film's start, the flags' hit, the name, the end card), each moment on a whole
// or half beat snapping to the nearest beat of the new track, sub-beat offsets (a push's lead, a label's
// breath) kept as they were in seconds
const EDIT_BEAT = AMC_TRACKS.light.beat;
const remapper = (anchors: [number, number][]) => {
  // piecewise linear through the anchors, the end segments carried on past them
  const lin = (b: number) => {
    let i = 0;
    while (i < anchors.length - 2 && b > anchors[i + 1][0]) i += 1;
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    return y0 + ((b - x0) * (y1 - y0)) / (x1 - x0);
  };
  return (b: number) => (Math.abs(b * 2 - Math.round(b * 2)) < 1e-6 ? Math.round(lin(b)) : lin(b));
};
const remapScenes = (scenes: Scene[], m: (b: number) => number, k: number): Scene[] =>
  scenes.map((sc) => ({
    ...sc,
    b: m(sc.b),
    stagger: sc.stagger === undefined ? undefined : sc.stagger * k,
    swaps: sc.swaps?.map((w) => ({ ...w, b: m(w.b) })),
  }));
// Three takes on where the edit sits in the song (Scott: "try a few timings and show me options"), each with
// the name on a chorus's first beat and the same ending (the end card four bars before the song's last hit).
// Beats are the track's grid (0.1515s + 0.387955s n); sections start on beats 4n + 3.
//   a: the final chorus (beat 443): the count over the second chorus, the flags on its last hit (361), the
//      night as the bridge lifts, "And the winner is" over the bridge's hush
//   b: the second chorus (283): the 25 lands as the first chorus stops dead (187) and holds in the silence,
//      the flags as the band comes back (76.47s, into beat 197), the reveal out of the breakdown before the chorus
//   c: the first chorus (107): the count over the quiet intro, the flags as the verse kicks in (23), the
//      reveal out of the short breakdown
type GloriousTakeSpec = {
  name: number;
  flags: number;
  night: number;
  start?: number; // the film's first beat (else 22 before the flags): the count lands 14 beats on
  // laid out by hand on the song (else the edit's seconds snapped to the grid): the track beat each scene of
  // LANDSCAPE2 cuts in on, the first winner's beat, the two labels and the board's end, all track beats
  cuts?: number[];
  win?: number;
  forest?: [number, number];
  welcome?: [number, number];
  board?: number; // the beat the winners board comes up on
  boardEnd?: number;
};
const GLORIOUS_TAKES: Record<"a" | "b" | "c", GloriousTakeSpec> = {
  a: { name: 443, flags: 361, night: 22 },
  // b by hand (Scott: "try to map it to b better"): every cut on a kick or snare (odd beats), each new part of
  // the day on a bar's downbeat (4n + 3), through verse two's four-bar phrases: flags as the band comes back
  // (its pickup into 197), the welcome stand (201), the exhibitors (215), Phill's keynote (223),
  // the talks, the night (251), the room on the verse's last big bar (263), "And the winner is" on the four drum
  // hits into the breakdown (267-273), The Imperial and Hogarths in it, Donnington on the chorus (283); after
  // it the people a bar each on the beat (309-321), the team six beats (325), the end card on a bar (331)
  b: {
    name: 283,
    flags: 195,
    night: 24,
    // the 25 lands as the first chorus stops dead (187) and holds through the silence; the band comes back on a
    // crash just ahead of beat 197 (76.53s, measured in the render), and the aerial's push settles exactly on it
    // (centred on 196.34: frames 265-279)
    start: 173,
    cuts: [196.34, 201, 209, 215, 223, 231, 237, 245, 251, 263, 275, 279, 283, 309, 313, 317, 321, 325],
    win: 275,
    forest: [196.9, 201.4],
    welcome: [223.4, 230.6],
    board: 289, // on a drum hit, its awards then every three beats (290-305), held to the montage on 309
    boardEnd: 309,
  },
  c: { name: 107, flags: 23, night: 24 },
};
export type GloriousTake = keyof typeof GLORIOUS_TAKES;
const GLORIOUS_T0 = 0.13431; // the grid's beat 0, s
const glorious = (take: GloriousTake = "a"): Cut => {
  const t = GLORIOUS_TAKES[take];
  const old = landscapeAmends(AMC_TRACKS.light);
  const track: Track = { ...AMC_TRACKS.glorious, name: GLORIOUS_T0 + t.name * AMC_TRACKS.glorious.beat };
  const k = EDIT_BEAT / track.beat;
  // a new beat v plays at the name + (v - NAME) beats: the film starts 22 beats before the flags (a bar's
  // downbeat, so the count lands 14 beats on and holds to the flags), the end card 48 beats after the name
  const flagsV = NAME - (t.name - t.flags);
  const m = remapper([
    [-29.5, flagsV - 22],
    [-13.1, flagsV],
    [NAME, NAME],
    [NAME + 35, NAME + 48],
  ]);
  const v = (beat: number) => NAME + beat - t.name; // a track beat as a beat of the cut
  const NIGHT_B = t.cuts ? v(t.cuts[LANDSCAPE2.findIndex((sc) => sc.b === WIDE2_NIGHT)]) : t.night; // Rachel and the gala label
  const WIN_B = t.win !== undefined ? v(t.win) : 42; // The Imperial; Hogarths after; Donnington on the chorus
  const scenes = t.cuts
    ? remapScenes(LANDSCAPE2, m, k).map((sc, i) => ({ ...sc, b: v((t.cuts as number[])[i]) }))
    : remapScenes(LANDSCAPE2, m, k).map((sc) =>
        sc.b === m(WIDE2_NIGHT) ? { ...sc, b: NIGHT_B } : sc.b === m(WIDE2_WIN) ? { ...sc, b: WIN_B } : sc.b === m(WIDE2_WIN + 2.5) ? { ...sc, b: 45 } : sc,
      );
  const welcome = t.welcome;
  return {
    ...old,
    track,
    start: t.start !== undefined ? NAME + t.start - t.name : flagsV - 22,
    end: NAME + 48,
    outroLead: 0,
    late: 0,
    openUntil: t.cuts ? NAME + t.cuts[0] - t.name : m(WIDE2_FLAGS), // the 25 until the flags' push
    label: t.forest ? [v(t.forest[0]), v(t.forest[1])] : old.label ? [m(old.label[0]), m(old.label[1])] : null,
    labels: old.labels?.map((l) => (welcome ? { ...l, from: v(welcome[0]), to: v(welcome[1]) } : { ...l, from: m(l.from), to: m(l.to) })),
    scenes,
    night: NIGHT_B,
    winnerAt: WIN_B,
    // a word on each of the last four drum hits before the hush (two beats apart, on the kick and snare)
    winHits: [-8, -6, -4, -2],
    nameUntil: m(old.nameUntil ?? NAME + 4),
    boardAt: t.board !== undefined ? v(t.board) : m(old.boardAt ?? BOARD_AT),
    boardEnd: t.boardEnd !== undefined ? v(t.boardEnd) : m(old.boardEnd ?? BOARD_END),
    // the awards on the beat: the first a beat after the board, then every three beats (1.16s; they were 1.0s)
    rowsAfter: 1,
    rowEvery: 3,
    nightLen: 5.6 * k, // the gala label held as long in seconds as it was
  };
};
export const amcWideGloriousFrames = (take: GloriousTake = "a") => totalOf(glorious(take));
export const AmcWideGlorious: React.FC<{ take?: GloriousTake }> = ({ take = "a" }) => <Film cut={glorious(take)} />;
export const amcWideOpenFrames = (track: AmcTrackId) => totalOf(landscapeOpen(AMC_TRACKS[track]));
export const AmcWideOpen: React.FC<{ track: AmcTrackId }> = ({ track }) => <Film cut={landscapeOpen(AMC_TRACKS[track])} />;
export const AMC_WIDE_W = 1920;
export const AMC_WIDE_H = 1080;
export const amcWideFrames = (track: AmcTrackId) => totalOf(landscapeAmends(AMC_TRACKS[track]));
export const amcReelFrames = (track: AmcTrackId) => totalOf(reel(AMC_TRACKS[track]));
export const amcStoryFrames = (track: AmcTrackId) => totalOf(story(AMC_TRACKS[track]));

export const AmcReel: React.FC<{ track: AmcTrackId }> = ({ track }) => <Film cut={reel(AMC_TRACKS[track])} />;
export const AmcStory: React.FC<{ track: AmcTrackId }> = ({ track }) => <Film cut={story(AMC_TRACKS[track])} />;
export const AmcWide: React.FC<{ track: AmcTrackId }> = ({ track }) => <Film cut={landscapeAmends(AMC_TRACKS[track])} />;
