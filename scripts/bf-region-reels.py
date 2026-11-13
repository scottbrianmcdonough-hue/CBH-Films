# Builds the Black Friday region reels: clips (still-push), cut.json, picture (cut-picture), and the spec .ts files.
import json, os, subprocess, sys
from PIL import Image
os.chdir("/home/user/CBH-Films")
H = "public/hotels/"
# offers and order from the final list (Scott, 11 Nov): "Save X%", cheapest first; Oaklands moved to the North; the
# Kingfisher kept in East & Midlands from its booking page (Save 30%); "up to" on each end card is the region's best offer
R = {
 "north": dict(title="The North", music="hotels/dalmahoy/leva-eternity.mp3", start=55, bar=78.0, intro=2, gain=0.8, seconds=40, best="20%", pill="Book now", end_line="Lock in your dates\\nbefore they're gone", snap=True, moves=[0,1,1,0,-1], hotel_beats=4, tail_bars=1.25,
   intro_img=("skipton/canal-boats.jpg", 760),
   hotels=[("Laceby, Lincolnshire","Oaklands Hall Hotel","Save 18%",("oaklands-hall/exterior-front.jpg",None),("oaklands-hall/plate.jpg",960),("oaklands-hall/fireplace.jpg",None)),
           ("Skipton, North Yorkshire","Skipton Hotel","Save 20%",("skipton/canal-reflection.jpg",420),("skipton/afternoon-tea.jpg",1000),("skipton/pool.jpg",None)),
           ("Gomersal, West Yorkshire","Gomersal Park\\nHotel & Spa","Save 20%",("gomersal-park/spa-pool.jpg",960),("gomersal-park/afternoon-tea.jpg",760),None),
           ("Wakefield, West Yorkshire","Waterton Park\\nHotel & Spa","Save 20%",("waterton-park/aerial.jpg",None),("waterton-park/outdoor-hot-tub.jpg",1100),("waterton-park/afternoon-tea.jpg",None)),
           ("Halifax, West Yorkshire","Holdsworth House Hotel","Save 10%",("holdsworth-house/exterior.jpg",960),("holdsworth-house/breakfast-in-bed.jpg",960),("holdsworth-house/tea-by-the-fire.jpg",None))]),
 "scotland-wales": dict(title="Scotland & Wales", music="music/berrydeep-funky-summer-house-565437.mp3", start=353, bar=59.2, intro=2, gain=0.58, seconds=141, best="30%",
   intro_img=("the-imperial/bay-from-great-orme.jpg",750),
   hotels=[("Ruthin, North Wales","Ruthin Castle\\nHotel & Spa","Save 20%",("ruthin-castle/castle.jpg",500),("ruthin-castle/hot-tub-fizz.jpg",640)),
           ("Llandudno, North Wales","The Imperial Hotel","Save 20%",("the-imperial/seafront.jpg",900),("the-imperial/sea-view-room-wine.jpg",1200)),
           ("Edinburgh","Dalmahoy Hotel\\n& Country Club","Save 30%",("dalmahoy/exterior.jpg",700),("dalmahoy/pool.jpg",960))]),
 "east-midlands": dict(title="East & Midlands", music="music/arnaud136-deep-house-instrumental-354596.mp3", start=777, bar=57.8, intro=2, gain=0.71, seconds=231, best="30%", pill="Book now", end_line="Lock in your dates\\nbefore they're gone", snap=True, moves=[0,1,1,-1],
   intro_img=("the-kingfisher/aperitivo.jpg",None),
   hotels=[("Whittlebury, Northamptonshire","Whittlebury Park","Save 10%",("whittlebury-park/exterior.jpg",960),("whittlebury-park/spa-pool.jpg",960),("whittlebury-park/suite.jpg",None)),
           ("Meriden, Warwickshire","Forest of Arden Hotel","Save 30%",("forest-of-arden/aerial-autumn.jpg",1000),("forest-of-arden/chef-afternoon-tea.jpg",None),("forest-of-arden/pool.jpg",960)),
           ("Bedford, Bedfordshire","The Kingfisher","Save 30%",("the-kingfisher/exterior-river-boat.jpg",760),("the-kingfisher/reading-in-bed.jpg",1100),("the-kingfisher/fireside.jpg",None)),
           ("Newmarket, Suffolk","Jockey Club Rooms","Save 15%",("jockey-club-rooms/garden-front.jpg",600),("jockey-club-rooms/dining-room.jpg",960),("jockey-club-rooms/bedroom-blue.jpg",None))]),
 "south": dict(title="The South", music="music/kulakovka-luxury-life-618587.mp3", start=346, bar=59.1, intro=2, gain=0.78, seconds=145, best="30%", snap=True,
   intro_img=("frensham-pond/pond-reflections.jpg",1030),
   hotels=[("Arundel, West Sussex","Avisford Park Hotel","Save 25%",("avisford-park/exterior.jpg",1180),("avisford-park/restaurant.jpg",660),("avisford-park/golf.jpg",None)),
           ("Farnham, Surrey","Frensham Pond\\nHotel & Spa","Save 20%",("frensham-pond/exterior-dusk.jpg",950),("frensham-pond/restaurant.jpg",820),("frensham-pond/spa-pool.jpg",None)),
           ("Sevenoaks, Kent","Donnington Manor\\nHotel","Save 20%",("donnington-manor/exterior.jpg",500),("donnington-manor/breakfast-terrace.jpg",1000),("donnington-manor/twin-bedroom.jpg",None)),
           ("Oakley, Hampshire","Oakley Hall Hotel","Save 30%",("oakley-hall/exterior.jpg",960),("oakley-hall/afternoon-tea.jpg",800),("oakley-hall/bedroom.jpg",None)),
           ("Minchinhampton, Gloucestershire","Burleigh Court","Save 20%",("burleigh-court/garden-house.jpg",1080),("burleigh-court/bedroom.jpg",900),("burleigh-court/fireside-table.jpg",None))]),
}
only = sys.argv[1:] or list(R)
def clip(img, cx, frames, out, glide=None):
    # glide None: a plain slow push (the original reels). In the collage reels, the spotlights' move (Scott, 12 Nov:
    # "like the Gomersal and the Rutland one"): a steady push scaled to the shot's length, so every shot moves at one
    # pace, with glide +1/-1 a sideways glide right or left as far as the photo allows (up to a tenth of its width) or
    # with 0 a straight push in; mixed, not left right left right (Scott: "not opposite times each time")
    W,Hh = Image.open(H+img).size
    h = min(Hh, int(W*1350/1080))
    if cx is None: cx = W/2
    w = h*1080/1350
    cx = max(w/2, min(W-w/2, cx))
    drift, dx = 0.05, 0
    if glide is not None:
        drift = min(0.09, 0.0011*frames) if glide else min(0.12, 0.0015*frames)
        if glide:
            room = min(cx - w/2, W - cx - w/2)
            dx = glide * min(2*room, 0.10*W)
    subprocess.run(["python3","scripts/still-push.py",H+img,out,"--cx",str(int(cx)),"--cy",str(Hh//2),"--h",str(h),"--drift",str(drift),"--dx",str(int(dx)),"--frames",str(frames),"--hgt","1350"],check=True,capture_output=True)
for rid in only:
    r = R[rid]; bar=r["bar"]; D=f"public/campaigns/bf-region-{rid}"; os.makedirs(D+"/clips",exist_ok=True)
    snap=r.get("snap",False)
    # snap (Scott, 11 Nov: "a flat slideshow"): each hotel two bars as exterior half a bar, then two shots a beat... two beats each
    if snap:
        # the collage opening (Scott, 12 Nov: "like the carousels, a collage first, then the exteriors with the sale
        # percent"): the collage holds the intro (the picture under it is hidden), then each hotel's exterior alone, a
        # bar (the North, 92 BPM) or two (the faster tracks), gliding
        imgs=[("intro",r["intro_img"],r["intro"]*4)]
        for i,h in enumerate(r["hotels"]):
            imgs.append((f"h{i}a",h[3],r.get("hotel_beats",8)))
        unit=bar/4
    else:
        imgs=[("intro",r["intro_img"],r["intro"])]
        for i,h in enumerate(r["hotels"]):
            imgs.append((f"h{i}a",h[3],1)); imgs.append((f"h{i}b",h[4],1))
        unit=bar
    bars=[0]
    for _,_,n in imgs: bars.append(bars[-1]+n)
    fr=[round(b*unit) for b in bars]
    # each hotel's first shot index (shots per hotel vary in snap mode)
    starts=[k for k,(name,_,_) in enumerate(imgs) if name.endswith("a") and name.startswith("h")]+[len(imgs)]
    shots=[]
    for k,(name,(img,cx),n) in enumerate(imgs):
        frames=fr[k+1]-fr[k]; out=f"{D}/clips/{name}.mp4"; clip(img,cx,frames+14,out,(r["moves"][k-1] if "moves" in r and k else (1 if k%2 else -1)) if snap else None)
        shots.append({"src":out,"from":0,"frames":frames,"vf":"eq=saturation=1.0:contrast=1.03"})
    end=fr[-1]; total=end+round(r.get("tail_bars",2)*bar)
    json.dump({"out":f"{D}/picture.mp4","size":"1080x1350","shots":shots,"fade":22,"tail":total-end},open(D+"/cut.json","w"),indent=1)
    subprocess.run(["python3","scripts/cut-picture.py",D+"/cut.json"],check=True,capture_output=True)
    cards=[]
    for i,h in enumerate(r["hotels"]):
        a=fr[starts[i]]; b=fr[starts[i+1]]
        if snap: cards.append(f'    {{ from: {a+2}, to: {b}, place: "{h[0]}", name: "{h[1]}", offer: "{h[2]}" }},')
        else: cards.append(f'    {{ from: {a+3}, to: {b-4}, place: "{h[0]}", name: "{h[1]}", offer: "{h[2]}" }},')
    def tile(img,cx):
        W=Image.open(H+img[0] if isinstance(img,tuple) else H+img).size[0]
        return f'{{ src: "hotels/{img}", pos: "{50 if cx is None else round(100*cx/W)}% 50%" }}'
    if snap:
        tiles=", ".join(tile(h[4][0],h[4][1]) for h in r["hotels"])
        collageline=f'  collage: {{ to: {fr[1]}, caps: "{r["title"]}", best: "{r["best"]}",{(' pill: "'+r["pill"]+'", tap: '+str(round(7*bar/4))+',') if r.get("pill") else ""} tiles: [{tiles}] }},'
    else:
        collageline=f'  title: {{ from: 8, to: {fr[1]-4}, eyebrow: "Black Friday Sale", line: "{r["title"]}" }},'
    snapline=(f"\n  snap: {{ beat: {bar/4:.3f}, kicks: [] }}," if snap else "")
    var="bfRegion"+"".join(p.capitalize() for p in rid.split("-"))
    ts=f'''import type {{ RippleSpec }} from "../hotel-film/ripple/types";

// Black Friday region reel: {r["title"]} (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / {r["title"]}, ends on Save up to the region's best offer. Built by
// scratchpad build.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const {var}: RippleSpec = {{
  id: "bf-region-{rid}",
  picture: "campaigns/bf-region-{rid}/picture.mp4",
  frames: {total},
  feed: true,
  label: {{ eyebrow: "", name: "", from: 0, to: 1 }},
{collageline}
  cards: [
{chr(10).join(cards)}
  ],
  lines: [],
  deepScrim: true,{snapline}
  endCard: {{ at: {end}, eyebrow: "Black Friday Sale", line: "{r.get("end_line","Save up to "+r["best"])}", quick: true }},
  music: {{
    src: "{r["music"]}",
    startAt: {r["start"]},
    gain: {r["gain"]},
    seconds: {r["seconds"]},
    fadeOut: 45,
  }},
}};
'''
    open(f"src/hotels/bf-region-{rid}.ts","w").write(ts)
    print(rid, total, total/30)
