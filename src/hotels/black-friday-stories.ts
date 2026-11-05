import type { MEShot, MESpec } from "../hotel-film/me/MEReel";

// Black Friday 2026: one Instagram Story per participating hotel (Scott, 3 Nov: "reels and stuff for the
// participating hotels"; the 14 with an offer on the 2026 sheet, Black_Friday_Promo_List_.xlsx). Built on
// MEReel: the hotel's place and name over its first shot, then two more on the beat, then the offer card
// (BLACK FRIDAY SALE in the campaign's mauve, the offer in cream Cormorant, the terms beneath), the white
// CB throughout. Offers exactly as the sheet; hold posting until each hotel's rates sync to the site.
//
// Photos: the seven Scott sent from the CBH site (Skipton, Jockey Club Rooms, Burleigh Court, Oaklands
// Hall, The Alfriston, The Imperial, Gomersal Park, in public/hotels/<slug>/), the rest from earlier films
// (Ruthin's and Waterton's 9:16 depth clips, Holdsworth, Whittlebury, Dalmahoy, Oakley Hall, Forest of
// Arden). Summer pools and gardens left out.
//
// Music: "What the Funk" by Rockot (Pixabay 549053; in no other film), ~124.9 BPM (a beat 0.4805s), from
// beat 19 (9.497s, a phrase start): the label shot 8 beats, two shots 4 beats each, the offer card on the
// phrase start at beat 35 (17.16s), 8 beats of it, the music fading.
const B = (k: number) => Math.round((k - 19) * 0.4805 * 30);
const H = "hotels/";
const C = "campaigns/";

type Story = {
  slug: string;
  place: string;
  name: string; // \n where it wraps
  shots: MEShot[];
  cuts?: number[]; // beats, when not 27 and 31
  offer: { title: string; lines: string[] };
};
const FD = ["Plus 25% off food and drink", "Stays to 31 March"];
const FD20 = ["Plus 20% off food and drink", "Stays to 31 March"]; // Gomersal and Ruthin (the sheet, 5 Nov update)

