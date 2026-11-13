import type { ChatSpec } from "../hotel-film/chat/ChatReel";

// The Dad version of the Black Friday chat reel (Scott, 15 Oct: "make one from Dad
// instead of the Mum one ... what do you want for your birthday ... thanks Dad, you know
// ... different emojis, autumn guy thumbnail, more guy shots"). Same idea and engine
// (src/hotel-film/chat, from claude/sharp-darwin-suaml5), its own words: Dad asks what
// he's after, "A night away somewhere?" opens into the break, a bar a shot, each
// with its own reply, then back to the thread for the voucher. A birthday, so not tied
// to Christmas or Black Friday; the claims stay those of the gift-voucher page
// (overnight-stay experiences; spa, dining and golf). No full stops; no word twice in
// the replies (Scott: "a proper, proper, too much"); three emoji, different from Mum's
// (🎂 👍 🙌).
//
// Dad: a Pexels portrait Scott picked (snow behind, cropped to his face and warmed).
// Shots, chosen for a more traditional dad feel but nothing that names the person
// replying (Scott: "leave it generic"), none in the Mum reel: golf at Whittlebury, boots
// on the bed after a walk at Ilsington, the Wild Boar's pie, the pub sign at Ruthin
// Castle in autumn (Tafarn y Ddraig), Hatherley Manor's spa (Scott's stills), a burst,
// Hythe's bedroom.
//
// Music: "Acoustic Upbeat Folk (Happy Feels)" by MarkJuly (Pixabay Content License,
// 113869; Scott's pick of the shortlist), 129 BPM, a beat every 13.9 frames
// (scripts/analyze-beats.py: beat k at 5.3 + 13.906k in the file; downbeats on 3, 7,
// 11 ...; phrase starts 27, 35, 43, 59, 75). From the beat-15 downbeat (7.13s): Dad on
// 17, the replies 20 and 23, a bar to sit with the thread (Scott: "let it linger before
// the zoom in"), the bubble opens on 31 into golf, held two bars as it opens (Scott: "a
// round of golf too fast"); then a shot a bar (39, 43, 47, 51, the burst 55), the lie
// in 59 held two bars; folding back on 67; a beat, then Dad typing 69, "Leave it with
// me" 72, a bar to land before the voucher 76 (Scott: too fast), "Thanks Dad" 80; the
// end card 87; fading 91; 37s.

const P = "campaigns/dad-birthday";
const START = 214; // the file's beat 15
const b = (k: number) => Math.round(5.3 + 13.906 * k) - START;

export const dadBirthdayChat: ChatSpec = {
  id: "dad-birthday-chat",
  durationInFrames: b(87) + 110, // 37s
  music: {
    src: `${P}/happy-feels.mp3`,
    startAt: START,
    gain: 0.5, // the file is loud (-9.4 LUFS); ~-15 LUFS with the UI sounds
    fadeIn: 6,
    fadeFrom: b(91),
  },
  contact: "Dad",
  contactPhoto: `${P}/dad-avatar.jpg`, // Pexels portrait, free licence (Scott's pick)
  // Its own words, not Mum's thread with the names swapped (Scott: "switch up the chat
  // so it's fresh"): Dad, the way dads text; the reply playing it down, then not.
  messages: [
    { at: 4, from: "them", stamp: "Today 18:15" },
    { at: 6, from: "them", typing: b(17) - 4 }, // Dad typing first
    {
      at: b(17),
      from: "them",
      text: "Birthday's coming up 🎂 what are you after?",
      time: "18:15",
    },
    { at: b(20), from: "me", text: "Don't get me anything", time: "18:32" },
    {
      at: b(23),
      from: "me",
      text: "A night away somewhere?", // short enough for its time to sit clear
      time: "18:33",
    },
    { at: b(69), from: "them", typing: b(72) - 4 },
    { at: b(72), from: "them", text: "Leave it with me 👍", time: "20:04" },
    {
      at: b(76),
      from: "them",
      voucher: {
        src: "campaigns/black-friday/gift-vouchers.png",
        size: [1200, 909],
        // generic, not "son" (Scott: anyone might be after this)
        caption: "Happy birthday",
        title: "Gift voucher",
      },
      time: "20:05",
    },
    {
      at: b(80),
      from: "me",
      text: "Thanks Dad, you know me 🙌", // Scott's line
      time: "20:05",
    },
  ],
  open: { message: 4, at: b(31), close: b(67), grow: 40 },
  shots: [
    {
      at: b(31),
      reply: "A round of golf",
      tag: "Whittlebury Park",
      still: {
        src: "hotels/whittlebury-park/golf.jpg",
        size: [1920, 1281],
        cx: 300,
      },
    },
    {
      at: b(39),
      reply: "A long walk",
      tag: "Ilsington Country House Hotel & Spa",
      // boots up on the bed with the map, one moment (the source cuts in from boots on
      // the floor: Scott wants no cut inside a shot), eased a touch slower to fill the bar
      clip: { src: `${P}/ilsington-boots.mp4`, from: 0 },
    },
    {
      at: b(43),
      reply: "A big dinner", // Scott: natural, the way you'd text your dad
      tag: "Wild Boar Estate",
      clip: { src: `${P}/wild-boar-pie.mp4`, from: 0.4 },
    },
    {
      at: b(47),
      reply: "Then the pub",
      tag: "Ruthin Castle Hotel & Spa",
      // the castle's own pub sign in autumn colour (slowed from a 1s shot)
      // past the source's previous shot (Scott: "a weird cut at 13")
      clip: { src: `${P}/ruthin-pub-sign.mp4`, from: 0.3 },
    },
    {
      at: b(51),
      reply: "Even a spa day",
      tag: "Hatherley Manor Hotel & Spa",
      still: {
        src: `${P}/hatherley-spa-relax.jpg`,
        size: [1920, 1281],
        cx: 1080,
      },
    },
    {
      at: b(55),
      reply: "Honestly, all of it",
      burst: {
        every: 9,
        // Scott's stills, the man in each (hotels not named; the burst carries no tags)
        stills: [
          { src: `${P}/steak-dinner.jpg`, size: [1536, 1023], cx: 1180 },
          { src: `${P}/massage.jpg`, size: [1536, 1024], cx: 760 },
          {
            src: "hotels/hythe-imperial/champagne-bar.webp",
            size: [1920, 1281],
            cx: 1100,
          },
          { src: `${P}/spa-loungers.jpg`, size: [1920, 1280], cx: 800 },
          { src: `${P}/hatherley-spa-jets.jpg`, size: [1920, 1285], cx: 820 },
          { src: `${P}/suite-coffee.jpg`, size: [1024, 683], cx: 200 },
        ],
      },
    },
    {
      at: b(59),
      reply: "And a lie in",
      tag: "Hythe Imperial",
      still: {
        src: "hotels/hythe-imperial/room.jpg",
        size: [1920, 1281],
        cx: 640,
      },
    },
  ],
  endAt: b(87), // "Thanks Dad" holds seven beats
  // Scott: "some other CTA than gift vouchers"; "Give them a break" was "too KitKat",
  // "Birthdays, sorted" too AI. Plain words instead, picking up "A night away somewhere?"
  endCard: {
    lines: ["Treat them to", "a night away"],
    location: "classicbritishhotels.com",
    mark: "corner", // Scott: the small CB in the corner, the card itself clean
  },
  sfx: { gain: 0.35 },
};

// Without the UI sounds (the house rule; Bianca rejected sound effects).
export const dadBirthdayChatQuiet: ChatSpec = {
  ...dadBirthdayChat,
  id: "dad-birthday-chat-no-sfx",
  sfx: undefined,
};
