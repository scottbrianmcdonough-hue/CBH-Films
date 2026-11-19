import type { CollageSpec, CollageState, TilePlace } from "../hotel-film/collage/types";
import { haycockManorCollage } from "./haycock-manor-collage";

// Coombe Abbey as a moving tile wall (Scott, 19 Nov: "do another one like the mount tiles"): the new member,
// on the Haycock wall's choreography and its big band edit (every move already sits on one of that track's
// hits), with Coombe Abbey's photos in its places. The abbey from the air opens it and is the tile that flies
// up at the end. The marquee photo is left out.

const C = "hotels/coombe-abbey";
// Haycock's place in the choreography -> Coombe Abbey's photo
const AS: Record<string, string> = {
  cocktail: "aerial", tea: "tea", prevost: "plate", bath: "bath", fitz: "bed", fish: "show", lounge: "garden",
  attic: "poster", silver: "bust", sofa: "craven", bedroom: "cast", suite: "front",
};
const rename = (s: CollageState): CollageState => ({
  ...s,
  scene: AS[s.scene],
  tiles: Object.fromEntries(Object.entries(s.tiles).map(([k, v]) => [AS[k], v] as [string, TilePlace])),
  shovedOff: s.shovedOff?.map((k) => AS[k]),
});

export const coombeAbbeyCollage: CollageSpec = {
  ...haycockManorCollage,
  id: "coombe-abbey-collage",
  photos: {
    aerial: { src: `${C}/aerial.jpg`, focus: [0.42, 0.45] },
    tea: { src: `${C}/afternoon-tea.jpg`, focus: [0.42, 0.4] },
    plate: { src: `${C}/plate.jpg`, focus: [0.5, 0.5] },
    bath: { src: `${C}/roll-top-bath.jpg`, focus: [0.3, 0.6] },
    bed: { src: `${C}/canopied-bed.jpg`, focus: [0.5, 0.5] },
    show: { src: `${C}/banquet-show.jpg`, focus: [0.5, 0.45] },
    garden: { src: `${C}/garden-room.jpg`, focus: [0.5, 0.5] },
    poster: { src: `${C}/four-poster-room.jpg`, focus: [0.6, 0.55] },
    bust: { src: `${C}/history-bust.jpg`, focus: [0.25, 0.45] },
    craven: { src: `${C}/grand-feature-lady-craven.jpg`, focus: [0.6, 0.5] },
    cast: { src: `${C}/banquet-cast.jpg`, focus: [0.55, 0.45] },
    front: { src: `${C}/garden-front.jpg`, focus: [0.45, 0.45] },
  },
  states: haycockManorCollage.states.map(rename),
  label: { eyebrow: "Warwickshire", name: "Coombe Abbey\nHotel", until: 5.5 },
  end: { ...haycockManorCollage.end, line: "Banquet first,\nor the roll top bath?", zoom: { tile: "aerial", from: 29, land: 30 } },
};
