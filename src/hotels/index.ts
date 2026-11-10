import {
  validateFlipbook,
  type FlipbookSpec,
} from "../hotel-film/flipbook/types";
import { validateFootage, type FootageSpec } from "../hotel-film/footage/types";
import { validateFestive, type FestiveSpec } from "../hotel-film/festive/types";
import { festiveLightsOn, festiveLightsOnStory } from "./festive-lights-on";
import { validateMixed, type MixedSpec } from "../hotel-film/mixed/types";
import { validateRipple, type RippleSpec } from "../hotel-film/ripple/types";
import {
  watertonParkIsland,
  watertonParkIslandStory,
} from "./waterton-park-island";
import { ruthinCastleDepth } from "./ruthin-castle-depth";
import { haycockManorCollage } from "./haycock-manor-collage";
import {
  haycockManorDepth,
  haycockManorDepthStory,
} from "./haycock-manor-depth";
import { rutlandFourRoots, rutlandFourRootsStory } from "./rutland-four-roots";
import { gomersalParkSpotlight } from "./gomersal-park-spotlight";
import { kingfisherSpotlight } from "./kingfisher-spotlight";
import { imperialSpotlight } from "./imperial-spotlight";
import { frenshamSpotlight } from "./frensham-spotlight";
import { bfRegionNorth } from "./bf-region-north";
import { bfRegionScotlandWales } from "./bf-region-scotland-wales";
import { bfRegionEastMidlands } from "./bf-region-east-midlands";
import { bfRegionSouth } from "./bf-region-south";

import { novemberOutThere, novemberOutThereStory } from "./november-out-there";
import {
  validateDepartures,
  type DeparturesSpec,
} from "../hotel-film/departures/types";
import { departuresKeswick } from "./departures-keswick";
import { validateCollage, type CollageSpec } from "../hotel-film/collage/types";
import {
  theMountCollage,
  theMountCollageShuffle,
  theMountCollageSwing,
} from "./the-mount-collage";
import {
  validateMatchCut,
  type MatchCutSpec,
} from "../hotel-film/matchcut/types";
import { validateSearch, type SearchSpec } from "../hotel-film/search/types";
import { validateCraft, type CraftSpec } from "../hotel-film/craft/types";
import { validateRewind, type RewindSpec } from "../hotel-film/rewind/types";
import { validateJourney, type JourneySpec } from "../hotel-film/journey/types";
import { validateSketch, type SketchSpec } from "../hotel-film/sketch/types";
import { validateUnwrap, type UnwrapSpec } from "../hotel-film/unwrap/types";
import { validateRolodex, type RolodexSpec } from "../hotel-film/rolodex/types";
import {
  validateEditorial,
  type EditorialSpec,
} from "../hotel-film/editorial/types";
import { validateMotion, type MotionSpec } from "../hotel-film/motion/types";
import { validateMontage, type MontageSpec } from "../hotel-film/montage/types";
import { validatePulse, type PulseSpec } from "../hotel-film/pulse/types";
import { validateFilm, type FilmSpec } from "../hotel-film/types";
import {
  hytheImperialFilm,
  hytheImperialGoldLine,
  hytheImperialScroll,
  hytheImperialStory,
} from "./hythe-imperial";
import { blackFridayGiftVouchers } from "./black-friday-gift-vouchers";
import { cbhCraft } from "./cbh-craft";
import { clocksGoBack, clocksGoBackStory } from "./clocks-go-back";
import { cbhJourney, cbhJourneyShort, cbhJourneyStory } from "./cbh-journey";
import { cbhRolodex } from "./cbh-rolodex";
import { holdsworthSketch, holdsworthSketchStory } from "./holdsworth-sketch";
import { ruthinSketchStory } from "./ruthin-sketch";
import { cbhShowcase } from "./cbh-showcase";
import { cosyEscapesFlipbook } from "./cosy-escapes-flipbook";
import { dalmahoyFilm } from "./dalmahoy";
import { fairlawnsStayDine } from "./fairlawns-stay-dine";
import { foodieMatchCut } from "./foodie-match-cut";
import {
  hardwickHallSearch,
  hardwickHallSearchStory,
} from "./hardwick-hall-search";
import {
  hintleshamHallSearch,
  hintleshamHallSearchStory,
} from "./hintlesham-hall-search";
import { oakleyHallStory } from "./oakley-hall";
import {
  octoberBestLoved,
  octoberBestLovedSilent,
  octoberBestLovedStory,
} from "./october-best-loved";
import { octoberBestLoved2 } from "./october-best-loved-2";
import {
  novemberBestLoved,
  novemberBestLovedSilent,
  novemberBestLovedStory,
  novemberBestLovedStorySilent,
} from "./november-best-loved";
import { aaRosettes, aaRosettesStory } from "./aa-rosettes";
import { plateToPillow, plateToPillowB } from "./plate-to-pillow";
import { theKingfisherFilm, theKingfisherStory } from "./the-kingfisher";
import { whittleburyParkPulse, whittleburyParkStory } from "./whittlebury-park";
import {
  whittleburyParkStayDine,
  whittleburyParkStayDineStory,
} from "./whittlebury-park-stay-dine";