const STORIES: Story[] = [
  {
    slug: "skipton",
    place: "Skipton, North Yorkshire",
    name: "Skipton Hotel",
    shots: [
      { src: H + "skipton/canal-boats.jpg", pos: "72% 50%" },
      { src: H + "skipton/afternoon-tea.jpg", pos: "35% 50%" },
      { src: H + "skipton/canal-reflection.jpg", pos: "28% 50%" },
    ],
    offer: { title: "25% off\nyour stay", lines: FD },
  },
  {
    slug: "waterton-park",
    place: "Wakefield, West Yorkshire",
    name: "Waterton Park\nHotel & Spa",
    shots: [
      { src: H + "waterton-park/clips/aerial-story.mp4" },
      { src: H + "waterton-park/clips/afternoon-tea.mp4", from: 1 },
      { src: H + "waterton-park/clips/bedroom.mp4", from: 1 },
    ],
    offer: { title: "15% off\nyour stay", lines: FD },
  },
  {
    slug: "gomersal-park",
    place: "Gomersal, West Yorkshire",
    name: "Gomersal Park\nHotel & Spa",
    shots: [
      { src: H + "gomersal-park/spa-pool.jpg", pos: "50% 50%" },
      { src: H + "gomersal-park/afternoon-tea.jpg", pos: "40% 50%" },
      { src: H + "gomersal-park/bedroom.jpg", pos: "45% 50%" },
    ],
    offer: { title: "20% off\nyour stay", lines: FD20 },
  },
  {
    slug: "ruthin-castle",
    place: "Ruthin, North Wales",
    name: "Ruthin Castle\nHotel & Spa",
    shots: [
      { src: H + "ruthin-castle/clips/castle.mp4" },
      { src: H + "ruthin-castle/clips/fireside-plate.mp4" },
      { src: H + "ruthin-castle/clips/white-bed.mp4" },
    ],
    offer: { title: "20% off\nyour stay", lines: FD20 },
  },
  {
    slug: "jockey-club-rooms",
    place: "Newmarket, Suffolk",
    name: "Jockey Club Rooms",
    shots: [
      { src: H + "jockey-club-rooms/hyperion-statue.jpg", pos: "62% 50%" },
      { src: H + "jockey-club-rooms/dining-room.jpg", pos: "50% 50%" },
      { src: H + "jockey-club-rooms/bedroom.jpg", pos: "35% 50%" },
    ],
    offer: { title: "15% off B&B", lines: ["Stays to 31 March, selected dates"] },
  },
  {
    slug: "whittlebury-park",
    place: "Whittlebury, Northamptonshire",
    name: "Whittlebury Park",
    shots: [
      { src: H + "whittlebury-park/exterior.jpg", pos: "50% 50%" },
      { src: H + "whittlebury-park/murrays-dish-2x.jpg", pos: "50% 50%" },
      { src: H + "whittlebury-park/suite.jpg", pos: "45% 50%" },
    ],
    offer: { title: "10% off\nyour stay", lines: ["B&B or dinner, B&B", "Stays to 31 March, selected dates"] },
  },
  {
    slug: "burleigh-court",
    place: "Minchinhampton, Gloucestershire",
    name: "Burleigh Court",
    shots: [
      { src: H + "burleigh-court/fireside-table.jpg", pos: "55% 50%" },
      { src: H + "burleigh-court/bedroom.jpg", pos: "50% 50%" },
      { src: H + "burleigh-court/plate.jpg", pos: "58% 50%" },
    ],
    offer: { title: "25% off B&B", lines: ["Stays to 31 March, selected dates"] },
  },
  {
    slug: "oaklands-hall",
    place: "Laceby, Lincolnshire",
    name: "Oaklands Hall Hotel",
    shots: [
      { src: H + "oaklands-hall/entrance.jpg", pos: "50% 50%" },
      { src: H + "oaklands-hall/sausages-fireside.jpg", pos: "40% 50%" },
      { src: H + "oaklands-hall/fireplace.jpg", pos: "50% 50%" },
    ],
    offer: { title: "18% off\nyour stay", lines: ["Room only, B&B or dinner, B&B", "Selected dates to 31 March"] },
  },
  {
    slug: "oakley-hall",
    place: "Oakley, Hampshire",
    name: "Oakley Hall Hotel",
    shots: [
      { src: C + "journey-new/oakley-hall-exterior-frost.jpg", pos: "50% 50%" },
      { src: H + "oakley-hall/dog-on-the-lawn.mp4", from: 1 },
      { src: C + "plate-to-pillow/oakley-pillow.jpg", pos: "50% 50%" },
    ],
    offer: { title: "30% off\nyour stay", lines: ["Room only or B&B", "Stays to April"] },
  },
  {
    slug: "dalmahoy",
    place: "Edinburgh",
    name: "Dalmahoy Hotel\n& Country Club",
    shots: [
      { src: H + "dalmahoy/course-view.mp4" },
      { src: H + "dalmahoy/syrup-pour.mp4", from: 4 },
      { src: C + "cosy-escapes/page4-dalmahoy-log-fire-bar.jpg", pos: "50% 50%" },
    ],
    offer: { title: "30% off B&B", lines: ["Stays to 30 April"] },
  },
  {
    slug: "forest-of-arden",
    place: "Meriden, Warwickshire",
    name: "Forest of Arden Hotel",
    shots: [
      { src: C + "amc-2026/forest-of-arden-aerial.mp4" },
      { src: C + "november-best-loved/forest-of-arden-exterior.jpg", pos: "50% 50%" },
    ],
    cuts: [25],
    offer: { title: "Advance purchase\nB&B rate", lines: ["Non refundable", "Stays to 9 April"] },
  },
  {
    slug: "holdsworth-house",
    place: "Halifax, West Yorkshire",
    name: "Holdsworth House Hotel",
    shots: [
      { src: H + "holdsworth-house/tea-by-the-fire.jpg", pos: "50% 50%" },
      { src: H + "holdsworth-house/breakfast-in-bed.jpg", pos: "50% 50%" },
      { src: H + "holdsworth-house/dinner.jpg", pos: "50% 50%" },
    ],
    offer: { title: "10% off B&B", lines: ["Stays to 31 March"] },
  },
  {
    slug: "the-alfriston",
    place: "Alfriston, East Sussex",
    name: "The Alfriston",
    shots: [
      { src: H + "the-alfriston/fireside-table.jpg", pos: "60% 50%" },
      { src: H + "the-alfriston/bedroom.jpg", pos: "32% 50%" },
      { src: H + "the-alfriston/afternoon-tea.jpg", pos: "50% 50%" },
    ],
    offer: { title: "30% off B&B", lines: ["Book 27 to 30 November only", "Stays to 31 March, selected dates"] },
  },
  {
    slug: "the-imperial",
    place: "Llandudno, North Wales",
    name: "The Imperial Hotel",
    shots: [
      { src: H + "the-imperial/bay-from-great-orme.jpg", pos: "60% 50%" },
      { src: H + "the-imperial/breakfast-in-bed.jpg", pos: "50% 50%" },
    ],
    cuts: [27],
    offer: { title: "Up to 30%\noff B&B", lines: ["Stays to 31 March"] },
  },
];

export const BF_STORIES: MESpec[] = STORIES.map((s) => {
  const cuts = s.cuts ?? [27, 31];
  return {
    id: `black-friday-story-${s.slug}`,
    frames: B(44),
    scenes: s.shots.map((shot, i) => ({
      at: i === 0 ? 0 : B(cuts[i - 1]),
      cut: i > 0,
      shots: [shot],
      text: i === 0 ? { eyebrow: s.place, title: s.name, subs: [""] } : undefined,
    })),
    end: { at: B(35), cut: true, name: s.name, place: s.place, offer: s.offer },
    music: { src: "music/rockot-what-the-funk-549053.mp3", startAt: 285, gain: 0.56, fadeOut: 40 },
  };
});
