import type { RolodexSpec } from "../hotel-film/rolodex/types";

// Classic British Hotels Rolodex reel (a test: Scott picked the Rolodex from "a rolodex or
// rapid shutter cut or collage montage"). The collection as a card file: every hotel on an
// index card, filed A to Z, riffled at shutter speed so the whole collection flicks past
// (never a count), landing on four whose footage opens out of the card. The last card in
// the file is ours: "Keep this one handy".
// Names and places as compiled for the journey reel (CBH site blocked; search results),
// Gonville (out) and Maids Head (leaving) left off. Check before this goes live.
//
// Music: Whittlebury's food/cooking track (Pixabay), ~103 BPM, a bar every ~69 frames;
// cards open on bar starts (70, 207, 344, 481), the last card lands on bar 619 and the
// logo comes up on 687.

const card = (name: string, place: string) => ({ name, place });

export const cbhRolodex: RolodexSpec = {
  id: "cbh-rolodex",
  music: {
    src: "hotels/whittlebury-park/food-cooking-music.mp3",
    trimmedSeconds: 50,
    startAt: 0,
    gain: 0.8,
    fadeFrom: 724,
  },
  durationInFrames: 790,
  cards: [
    card("The Alfriston", "East Sussex"),
    card("Almondsbury Inn", "Bristol"),
    card("Arnos Manor Hotel", "Bristol"),
    card("Atholl Palace", "Pitlochry, Perthshire"),
    card("Avisford Park Hotel", "Arundel, West Sussex"),
    card("Barnett Hill Hotel", "Guildford, Surrey"),
    card("The Beaches Hotel & Spa", "Prestatyn, North Wales"),
    card("Burleigh Court", "Gloucestershire"),
    card("Castle Inn", "Bassenthwaite, Lake District"),
    card("County Hotel", "Chelmsford, Essex"),
    card("Dalmahoy Hotel & Country Club", "Edinburgh"),
    card("Donnington Manor Hotel", "Sevenoaks, Kent"),
    card("Fairlawns Hotel & Spa", "Walsall, West Midlands"),
    card("Feathers Hotel", "Ludlow, Shropshire"),
    card("Forest of Arden Hotel & Country Club", "Warwickshire"),
    card("Frensham Pond Hotel & Spa", "Farnham, Surrey"),
    card("Gisborough Hall", "North Yorkshire"),
    card("Gomersal Park Hotel & Spa", "West Yorkshire"),
    card("Hardwick Hall Hotel", "Sedgefield, County Durham"),
    card("Hatherley Manor", "Gloucestershire"),
    card("Haycock Manor Hotel", "Peterborough"),
    card("Hintlesham Hall", "Ipswich, Suffolk"),
    card("Hogarths Solihull", "West Midlands"),
    card("Hogarths Stone Manor", "Worcestershire"),
    card("Holdsworth House Hotel", "Halifax, West Yorkshire"),
    card("Hythe Imperial", "Hythe, Kent"),
    card("Ilsington Country House Hotel", "Dartmoor, Devon"),
    card("Imperial Hotel Tenby", "Pembrokeshire"),
    card("The Imperial Hotel", "Llandudno, North Wales"),
    card("The Kingfisher", "Bedford"),
    card("Knowsley Inn", "Liverpool"),
    card("Lancaster House Hotel", "Lancaster"),
    card("Langshott Manor", "Surrey"),
    card("Langstone Cliff Hotel", "Dawlish, Devon"),
    card("Low Wood Bay Resort & Spa", "Windermere, Lake District"),
    card("Metropole Hotel", "Llandrindod Wells, Mid Wales"),
    card("Morritt Hotel", "Greta Bridge, County Durham"),
    card("The Mount Country Manor Hotel", "Wolverhampton"),
    card("Nailcote Hall", "Warwickshire"),
    card("Oaklands Hall Hotel", "Laceby, Lincolnshire"),
    card("Oakley Hall Hotel", "Hampshire"),
    card("Park House Hotel", "Shifnal, Shropshire"),
    card("Prince Rupert Hotel", "Shrewsbury"),
    card("Ramside Hall", "Durham"),
    card("Rowton Hall Hotel & Spa", "Chester, Cheshire"),
    card("Ruthin Castle Hotel & Spa", "Ruthin, North Wales"),
    card("Rutland Hall Hotel & Spa", "Rutland Water"),
    card("Skipton Hotel", "North Yorkshire"),
    card("Speech House Hotel", "Forest of Dean"),
    card("Stoke by Nayland Resort", "Suffolk"),
    card("Tiverton Hotel", "Tiverton, Devon"),
    card("Waterton Park Hotel", "Wakefield, West Yorkshire"),
    card("Whitley Hall Country House Hotel", "Sheffield"),
    card("Whittlebury Park", "Northamptonshire"),
    card("Wild Boar Estate", "Lake District National Park"),
    card("Wildes Inns", "Chesterfield, Derbyshire"),
    card("Wrightington Hotel & Spa", "Wigan, Lancashire"),
  ],
  landings: [
    {
      card: "Dalmahoy Hotel & Country Club",
      open: 70,
      close: 150,
      shot: { kind: "video", src: "hotels/dalmahoy/syrup-pour.mp4", from: 5.6 },
    },
    {
      card: "Holdsworth House Hotel",
      open: 207,
      close: 287,
      shot: {
        kind: "video",
        src: "hotels/holdsworth-house/parterre.mp4",
        from: 0.5,
      },
    },
    {
      card: "Oakley Hall Hotel",
      open: 344,
      close: 424,
      shot: {
        kind: "video",
        src: "hotels/oakley-hall/dog-on-the-lawn.mp4",
        from: 7.4,
      },
    },
    {
      card: "Ruthin Castle Hotel & Spa",
      open: 481,
      close: 561,
      shot: {
        kind: "photo",
        src: "hotels/ruthin-castle/castle.jpg",
        size: [1920, 1080],
        crop: { cx: 450 },
      },
    },
  ],
  last: { line: "Keep this one handy", land: 611 },
  endAt: 687,
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