// Every film registered here becomes a Remotion composition with the same id.
export const FILMS: FilmSpec[] = [
  hytheImperialFilm,
  hytheImperialStory,
  whittleburyParkStayDine,
  whittleburyParkStayDineStory,
  theKingfisherFilm,
  theKingfisherStory,
];
export const EDITORIAL_FILMS: EditorialSpec[] = [hytheImperialScroll];
export const MOTION_FILMS: MotionSpec[] = [hytheImperialGoldLine];

FILMS.forEach(validateFilm);
EDITORIAL_FILMS.forEach(validateEditorial);
MOTION_FILMS.forEach(validateMotion);

export const PULSE_FILMS: PulseSpec[] = [
  whittleburyParkPulse,
  whittleburyParkStory,
];
PULSE_FILMS.forEach(validatePulse);

// Campaign montages: rhythm edits across several hotels.
export const MONTAGE_FILMS: MontageSpec[] = [
  plateToPillow,
  plateToPillowB,
  aaRosettes,
  aaRosettesStory,
];
MONTAGE_FILMS.forEach(validateMontage);

// Real-footage reels: the hotel's own clips lead, stills close.
export const FOOTAGE_FILMS: FootageSpec[] = [
  dalmahoyFilm,
  oakleyHallStory,
  fairlawnsStayDine,
  octoberBestLoved,
  octoberBestLovedSilent,
  octoberBestLovedStory,
  octoberBestLoved2,
  novemberBestLoved,
  novemberBestLovedSilent,
  novemberBestLovedStory,
  novemberBestLovedStorySilent,
];
FOOTAGE_FILMS.forEach(validateFootage);

// Festive reels: the lights switch on, stills open out of gold bokeh.
export const FESTIVE_FILMS: FestiveSpec[] = [
  festiveLightsOn,
  festiveLightsOnStory,
];
FESTIVE_FILMS.forEach(validateFestive);
export const MIXED_FILMS: MixedSpec[] = [
  novemberOutThere,
  novemberOutThereStory,
];
MIXED_FILMS.forEach(validateMixed);
export const RIPPLE_FILMS: RippleSpec[] = [
  watertonParkIsland,
  watertonParkIslandStory,
  ruthinCastleDepth,
  haycockManorDepth,
  haycockManorDepthStory,
  rutlandFourRoots,
  rutlandFourRootsStory,
  gomersalParkSpotlight,
  kingfisherSpotlight,
  imperialSpotlight,
  frenshamSpotlight,
  bfRegionNorth,
  bfRegionScotlandWales,
  bfRegionEastMidlands,
  bfRegionSouth,
];
RIPPLE_FILMS.forEach(validateRipple);
export const DEPARTURES_FILMS: DeparturesSpec[] = [departuresKeswick];
DEPARTURES_FILMS.forEach(validateDepartures);
export const COLLAGE_FILMS: CollageSpec[] = [
  theMountCollage,
  theMountCollageSwing,
  theMountCollageShuffle,
  haycockManorCollage,
];
COLLAGE_FILMS.forEach(validateCollage);

// Flipbook reels: a journal whose pages turn one by one.
export const FLIPBOOK_FILMS: FlipbookSpec[] = [cosyEscapesFlipbook];
FLIPBOOK_FILMS.forEach(validateFlipbook);

// Unwrap reels: a gold ribbon draws and the frame peels back like gift wrap.
export const UNWRAP_FILMS: UnwrapSpec[] = [
  blackFridayGiftVouchers,
  cbhShowcase,
];
UNWRAP_FILMS.forEach(validateUnwrap);

// Search reels: a query types into a search bar and the answer plays out as one hotel.
export const SEARCH_FILMS: SearchSpec[] = [
  hardwickHallSearch,
  hardwickHallSearchStory,
  hintleshamHallSearch,
  hintleshamHallSearchStory,
];
SEARCH_FILMS.forEach(validateSearch);
// Journey reels: a gold thread across a map of Britain, a hotel opening out of each pin.
export const JOURNEY_FILMS: JourneySpec[] = [
  cbhJourney,
  cbhJourneyShort,
  cbhJourneyStory,
];
JOURNEY_FILMS.forEach(validateJourney);

// Sketch reels: each shot draws itself in pencil, then the photo floods in like watercolour.
export const SKETCH_FILMS: SketchSpec[] = [
  holdsworthSketch,
  holdsworthSketchStory,
  ruthinSketchStory,
];
SKETCH_FILMS.forEach(validateSketch);

// Craft reels: plain cuts, every one a match of shape, position, colour or movement.
export const CRAFT_FILMS: CraftSpec[] = [cbhCraft];
CRAFT_FILMS.forEach(validateCraft);

// Rewind reels: the opening runs backwards, then snaps forward (the clocks going back).
export const REWIND_FILMS: RewindSpec[] = [clocksGoBack, clocksGoBackStory];
REWIND_FILMS.forEach(validateRewind);

// Rolodex reels: the collection as a card file, riffled at shutter speed, landing on hotels.
export const ROLODEX_FILMS: RolodexSpec[] = [cbhRolodex];
ROLODEX_FILMS.forEach(validateRolodex);

// Match-cut reels: every cut a match cut on the plate rim.
export const MATCHCUT_FILMS: MatchCutSpec[] = [foodieMatchCut];
MATCHCUT_FILMS.forEach(validateMatchCut);
