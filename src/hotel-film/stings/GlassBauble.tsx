import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A CBH glass bauble (Scott, 25 Nov: The Relais Cooden Beach's AI baubles, "can we try something like it but in glass
// or felt", "make it CBH so it's fresh and original", "do it in code and then render in jpg or mp4", "like the
// snowglobe"). Built in three.js, not generated: black glass with a gold painted band, the real CB monogram (the
// logo's own outline) fired on in gold, a fluted gold cap and a gold cord, turning slowly on its cord in a pool of
// gold bokeh. The 2026 brand palette (Scott, 25 Nov): black #000000 and gold #c7ab77 lead, with the neutrals pale
// #f2f0f0 and light beige #ebe8e4; the secondaries (red #a05272, green #869674, blue #779096, heather #755c78)
// only as a lift, one or two at most, never leading.

export const BAUBLE_W = 1080;
export const BAUBLE_H = 1350;
export const BAUBLE_FRAMES = 240;

const PAL = {
  black: "#000000",
  gold: "#c7ab77",
  pale: "#f2f0f0",
  beige: "#ebe8e4",
  green: "#869674",
};

const TW = 2048;
const TH = 1024; // equirectangular: square pixels at the equator
const FRONT_U = 0.25; // three's SphereGeometry faces +z (the camera) at u = 0.25

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

// the CB, cut tight from the logo's frame and filled flat gold
export const cbMask = async () => {
  const im = await loadImage(staticFile("brand/cbh-logo-cb-only.svg"));
  const s = 4;
  const c = document.createElement("canvas");
  c.width = 534 * s;
  c.height = 656 * s;
  const x = c.getContext("2d")!;
  x.drawImage(im, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++)
    for (let i = 0; i < c.width; i++)
      if (d[(y * c.width + i) * 4 + 3] > 8) {
        x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
};

// trim a canvas to its painted pixels
const trim = (c: HTMLCanvasElement) => {
  const x = c.getContext("2d")!;
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++)
    for (let i = 0; i < c.width; i++)
      if (d[(y * c.width + i) * 4 + 3] > 8) {
        x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
};

// The gold designs for the other baubles, drawn as line work like gilding on glass (white here; the skin turns it
// gold), on an 800 x 800 board.
export const drawMotif = (kind: string) => {
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 800;
  const k = c.getContext("2d")!;
  k.strokeStyle = "#fff";
  k.fillStyle = "#fff";
  k.lineCap = "round";
  k.lineJoin = "round";
  const line = (pts: number[][], w: number) => {
    k.lineWidth = w;
    k.beginPath();
    pts.forEach(([x, y], i) => (i ? k.lineTo(x, y) : k.moveTo(x, y)));
    k.stroke();
  };
  const ell = (x: number, y: number, rx: number, ry: number, w: number, fill = false) => {
    k.lineWidth = w;
    k.beginPath();
    k.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) k.fill();
    else k.stroke();
  };
  if (kind === "manor") {
    // a Georgian country house: cornice and pediment, two chimneys, lit windows, a wreath on the arched door
    k.lineWidth = 14;
    k.strokeRect(160, 330, 480, 320);
    line([[130, 330], [670, 330]], 20);
    line([[300, 330], [400, 252], [500, 330]], 14);
    k.strokeRect(200, 250, 44, 80);
    k.strokeRect(556, 250, 44, 80);
    // windows as gilded outlines with a glazing bar, so the house reads as line work, not a grid of blocks
    const win = (x: number, y: number) => {
      k.lineWidth = 9;
      k.strokeRect(x, y, 48, 66);
      line([[x + 24, y + 4], [x + 24, y + 62]], 5);
      line([[x + 4, y + 33], [x + 44, y + 33]], 5);
    };
    for (const y of [370, 470]) for (const x of [196, 276, 376, 476, 556]) win(x, y);
    for (const x of [196, 276, 476, 556]) win(x, 568);
    k.lineWidth = 12;
    k.beginPath();
    k.moveTo(372, 650);
    k.lineTo(372, 600);
    k.arc(400, 600, 28, Math.PI, 0);
    k.lineTo(428, 650);
    k.stroke();
    ell(400, 604, 11, 11, 6);
    line([[330, 668], [470, 668]], 12);
    line([[140, 668], [660, 668]], 8);
  } else if (kind === "dalmahoy") {
    // Dalmahoy, traced from its south front (Scott, 26 Nov: "the actual shape of our hotels instead of generic"): a
    // Georgian house of three storeys, a balustraded parapet with urns, paired chimney stacks behind, rusticated quoins,
    // and its double curved stair climbing to the carved doorcase on the first floor
    // chimney stacks with their pots, behind the parapet
    for (const x0 of [262, 486]) {
      k.lineWidth = 9;
      k.strokeRect(x0, 214, 54, 78);
      for (const dx of [8, 22, 36]) k.strokeRect(x0 + dx, 196, 10, 18);
    }
    // the parapet: a top rail, balusters, the cornice, urns on the posts
    line([[164, 296], [636, 296]], 9);
    for (let x = 180; x <= 622; x += 13) line([[x, 300], [x, 322]], 4);
    line([[150, 328], [650, 328]], 16);
    for (const x of [172, 322, 478, 628]) {
      k.lineWidth = 8;
      k.strokeRect(x - 9, 296, 18, 30);
      ell(x, 282, 9, 12, 7);
      line([[x, 268], [x, 262]], 6);
    }
    // the walls, and the band between the ground and first floors
    line([[172, 328], [172, 640]], 10);
    line([[628, 328], [628, 640]], 10);
    line([[172, 520], [628, 520]], 6);
    // rusticated quoins up the corners and the centre bay
    for (const x of [172, 628, 362, 438]) {
      for (let y = 340; y < 630; y += 26) {
        const w = (Math.round((y - 340) / 26) % 2 ? 12 : 20) * (x < 400 ? 1 : -1);
        line([[x, y], [x + w, y]], 4);
      }
    }
    // windows: three bays each side, two floors above, the ground floor below the band
    const win = (x: number, y: number, h: number) => {
      k.lineWidth = 7;
      k.strokeRect(x - 18, y, 36, h);
      line([[x, y + 3], [x, y + h - 3]], 3);
      line([[x - 15, y + h / 2], [x + 15, y + h / 2]], 3);
      line([[x - 22, y + h + 6], [x + 22, y + h + 6]], 5);
    };
    for (const x of [214, 270, 326, 474, 530, 586]) {
      win(x, 352, 56);
      win(x, 436, 62);
      // the stair stands in front of the inner ground floor windows
      if (x < 300 || x > 500) win(x, 548, 48);
    }
    win(400, 352, 56);
    // the doorcase: an arched door with a carved pediment and scrolls
    k.lineWidth = 9;
    k.beginPath();
    k.moveTo(378, 512);
    k.lineTo(378, 452);
    k.arc(400, 452, 22, Math.PI, 0);
    k.lineTo(422, 512);
    k.stroke();
    line([[400, 430], [400, 512]], 3);
    k.lineWidth = 7;
    k.beginPath();
    k.moveTo(362, 428);
    k.quadraticCurveTo(372, 404, 386, 414);
    k.moveTo(438, 428);
    k.quadraticCurveTo(428, 404, 414, 414);
    k.stroke();
    ell(400, 404, 10, 12, 6);
    // the double stair: a landing at the door, two flights curving down to the lawn, their balustrades
    line([[350, 516], [450, 516]], 9);
    k.lineWidth = 9;
    k.beginPath();
    // each flight's underside, and its handrail above, sweeping down and out from the landing to the lawn
    k.moveTo(352, 518);
    k.bezierCurveTo(330, 530, 316, 600, 300, 646);
    k.moveTo(448, 518);
    k.bezierCurveTo(470, 530, 484, 600, 500, 646);
    k.stroke();
    k.lineWidth = 6;
    k.beginPath();
    k.moveTo(354, 498);
    k.bezierCurveTo(328, 510, 306, 580, 286, 626);
    k.moveTo(446, 498);
    k.bezierCurveTo(472, 510, 494, 580, 514, 626);
    k.stroke();
    // the steps: short treads between the two lines
    for (let i = 1; i < 7; i++) {
      const u = i / 7, v = 1 - u;
      const bx = v * v * v * 352 + 3 * v * v * u * 330 + 3 * v * u * u * 316 + u * u * u * 300;
      const by = v * v * v * 518 + 3 * v * v * u * 530 + 3 * v * u * u * 600 + u * u * u * 646;
      line([[bx, by], [bx - 12, by - 18]], 3);
      line([[800 - bx, by], [800 - bx + 12, by - 18]], 3);
    }
    // a garden door under the landing, and the lawn
    k.lineWidth = 7;
    k.strokeRect(386, 572, 28, 68);
    line([[130, 648], [670, 648]], 10);
  } else if (kind === "hintlesham") {
    // Hintlesham Hall, Suffolk, from its Georgian south front: a long two storey house under a low hipped roof, the
    // centre bay brought forward under a pediment and framed by giant pilasters, tall windows above, arched windows on
    // the ground floor, the door between columns
    line([[150, 352], [196, 316], [604, 316], [650, 352]], 8);
    for (const x0 of [232, 540]) {
      k.lineWidth = 8;
      k.strokeRect(x0, 270, 30, 46);
    }
    line([[138, 356], [662, 356]], 14);
    line([[150, 356], [150, 640]], 9);
    line([[650, 356], [650, 640]], 9);
    // the centre bay: forward, its own cornice and pediment, four giant pilasters
    k.lineWidth = 9;
    k.beginPath();
    k.moveTo(316, 640);
    k.lineTo(316, 344);
    k.lineTo(484, 344);
    k.lineTo(484, 640);
    k.stroke();
    line([[306, 344], [400, 268], [494, 344]], 11);
    ell(400, 318, 14, 14, 5);
    for (const x of [328, 372, 428, 472]) {
      line([[x, 352], [x, 632]], 6);
      line([[x - 8, 356], [x + 8, 356]], 5);
      line([[x - 8, 630], [x + 8, 630]], 5);
    }
    line([[150, 500], [316, 500]], 5);
    line([[484, 500], [650, 500]], 5);
    // the first floor's tall windows, the ground floor's arched ones
    const sash = (x: number, y: number, h: number, arched: boolean) => {
      k.lineWidth = 7;
      k.beginPath();
      if (arched) {
        k.moveTo(x - 17, y + h);
        k.lineTo(x - 17, y + 17);
        k.arc(x, y + 17, 17, Math.PI, 0);
        k.lineTo(x + 17, y + h);
        k.closePath();
      } else k.rect(x - 17, y, 34, h);
      k.stroke();
      line([[x, y + 4], [x, y + h - 3]], 3);
      line([[x - 14, y + h * 0.5], [x + 14, y + h * 0.5]], 3);
    };
    for (const x of [190, 236, 282, 518, 564, 610]) {
      sash(x, 384, 82, false);
      sash(x, 528, 86, true);
    }
    sash(400, 384, 82, false);
    // the door between its columns, a small pediment over it
    k.lineWidth = 9;
    k.beginPath();
    k.moveTo(384, 640);
    k.lineTo(384, 560);
    k.arc(400, 560, 16, Math.PI, 0);
    k.lineTo(416, 640);
    k.stroke();
    line([[356, 538], [400, 516], [444, 538]], 6);
    line([[362, 544], [362, 640]], 6);
    line([[438, 544], [438, 640]], 6);
    // the lawn
    line([[120, 648], [680, 648]], 10);
  } else if (kind === "coombe") {
    // Coombe Abbey, Coventry, from its gardens: the classical front on the left (a balustraded parapet, the carved
    // pediment over the middle bays, tall chimneys) joined to the Tudor wing on the right (three gables with finials,
    // tall paired chimneys, mullioned windows)
    // the classical front
    line([[140, 342], [168, 318], [432, 318], [460, 342]], 7);
    for (const [x, top] of [[150, 236], [238, 290], [362, 290]] as [number, number][]) {
      k.lineWidth = 7;
      k.strokeRect(x, top, 24, 318 - top);
    }
    line([[128, 346], [472, 346]], 9);
    line([[124, 362], [476, 362]], 12);
    line([[226, 362], [300, 316], [374, 362]], 10);
    ell(300, 342, 20, 10, 5);
    line([[130, 362], [130, 640]], 8);
    line([[470, 362], [470, 640]], 8);
    line([[130, 480], [470, 480]], 5);
    const win = (x: number, y: number, w: number, h: number, bars: number) => {
      k.lineWidth = 6;
      k.strokeRect(x - w / 2, y, w, h);
      for (let i = 1; i < bars; i++) line([[x - w / 2 + (w * i) / bars, y + 3], [x - w / 2 + (w * i) / bars, y + h - 3]], 3);
      line([[x - w / 2 + 3, y + h * 0.45], [x + w / 2 - 3, y + h * 0.45]], 3);
    };
    for (const x of [164, 208, 252, 300, 348, 392, 436]) {
      win(x, 380, 28, 76, 2);
      if (x !== 300) win(x, 500, 28, 80, 2);
    }
    // the door, under a small pediment
    k.lineWidth = 8;
    k.strokeRect(286, 530, 28, 110);
    line([[276, 524], [300, 506], [324, 524]], 6);
    // the Tudor wing: three gables with finials, tall paired chimneys
    for (const [x0, top] of [[530, 220], [544, 220], [604, 226], [618, 226]] as [number, number][]) {
      k.lineWidth = 6;
      k.strokeRect(x0, top, 12, 300 - top);
    }
    k.lineWidth = 8;
    k.beginPath();
    k.moveTo(470, 362);
    for (const [a, p, b] of [[470, 505, 540], [540, 575, 610], [610, 645, 680]]) {
      k.lineTo(a, 362);
      k.lineTo(p, 300);
      k.lineTo(b, 362);
    }
    k.lineTo(680, 640);
    k.stroke();
    for (const p of [505, 575, 645]) line([[p, 300], [p, 284]], 5);
    for (const p of [505, 575, 645]) {
      win(p, 330, 22, 24, 2);
      win(p, 386, 50, 64, 3);
      win(p, 500, 50, 70, 3);
    }
    // the lawn
    line([[110, 648], [690, 648]], 10);
  } else if (kind === "oakley") {
    // Oakley Hall, Hampshire, from the lawn: a red brick Georgian house, its two full height bows either side of the
    // centre, a balustraded parapet, tall chimneys, the porch on columns, lower wings either side
    for (const x0 of [318, 458]) {
      k.lineWidth = 8;
      k.strokeRect(x0, 222, 24, 78);
      line([[x0 - 2, 222], [x0 + 26, 222]], 6);
    }
    // the parapet: rail, balusters, the cornice
    line([[196, 300], [604, 300]], 8);
    for (let x = 206; x <= 594; x += 12) line([[x, 304], [x, 324]], 3);
    line([[188, 330], [612, 330]], 13);
    // the walls and the two bows, drawn with their curved faces
    line([[200, 330], [200, 640]], 9);
    line([[600, 330], [600, 640]], 9);
    for (const [a, b] of [[200, 300], [500, 600]]) {
      line([[a, 330], [a, 640]], 6);
      line([[b, 330], [b, 640]], 6);
      k.lineWidth = 4;
      for (const y of [330, 640]) {
        k.beginPath();
        k.ellipse((a + b) / 2, y, (b - a) / 2, 12, 0, 0, Math.PI);
        k.stroke();
      }
    }
    // the lower wings
    line([[140, 640], [140, 404], [200, 380]], 8);
    line([[660, 640], [660, 404], [600, 380]], 8);
    // windows: three floors across, the ground floor taller
    const sash = (x: number, y: number, h: number) => {
      k.lineWidth = 6;
      k.strokeRect(x - 15, y, 30, h);
      line([[x, y + 3], [x, y + h - 3]], 3);
      line([[x - 12, y + h / 2], [x + 12, y + h / 2]], 3);
    };
    for (const x of [222, 278, 346, 400, 454, 522, 578]) {
      sash(x, 348, 52);
      sash(x, 430, 66);
      if (x < 370 || x > 430) sash(x, 532, 80);
    }
    for (const x of [170, 630]) sash(x, 470, 66);
    // the porch: columns, entablature, the arched door with its fanlight
    line([[352, 520], [448, 520]], 10);
    for (const x of [362, 384, 416, 438]) line([[x, 524], [x, 640]], 6);
    k.lineWidth = 7;
    k.beginPath();
    k.moveTo(388, 640);
    k.lineTo(388, 572);
    k.arc(400, 572, 12, Math.PI, 0);
    k.lineTo(412, 640);
    k.stroke();
    line([[110, 648], [690, 648]], 10);
  } else if (kind === "key") {
    // a vintage hotel room key: an open bow with an inner ring, a collar, the shaft and the bit
    ell(210, 400, 112, 112, 22);
    ell(210, 400, 58, 58, 12);
    line([[322, 400], [650, 400]], 24);
    line([[350, 372], [350, 428]], 12);
    line([[378, 372], [378, 428]], 12);
    k.beginPath();
    k.moveTo(560, 400);
    k.lineTo(560, 500);
    k.lineTo(590, 500);
    k.lineTo(590, 462);
    k.lineTo(615, 462);
    k.lineTo(615, 510);
    k.lineTo(650, 510);
    k.lineTo(650, 400);
    k.closePath();
    k.fill();
  } else if (kind === "tea") {
    // a three tier afternoon tea stand: the ring handle, the rod, three plates of little cakes, the foot
    ell(400, 112, 34, 34, 16);
    line([[400, 146], [400, 650]], 20);
    const tiers: [number, number][] = [[272, 130], [422, 175], [582, 220]];
    tiers.forEach(([y, rx], ti) => {
      ell(400, y, rx, rx * 0.17, 20);
      // little cakes and scones on each plate, either side of the rod
      const n = 2 + ti;
      for (let i = 0; i < n; i++) {
        const x = 400 - rx * 0.6 + (i * rx * 1.2) / (n - 1);
        if (Math.abs(x - 400) < 30) continue;
        k.beginPath();
        k.arc(x, y - 12, 30 + ti * 3, Math.PI, 0);
        k.fill();
      }
    });
    ell(400, 662, 80, 16, 10, true);
  }
  return trim(c);
};

type Variant = { motif: "cb" | "manor" | "dalmahoy" | "hintlesham" | "coombe" | "oakley" | "key" | "tea"; glass: string; height: number };
// The carousel (Scott: "do a few others for like a carousel"): black, pale, green and red glass, each one gold design.
// The palette's green and red are secondaries, so each only as one bauble's glass, never together on one.
export const BAUBLES: Record<string, Variant> = {
  cb: { motif: "cb", glass: "#010101", height: 0.3 },
  manor: { motif: "manor", glass: "#e6e1d8", height: 0.27 },
  dalmahoy: { motif: "dalmahoy", glass: "#e6e1d8", height: 0.3 },
  hintlesham: { motif: "hintlesham", glass: "#2f3a29", height: 0.3 },
  coombe: { motif: "coombe", glass: "#4e2233", height: 0.35 },
  oakley: { motif: "oakley", glass: "#2f3a29", height: 0.32 }, // Oakley Hall in gold on the green glass // Coombe Abbey in gold on the deep red glass // Hintlesham Hall in gold on the green glass // the real house: Dalmahoy's south front
  key: { motif: "key", glass: "#2f3a29", height: 0.2 },
  tea: { motif: "tea", glass: "#4e2233", height: 0.31 },
};

// Paint one layer of the sphere's skin. `ink` draws the gold work; the colour map gets it in gold over black glass,
// the roughness/metal map gets it as polished metal (G = roughness, B = metalness) over smooth glass.
export const paintSkin = (cb: HTMLCanvasElement, glassColor = "#010101", height = 0.3) => {
  const make = () => {
    const c = document.createElement("canvas");
    c.width = TW;
    c.height = TH;
    return c;
  };
  const ink = make();
  const k = ink.getContext("2d")!;
  k.fillStyle = "#fff";
  // two fine bands above and below the equator, and a row of small beads between them round the back
  const band = (v: number, h: number) => k.fillRect(0, v * TH - h / 2, TW, h);
  band(0.3, 7);
  band(0.318, 2.5);
  band(0.7, 7);
  band(0.682, 2.5);
  for (let i = 0; i < 64; i++) {
    const u = (i + 0.5) / 64;
    const du = Math.abs(((u - FRONT_U + 1.5) % 1) - 0.5); // distance round from the front
    if (du < 0.13) continue; // keep the front clear for the CB
    k.beginPath();
    k.arc(u * TW, TH * 0.5, 5, 0, Math.PI * 2);
    k.fill();
  }
  // the CB at the front, pre-squeezed row by row so it reads true on the sphere (rows away from the equator stretch
  // by 1 / cos(latitude) once wrapped)
  let cbH = TH * height; // 0.3 is ~54 degrees of latitude tall
  let cbW = (cbH * cb.width) / cb.height;
  if (cbW > TW * 0.2) { // a wide design (the key): keep it within the front of the bauble
    cbH *= (TW * 0.2) / cbW;
    cbW = TW * 0.2;
  }
  const top = TH * 0.5 - cbH / 2;
  for (let r = 0; r < Math.ceil(cbH); r++) {
    const v = (top + r) / TH;
    const lat = (0.5 - v) * Math.PI;
    const sq = Math.cos(lat);
    const sy = (r / cbH) * cb.height;
    const w = cbW / sq;
    k.drawImage(cb, 0, sy, cb.width, cb.height / cbH + 0.5, FRONT_U * TW - w / 2, top + r, w, 1.2);
  }
  const color = make();
  const c = color.getContext("2d")!;
  c.fillStyle = glassColor;
  c.fillRect(0, 0, TW, TH);
  c.globalCompositeOperation = "source-over";
  const gold = make();
  const g = gold.getContext("2d")!;
  g.drawImage(ink, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = PAL.gold;
  g.fillRect(0, 0, TW, TH);
  c.drawImage(gold, 0, 0);
  const rm = make();
  const m = rm.getContext("2d")!;
  m.fillStyle = "rgb(0,14,0)"; // glass: smooth, not metal
  m.fillRect(0, 0, TW, TH);
  const metal = make();
  const mt = metal.getContext("2d")!;
  mt.drawImage(ink, 0, 0);
  mt.globalCompositeOperation = "source-in";
  mt.fillStyle = "rgb(0,80,255)"; // gold leaf: a little rough, fully metal
  mt.fillRect(0, 0, TW, TH);
  m.drawImage(metal, 0, 0);
  const tex = (cv: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(color, true), rough: tex(rm, false) };
};

const Environment: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    return pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.42;
  return null;
};

const goldMat = () =>
  new THREE.MeshPhysicalMaterial({ color: new THREE.Color(PAL.gold), metalness: 1, roughness: 0.22, clearcoat: 0.6 });

export type Turn = { from: number; to: number; span: number };
const DEFAULT_TURN: Turn = { from: -0.95, to: 0.35, span: BAUBLE_FRAMES };
// A swing on its cord (Scott: "start swinging", for a video carousel): set going as if just tapped, a pendulum from a
// pivot high above the frame so the cord and ornament move together, dying away over a few seconds.
export const PIVOT = 4.2;
export const swingAngle = (t: number) => 0.13 * Math.exp(-t / 2.6) * Math.sin((2 * Math.PI * t) / 2.4);
const Bauble: React.FC<{ skin: { map: THREE.Texture; rough: THREE.Texture }; spin: Turn; swing?: boolean }> = ({ skin, spin, swing = false }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  // turning slowly on its cord: from three-quarters round to face on and a little past, with a gentle sway
  const turn = interpolate(frame, [0, spin.span], [spin.from, spin.to], { extrapolateRight: "clamp" });
  const sway = 0.035 * Math.sin(t * 1.1);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: skin.map,
        roughnessMap: skin.rough,
        metalnessMap: skin.rough,
        roughness: 1,
        metalness: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        ior: 1.5,
        reflectivity: 0.6,
      }),
    [skin],
  );
  const gold = useMemo(goldMat, []);
  // the cap's flutes
  const cap = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.0, 0.0));
    pts.push(new THREE.Vector2(0.3, 0.0));
    pts.push(new THREE.Vector2(0.31, 0.03));
    pts.push(new THREE.Vector2(0.29, 0.06));
    pts.push(new THREE.Vector2(0.27, 0.27));
    pts.push(new THREE.Vector2(0.29, 0.3));
    pts.push(new THREE.Vector2(0.2, 0.34));
    pts.push(new THREE.Vector2(0.0, 0.35));
    const geo = new THREE.LatheGeometry(pts, 96);
    // flutes: push the wall in and out round the cap
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (y > 0.06 && y < 0.27) {
        const a = Math.atan2(z, x);
        const f = 1 + 0.06 * Math.cos(a * 16);
        pos.setX(i, x * f);
        pos.setZ(i, z * f);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  return (
    <group position={[0, PIVOT, 0]} rotation={[0, 0, swing ? swingAngle(t) : 0]}>
    <group position={[0, 1.35 - PIVOT, 0]} rotation={[0, 0, sway]}>
      {/* the cord, from above the frame down to the loop */}
      <mesh position={[0, 2.2, 0]} material={gold}>
        <cylinderGeometry args={[0.012, 0.012, 4.2, 12]} />
      </mesh>
      <group position={[0, -1.35, 0]} rotation={[0, turn, 0]}>
        <mesh material={glass} castShadow>
          <sphereGeometry args={[1, 160, 120]} />
        </mesh>
        <mesh geometry={cap} material={gold} position={[0, 0.93, 0]} />
        <mesh material={gold} position={[0, 1.37, 0]}>
          <torusGeometry args={[0.085, 0.018, 16, 48]} />
        </mesh>
      </group>
    </group>
    </group>
  );
};

