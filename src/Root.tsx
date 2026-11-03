import { Fragment } from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { EditorialFilm } from "./hotel-film/editorial/EditorialFilm";
import { Film } from "./hotel-film/Film";
import { FlipbookFilm } from "./hotel-film/flipbook/FlipbookFilm";
import { FootageFilm } from "./hotel-film/footage/FootageFilm";
import { FestiveFilm } from "./hotel-film/festive/FestiveFilm";
import { MixedFilm } from "./hotel-film/mixed/MixedFilm";
import { RippleFilm } from "./hotel-film/ripple/RippleFilm";
import { WhereNext, WHERE_NEXT_FRAMES } from "./hotel-film/stings/WhereNext";
import { QueueReel, QUEUE_FRAMES, QUEUE_STORY_FRAMES } from "./hotel-film/blackfriday/QueueReel";
import { MEReel } from "./hotel-film/me/MEReel";
import { nailcoteHallMeetings, nailcoteHallMeetingsReel } from "./hotels/nailcote-hall-meetings";
import { haycockManorMeetingsME } from "./hotels/haycock-manor-me";
import { BF_STORIES } from "./hotels/black-friday-stories";
import { nailcoteHallSocial, nailcoteHallSocialStory } from "./hotels/nailcote-hall-social";
import { WrittenCB, WRITTEN_CB_FRAMES } from "./hotel-film/stings/WrittenCB";
import { WaxSeal, WAX_SEAL_FRAMES } from "./hotel-film/stings/WaxSeal";
import { DepthDemo, DEPTH_DEMO_FRAMES } from "./hotel-film/stings/DepthDemo";
import {
  DepthBreakdown,
  DEPTH_BREAKDOWN_FRAMES,
} from "./hotel-film/stings/DepthBreakdown";
import {
  CircleC,
  CIRCLE_C_VARIANTS,
  circleCFrames,
} from "./hotel-film/stings/CircleC";
import { SashWindow, SASH_FRAMES } from "./hotel-film/stings/SashWindow";
import {
  SCREEN_SPACE_STORY_FRAMES,
  ScreenSpace,
  ScreenSpaceStory,
  SCREEN_SPACE_FRAMES,
} from "./hotel-film/stings/ScreenSpace";
import { DeparturesFilm } from "./hotel-film/departures/DeparturesFilm";
import {
  WeekendCalendar,
  WEEKEND_FRAMES,
} from "./hotel-film/calendar/WeekendCalendar";
import { CollageFilm } from "./hotel-film/collage/CollageFilm";
import {
  HardbackFlip,
  HARDBACK_FRAMES,
} from "./hotel-film/flipbook/HardbackFlip";
import { WindowCB, WINDOW_CB_FRAMES } from "./hotel-film/stings/WindowCB";
import { SteamCB, STEAM_CB_FRAMES } from "./hotel-film/stings/SteamCB";
import { BaublesCB, BAUBLES_CB_FRAMES } from "./hotel-film/stings/BaublesCB";
import {
  MAGNET_FPS,
  MAGNET_FRAMES,
  MagnetFilm,
} from "./hotel-film/magnet/MagnetFilm";
import {
  ChristmasCB,
  CHRISTMAS_CB_FRAMES,
} from "./hotel-film/stings/ChristmasCB";
import { CLAY_FRAMES, ClaySuitcase } from "./hotel-film/clay/ClaySuitcase";
import {
  AUTUMN_STORY_FRAMES,
  AUTUMN_STORY_PLAIN_FRAMES,
  AutumnLeavesStory,
  AutumnLeavesStoryPlain,
} from "./hotel-film/leaves/AutumnLeavesReel";
import { LEAVES_FRAMES, LeafPile } from "./hotel-film/leaves/LeafPile";
import {
  BestLovedCarousel,
  CAROUSEL_SLIDES,
} from "./hotel-film/carousel/BestLovedCarousel";
import {
  PHANTOM_FPS,
  PHANTOM_FRAMES,
  PhantomCB,
} from "./hotel-film/phantom/PhantomCB";
import {
  ADVENT_FPS,
  ADVENT_FRAMES,
  AdventTeaser,
} from "./hotel-film/advent/AdventTeaser";
import { PAD_FRAMES, PadFlip } from "./hotel-film/flipbook/PadFlip";
import {
  STICK_FRAMES,
  STICK_REEL_FRAMES,
  STICK_XMAS_FRAMES,
  StickFlip,
  StickReel,
  StickXmas,
} from "./hotel-film/doodle/StickFlip";
import { PostItList, POSTIT_FRAMES } from "./hotel-film/postit/PostItList";
import {
  ScreenTime,
  SCREEN_TIME_STORY_FRAMES,
  SCREEN_TIME_FRAMES,
} from "./hotel-film/screentime/ScreenTime";
import { ComicFlip, COMIC_FLIP_FRAMES } from "./hotel-film/comicflip/ComicFlip";
import {
  Mosaic,
  MOSAIC_FRAMES,
  MOSAIC_VARIANTS,
} from "./hotel-film/mosaic/Mosaic";
import { collageFrames } from "./hotel-film/collage/types";
import { departuresFrames } from "./hotel-film/departures/types";
import { mixedFrames } from "./hotel-film/mixed/types";
import { MatchCutFilm } from "./hotel-film/matchcut/MatchCutFilm";
import { MontageFilm } from "./hotel-film/montage/MontageFilm";
import { MotionFilm } from "./hotel-film/motion/MotionFilm";
import { PulseFilm } from "./hotel-film/pulse/PulseFilm";
import { SearchFilm } from "./hotel-film/search/SearchFilm";
import { FPS, HEIGHT, WIDTH } from "./hotel-film/types";
import { CraftFilm } from "./hotel-film/craft/CraftFilm";
import { RewindFilm } from "./hotel-film/rewind/RewindFilm";
import { RolodexFilm } from "./hotel-film/rolodex/RolodexFilm";
import { JourneyFilm } from "./hotel-film/journey/JourneyFilm";
import { SketchFilm } from "./hotel-film/sketch/SketchFilm";
import { UnwrapFilm } from "./hotel-film/unwrap/UnwrapFilm";
import { GN_FPS, GN_HEIGHT, GN_STATS, GN_WIDTH } from "./linkedin/GNStats";
import { GNSearchDemo, GN_SEARCH_FRAMES } from "./linkedin/GNSearchDemo";
import {
  AmcReel,
  AmcStory,
  AmcWide,
  AmcWideGlorious,
  AmcWideOpen,
  amcWideOpenFrames,
  AMC_WIDE_H,
  AMC_WIDE_W,
  amcWideFrames,
  amcWideGloriousFrames,
  AMC_REEL_H,
  AMC_REEL_W,
  AMC_STORY_H,
  AMC_STORY_W,
  amcReelFrames,
  amcStoryFrames,
  type AmcTrackId,
} from "./hotel-film/amc/AmcReel";
import {
  AMC_FEEDBACK_FPS,
  AMC_FEEDBACK_FRAMES,
  AMC_FEEDBACK_H,
  AMC_FEEDBACK_W,
  AMC_FEEDBACK_WIDE_H,
  AMC_FEEDBACK_WIDE_W,
  AmcFeedback,
  AmcFeedbackWide,
} from "./hotel-film/amc/AmcFeedback";
import {
  AmcWall,
  AMC_WALL_FRAMES,
  AMC_WALL_H,
  AMC_WALL_LAND_H,
  AMC_WALL_LAND_W,
  AMC_WALL_W,
} from "./linkedin/AmcWall";
import {
  GNConversionDemo,
  GN_CONVERSION_FRAMES,
} from "./linkedin/GNConversionDemo";
import { GN_FULL_HOUSE_FRAMES, GNFullHouse } from "./linkedin/GNFullHouse";
import { GN_KEY_FOB_FRAMES, GNKeyFob } from "./linkedin/GNKeyFob";
import { GN_MAP_FRAMES, GNMap } from "./linkedin/GNMap";
import {
  CRAFT_FILMS,
  REWIND_FILMS,
  ROLODEX_FILMS,
  EDITORIAL_FILMS,
  FILMS,
  FLIPBOOK_FILMS,
  FOOTAGE_FILMS,
  FESTIVE_FILMS,
  MIXED_FILMS,
  RIPPLE_FILMS,
  DEPARTURES_FILMS,
  COLLAGE_FILMS,
  MATCHCUT_FILMS,
  JOURNEY_FILMS,
  MONTAGE_FILMS,
  MOTION_FILMS,
  PULSE_FILMS,
  SEARCH_FILMS,
  SKETCH_FILMS,
  UNWRAP_FILMS,
} from "./hotels";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={Film}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {EDITORIAL_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={EditorialFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {MOTION_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={MotionFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {PULSE_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={PulseFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {MONTAGE_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={MontageFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {FLIPBOOK_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={FlipbookFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {FOOTAGE_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={FootageFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {FESTIVE_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={FestiveFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      <Composition
        id="cbh-comic-flip"
        component={ComicFlip}
        durationInFrames={COMIC_FLIP_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* the collection as screens hanging in a dark space, flown through */}
      <Composition
        id="cbh-screens"
        component={ScreenSpace}
        durationInFrames={SCREEN_SPACE_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* a weekend calendar filling itself, each plan opening into Holdsworth House */}
      {/* a to-do list of sticky notes, each ticked off into a hotel's footage */}
      <Composition
        id="cbh-postit-weekend"
        component={PostItList}
        durationInFrames={POSTIT_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* a hardback whose pages turn to full-bleed hotel footage */}
      <Composition
        id="autumn-leaves-story"
        component={AutumnLeavesStory}
        durationInFrames={AUTUMN_STORY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="autumn-leaves-story-bare"
        component={AutumnLeavesStory}
        defaultProps={{ bare: true }}
        durationInFrames={AUTUMN_STORY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="autumn-leaves-story-line"
        component={AutumnLeavesStory}
        defaultProps={{ line: ["Autumn suits us"] }}
        durationInFrames={AUTUMN_STORY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="autumn-leaves-story-plain"
        component={AutumnLeavesStoryPlain}
        durationInFrames={AUTUMN_STORY_PLAIN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="autumn-leaves-cb"
        component={LeafPile}
        defaultProps={{ rustle: true }} // Scott: the brand moment keeps its rustle
        durationInFrames={LEAVES_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="stick-flip-mock"
        component={StickFlip}
        durationInFrames={STICK_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="stick-flip-gold"
        component={StickFlip}
        defaultProps={{ look: "gold" as const }}
        durationInFrames={STICK_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* the stick-figure reel: the opening, then the weekend at Rowton as gags opening into its footage */}
      <Composition
        id="stick-flip-rowton"
        component={StickReel}
        durationInFrames={STICK_REEL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* the Christmas office party, a draft on the same skeleton */}
      <Composition
        id="stick-flip-xmas"
        component={StickXmas}
        durationInFrames={STICK_XMAS_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="clay-suitcase-test"
        component={ClaySuitcase}
        durationInFrames={CLAY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="cbh-flipbook-winter-hardback"
        component={HardbackFlip}
        durationInFrames={HARDBACK_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* November Best Loved as a 4:5 carousel, a frame per slide (render each as a still) */}
      <Composition
        id="november-best-loved-carousel"
        component={BestLovedCarousel}
        durationInFrames={CAROUSEL_SLIDES}
        fps={FPS}
        width={1080}
        height={1350}
      />
      {/* The 12 days of Christmas giveaway teaser: an advent calendar's doors open onto the hotels. */}
      <Composition
        id="advent-teaser"
        component={AdventTeaser}
        durationInFrames={ADVENT_FRAMES}
        fps={ADVENT_FPS}
        width={1080}
        height={1920}
      />
      {/* a CB written in the condensation on a window, the fireside sharp through the letters */}
      <Composition
        id="cbh-window-cb"
        component={WindowCB}
        durationInFrames={WINDOW_CB_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* steam from a cup of tea gathering into the CB (the window CB's sister) */}
      <Composition
        id="cbh-steam-cb"
        component={SteamCB}
        durationInFrames={STEAM_CB_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Merry Christmas: fairy lights in depth, a string of them along the CB */}
      <Composition
        id="cbh-christmas-cb"
        component={ChristmasCB}
        durationInFrames={CHRISTMAS_CB_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Magnet CB: the gold lifting out of four hotels, pulled into the CB on the drop. */}
      <Composition
        id="magnet-cb"
        component={MagnetFilm}
        durationInFrames={MAGNET_FRAMES}
        fps={MAGNET_FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Merry Christmas: baubles and multicoloured lights in depth, the CB hanging in the middle */}
      <Composition
        id="cbh-baubles-cb"
        component={BaublesCB}
        durationInFrames={BAUBLES_CB_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* The Phantom CB (Halloween): a candle goes out, its smoke becomes the CB. */}
      <Composition
        id="phantom-cb"
        component={PhantomCB}
        durationInFrames={PHANTOM_FRAMES}
        fps={PHANTOM_FPS}
        width={1080}
        height={1920}
      />
      {/* the same slides at 9:16 for TikTok's photo carousel */}
      <Composition
        id="november-best-loved-carousel-tiktok"
        component={BestLovedCarousel}
        durationInFrames={CAROUSEL_SLIDES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* the winter flipbook as a pad: every page a hotel, lifting away over the top edge on the beat */}
      <Composition
        id="cbh-flipbook-winter"
        component={PadFlip}
        durationInFrames={PAD_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* meetings and events reels on the Ramside template: 16:9 first, and 9:16 */}
      <Composition
        id={nailcoteHallMeetings.id}
        component={MEReel}
        defaultProps={{ film: nailcoteHallMeetings }}
        durationInFrames={nailcoteHallMeetings.frames}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id={haycockManorMeetingsME.id}
        component={MEReel}
        defaultProps={{ film: haycockManorMeetingsME }}
        durationInFrames={haycockManorMeetingsME.frames}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id={nailcoteHallSocial.id}
        component={MEReel}
        defaultProps={{ film: nailcoteHallSocial }}
        durationInFrames={nailcoteHallSocial.frames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id={nailcoteHallSocialStory.id}
        component={MEReel}
        defaultProps={{ film: nailcoteHallSocialStory }}
        durationInFrames={nailcoteHallSocialStory.frames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Black Friday 2026: a Story for each participating hotel */}
      {BF_STORIES.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={MEReel}
          defaultProps={{ film }}
          durationInFrames={film.frames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      <Composition
        id={nailcoteHallMeetingsReel.id}
        component={MEReel}
        defaultProps={{ film: nailcoteHallMeetingsReel }}
        durationInFrames={nailcoteHallMeetingsReel.frames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Black Friday 2026: the sale's waiting room, the window bursting out on the drop */}
      <Composition id="black-friday-queue" component={QueueReel} durationInFrames={QUEUE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition
        id="black-friday-queue-story"
        component={QueueReel}
        defaultProps={{ story: true }}
        durationInFrames={QUEUE_STORY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* a screen-time report whose most-used apps open into four hotels */}
      <Composition
        id="cbh-screen-time"
        component={ScreenTime}
        durationInFrames={SCREEN_TIME_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {["yorkshire", "north-west-wales", "east-midlands"].map((region) => (
        <Composition
          key={region}
          id={`cbh-screen-time-${region}`}
          component={ScreenTime}
          defaultProps={{ region }}
          durationInFrames={SCREEN_TIME_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {["yorkshire", "north-west-wales", "east-midlands"].map((region) => (
        <Composition
          key={region}
          id={`cbh-screen-time-${region}-story`}
          component={ScreenTime}
          defaultProps={{ region, story: true }}
          durationInFrames={SCREEN_TIME_STORY_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      <Composition
        id="holdsworth-weekend"
        component={WeekendCalendar}
        durationInFrames={WEEKEND_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="cbh-screens-story"
        component={ScreenSpaceStory}
        durationInFrames={SCREEN_SPACE_STORY_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="cbh-sash-window"
        component={SashWindow}
        durationInFrames={SASH_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {CIRCLE_C_VARIANTS.map((variant) => (
        <Composition
          key={variant.id}
          id={variant.id}
          component={CircleC}
          defaultProps={{ variant }}
          durationInFrames={circleCFrames()}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      <Composition
        id="depth-breakdown"
        component={DepthBreakdown}
        defaultProps={{ aspect: "916" as const }}
        durationInFrames={DEPTH_BREAKDOWN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="depth-breakdown-linkedin"
        component={DepthBreakdown}
        defaultProps={{ aspect: "45" as const }}
        durationInFrames={DEPTH_BREAKDOWN_FRAMES}
        fps={FPS}
        width={1080}
        height={1350}
      />
      <Composition
        id="depth-demo"
        component={DepthDemo}
        defaultProps={{ aspect: "916" as const }}
        durationInFrames={DEPTH_DEMO_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="depth-demo-linkedin"
        component={DepthDemo}
        defaultProps={{ aspect: "45" as const }}
        durationInFrames={DEPTH_DEMO_FRAMES}
        fps={FPS}
        width={1080}
        height={1350}
      />
      <Composition
        id="cbh-wax-seal"
        component={WaxSeal}
        durationInFrames={WAX_SEAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="cbh-written"
        component={WrittenCB}
        durationInFrames={WRITTEN_CB_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="cbh-where-next"
        component={WhereNext}
        durationInFrames={WHERE_NEXT_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {MOSAIC_VARIANTS.map((variant) => (
        <Composition
          key={variant.id}
          id={variant.id}
          component={Mosaic}
          defaultProps={{ variant }}
          durationInFrames={variant.frames ?? MOSAIC_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {COLLAGE_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={CollageFilm}
          defaultProps={{ film }}
          durationInFrames={collageFrames(film)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {DEPARTURES_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={DeparturesFilm}
          defaultProps={{ film }}
          durationInFrames={departuresFrames(film)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {RIPPLE_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={RippleFilm}
          defaultProps={{ film }}
          durationInFrames={film.frames}
          fps={FPS}
          width={film.wide ? 1920 : WIDTH}
          height={film.wide ? 1080 : HEIGHT}
        />
      ))}
      {MIXED_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={MixedFilm}
          defaultProps={{ film }}
          durationInFrames={mixedFrames(film)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {ROLODEX_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={RolodexFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {REWIND_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={RewindFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {CRAFT_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={CraftFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {SKETCH_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={SketchFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {JOURNEY_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={JourneyFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {MATCHCUT_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={MatchCutFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {UNWRAP_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={UnwrapFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {SEARCH_FILMS.map((film) => (
        <Composition
          key={film.id}
          id={film.id}
          component={SearchFilm}
          defaultProps={{ film }}
          durationInFrames={film.durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      {/* Great National Group: the +30% shown as two booking pages, more guests booking on ours */}
      <Composition
        id="gn-conversion-demo"
        component={GNConversionDemo}
        durationInFrames={GN_CONVERSION_FRAMES}
        fps={GN_FPS}
        width={GN_WIDTH}
        height={GN_HEIGHT}
      />
      {/* Great National Group: be the hotel AI recommends (an AI assistant's shortlist) */}
      <Composition
        id="gn-ai-recommends"
        component={GNSearchDemo}
        durationInFrames={GN_SEARCH_FRAMES}
        fps={GN_FPS}
        width={GN_WIDTH}
        height={GN_HEIGHT}
      />
      {/* AMC 2026: the post-AMC reel, the wall come to life; one edit on each candidate track
          (`amc-2026-reel` is Light it Up Boy) */}
      {(["light", "dirty", "soul", "attraction"] as AmcTrackId[]).map(
        (track) => (
          <Fragment key={track}>
            <Composition
              id={
                track === "light" ? "amc-2026-reel" : `amc-2026-reel-${track}`
              }
              component={AmcReel}
              defaultProps={{ track }}
              durationInFrames={amcReelFrames(track)}
              fps={30}
              width={AMC_REEL_W}
              height={AMC_REEL_H}
            />
            <Composition
              id={
                track === "light" ? "amc-2026-story" : `amc-2026-story-${track}`
              }
              component={AmcStory}
              defaultProps={{ track }}
              durationInFrames={amcStoryFrames(track)}
              fps={30}
              width={AMC_STORY_W}
              height={AMC_STORY_H}
            />
          </Fragment>
        ),
      )}
      {/* AMC 2026, the 16:9 highlight film (Bianca, 22 Oct); its track is still to be chosen, so it
          runs on Light it Up Boy for now (Attraction has a silent break bar where this cut opens) */}
      {/* the final edit on Glorious (Bianca, 27 Oct: "the edit is spot on, just needs to be to this track"), take
          b: the reveal on the second chorus (Scott: "b fits better than a") */}
      <Composition
        id="amc-2026-wide"
        component={AmcWideGlorious}
        defaultProps={{ take: "b" as const }}
        durationInFrames={amcWideGloriousFrames("b")}
        fps={30}
        width={AMC_WIDE_W}
        height={AMC_WIDE_H}
      />
      {/* the other two takes on where the edit sits in Glorious (Scott: "show me options") */}
      {(["a", "b", "c"] as const).map((take) => (
        <Composition
          key={take}
          id={`amc-2026-wide-glorious-${take}`}
          component={AmcWideGlorious}
          defaultProps={{ take }}
          durationInFrames={amcWideGloriousFrames(take)}
          fps={30}
          width={AMC_WIDE_W}
          height={AMC_WIDE_H}
        />
      ))}
      {/* the same edit on Light it Up Boy, as sent 26 Oct */}
      <Composition
        id="amc-2026-wide-light"
        component={AmcWide}
        defaultProps={{ track: "light" as AmcTrackId }}
        durationInFrames={amcWideFrames("light")}
        fps={30}
        width={AMC_WIDE_W}
        height={AMC_WIDE_H}
      />
      {/* the same with the count opening it and the gala team last (Scott: "try ... see how it looks") */}
      <Composition
        id="amc-2026-wide-open25"
        component={AmcWideOpen}
        defaultProps={{ track: "light" as AmcTrackId }}
        durationInFrames={amcWideOpenFrames("light")}
        fps={30}
        width={AMC_WIDE_W}
        height={AMC_WIDE_H}
      />
      {/* AMC 2026 feedback reel ("The reviews are in"; source and history on claude/loving-brown-0k56ps,
          copied here 23 Oct for David Allen's shot and the 16:9 cut) */}
      <Composition
        id="amc-feedback"
        component={AmcFeedback}
        durationInFrames={AMC_FEEDBACK_FRAMES}
        fps={AMC_FEEDBACK_FPS}
        width={AMC_FEEDBACK_W}
        height={AMC_FEEDBACK_H}
      />
      <Composition
        id="amc-feedback-wide"
        component={AmcFeedbackWide}
        durationInFrames={AMC_FEEDBACK_FRAMES}
        fps={AMC_FEEDBACK_FPS}
        width={AMC_FEEDBACK_WIDE_W}
        height={AMC_FEEDBACK_WIDE_H}
      />
      {/* AMC 2026: a living photo wall, three tiles cycling round a 25th Anniversary tile */}
      <Composition
        id="amc-wall"
        component={AmcWall}
        durationInFrames={AMC_WALL_FRAMES}
        fps={30}
        width={AMC_WALL_W}
        height={AMC_WALL_H}
      />
      <Composition
        id="amc-wall-gif"
        component={AmcWall}
        durationInFrames={AMC_WALL_FRAMES}
        fps={30}
        width={AMC_WALL_W}
        height={AMC_WALL_H}
        defaultProps={{ drift: false }}
      />
      <Composition
        id="amc-wall-landscape"
        component={AmcWall}
        durationInFrames={AMC_WALL_FRAMES}
        fps={30}
        width={AMC_WALL_LAND_W}
        height={AMC_WALL_LAND_H}
        defaultProps={{ land: true }}
      />
      {/* Great National Group brand moment: a room key whose fob turns through every hotel */}
      <Composition
        id="gn-key-fob"
        component={GNKeyFob}
        durationInFrames={GN_KEY_FOB_FRAMES}
        fps={GN_FPS}
        width={GN_WIDTH}
        height={GN_HEIGHT}
      />
      <Composition
        id="gn-key-fob-silent"
        component={GNKeyFob}
        defaultProps={{ sound: false }}
        durationInFrames={GN_KEY_FOB_FRAMES}
        fps={GN_FPS}
        width={GN_WIDTH}
        height={GN_HEIGHT}
      />
      {/* Great National Group brand moment: their hotels on the map, gathering into the badge */}
      <Composition
        id="gn-map"
        component={GNMap}
        durationInFrames={GN_MAP_FRAMES}
        fps={GN_FPS}
        width={GN_WIDTH}
        height={GN_HEIGHT}
      />
      {/* Great National Group brand moment: the badge filling like a full house */}
      <Composition
        id="gn-full-house"
        component={GNFullHouse}
        durationInFrames={GN_FULL_HOUSE_FRAMES}
        fps={GN_FPS}
        width={GN_WIDTH}
        height={GN_HEIGHT}
      />
      {GN_STATS.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={s.component}
          durationInFrames={s.durationInFrames}
          fps={GN_FPS}
          width={GN_WIDTH}
          height={GN_HEIGHT}
        />
      ))}
    </>
  );
};