// gold bokeh, out of focus behind the bauble, drifting a little
const BOKEH = Array.from({ length: 9 }, (_, i) => {
  const r = (n: number) => {
    const s = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return {
    x: r(1) * BAUBLE_W,
    y: r(2) * BAUBLE_H,
    d: 60 + r(3) * 190,
    o: 0.3 + r(4) * 0.5,
    pale: r(5) > 0.7,
    red: r(7) > 0.86,
    drift: (r(6) - 0.5) * 30,
  };
});

// The tree round it, all out of focus (Scott: "add the christmas tree artifacts like how you have gold flecks in the
// back out of focus, do more festive colours"): pine branches reaching in from the edges, a few red, gold and pale
// baubles hanging further back, and warm fairy lights among the gold bokeh. Drawn as SVG and blurred by depth.
// a few far baubles only (Scott: "fewer out of focus bokeh")
const FAR_BAUBLES = [
  { x: 150, y: 380, r: 62, c: "#8e1f2b", blur: 12 },
  { x: 930, y: 640, r: 78, c: "#8e1f2b", blur: 14 },
  { x: 190, y: 1010, r: 54, c: PAL.gold, blur: 12 },
];

const TreeBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const d = (frame / BAUBLE_FRAMES) * 2 - 1; // -1 .. 1 over the shot
  return (
    <>
      {FAR_BAUBLES.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.r + d * 6,
            top: b.y - b.r,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle at 38% 34%, rgba(255,240,215,0.75) 0%, ${b.c} 22%, ${b.c} 60%, rgba(0,0,0,0.9) 100%)`,
            filter: `blur(${b.blur + 4}px)`,
            opacity: 0.5,
          }}
        />
      ))}
    </>
  );
};

// The dark background, shared with the felt ornaments (Scott: "a black background like the Christmas glass ones, match
// that"): the quiet tree behind (DarkBack) and the soft near branch in front of the ornament (DarkFront).
export const DarkBack: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <TreeBackdrop frame={frame} />
    {BOKEH.map((b, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: b.x - b.d / 2 + (b.drift * frame) / BAUBLE_FRAMES,
          top: b.y - b.d / 2,
          width: b.d,
          height: b.d,
          borderRadius: "50%",
          // a lit disc with a brighter rim, like an out of focus fairy light
          background: b.red
            ? "radial-gradient(circle, #b3303ccc 0%, #b3303caa 58%, #d4505c 66%, transparent 71%)"
            : `radial-gradient(circle, ${b.pale ? "#ffe9c2" : PAL.gold}cc 0%, ${b.pale ? "#ffe9c2" : PAL.gold}aa 58%, ${b.pale ? "#fff4dc" : "#e2cc9c"} 66%, transparent 71%)`,
          opacity: 0.6 * b.o * (b.red ? 0.7 : b.pale ? 0.6 : 0.8),
          filter: `blur(${2 + b.d / 55}px)`,
        }}
      />
    ))}
    {/* the light falling away to black round the edges, so the bauble sits in a warm pool */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 55%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.8) 100%)" }} />
  </>
);
// (the soft near branch is gone: Scott, "get rid of the Christmas tree brush strokes"; kept as a no-op so callers stay)
export const DarkFront: React.FC<{ frame: number }> = () => null;

// `bare`: the ornament alone on a transparent ground (the baubles reel lays one background under every ornament)
export const GlassBauble: React.FC<{ variant?: string; spin?: Turn; bare?: boolean; swing?: boolean }> = ({ variant = "cb", spin = DEFAULT_TURN, bare = false, swing = false }) => {
  const v = BAUBLES[variant];
  const frame = useCurrentFrame();
  const [skin, setSkin] = useState<{ map: THREE.Texture; rough: THREE.Texture } | null>(null);
  const [handle] = useState(() => delayRender("bauble skin"));
  useEffect(() => {
    (v.motif === "cb" ? cbMask() : Promise.resolve(drawMotif(v.motif)))
      .then((m) => {
        setSkin(paintSkin(m, v.glass, v.height));
        continueRender(handle);
      })
      .catch((e) => {
        throw e;
      });
  }, [handle, v]);
  const push = interpolate(frame, [0, spin.span], [7.4, 6.6], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: bare ? "transparent" : PAL.black }}>
      {bare ? null : <DarkBack frame={frame} />}
      {skin ? (
        <ThreeCanvas
          width={BAUBLE_W}
          height={BAUBLE_H}
          camera={{ fov: 30, position: [0, 0.1, push], near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        >
          <Environment />
          <ambientLight intensity={0.15} />
          <pointLight position={[2.5, 3, 4]} intensity={34} color="#ffe2b8" />
          <pointLight position={[0, 0.5, -3]} intensity={10} color="#e8cf9c" />
          <pointLight position={[-3, -1, 2]} intensity={8} color={PAL.gold} />
          <Bauble skin={skin} spin={spin} swing={swing} />
        </ThreeCanvas>
      ) : null}
      {bare ? null : <DarkFront frame={frame} />}
    </AbsoluteFill>
  );
};
