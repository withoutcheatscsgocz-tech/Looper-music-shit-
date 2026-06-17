// Generates app icon + splash PNGs for @capacitor/assets, with no native deps.
// Draws the Looper "2x2 neon pad grid" motif into a raw RGBA buffer and
// encodes a PNG using only node:zlib.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
mkdirSync(OUT, { recursive: true });

const NEON = [ [176,38,255], [0,240,255], [255,45,85], [57,255,20] ]; // purple cyan red green
const BG = [8,8,12];

// ---- PNG encoder ----
const CRC = (() => { const t = new Uint32Array(256);
  for (let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
function crc32(buf){ let c=0xFFFFFFFF; for(let i=0;i<buf.length;i++) c=CRC[(c^buf[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function chunk(type, data){ const len=Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td=Buffer.concat([Buffer.from(type,'ascii'), data]); const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function encodePNG(w, h, rgba){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4); ihdr[8]=8; ihdr[9]=6; // 8-bit RGBA
  const raw=Buffer.alloc((w*4+1)*h);
  for(let y=0;y<h;y++){ raw[y*(w*4+1)]=0; rgba.copy(raw, y*(w*4+1)+1, y*w*4, y*w*4+w*4); }
  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT', deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]);
}

// signed distance to a rounded square centred at (cx,cy), half-size hs, corner r
function sdRoundRect(px,py,cx,cy,hs,r){ const dx=Math.abs(px-cx)-(hs-r), dy=Math.abs(py-cy)-(hs-r);
  const ax=Math.max(dx,0), ay=Math.max(dy,0); return Math.sqrt(ax*ax+ay*ay)+Math.min(Math.max(dx,dy),0)-r; }

function draw(size, { transparent=false, scale=0.62 }={}){
  const buf=Buffer.alloc(size*size*4);
  const cell=size*scale/2;       // half-extent of the 2x2 block
  const gap=cell*0.10, qs=(cell-gap)/2; // quarter square half-size
  const cx=size/2, cy=size/2, rad=qs*0.34;
  const centers=[ [cx-cell/2,cy-cell/2],[cx+cell/2,cy-cell/2],[cx-cell/2,cy+cell/2],[cx+cell/2,cy+cell/2] ];
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    let r=transparent?0:BG[0], g=transparent?0:BG[1], b=transparent?0:BG[2], a=transparent?0:255;
    // subtle background glow (only on opaque icons)
    if(!transparent){ const dgl=Math.hypot(x-cx,y-cy)/(size*0.7); const gl=Math.max(0,1-dgl);
      r=Math.min(255,r+gl*30); b=Math.min(255,b+gl*40); }
    for(let i=0;i<4;i++){ const [px,py]=centers[i]; const d=sdRoundRect(x,y,px,py,qs,rad); const [cr,cg,cb]=NEON[i];
      if(d<0){ r=cr; g=cg; b=cb; a=255; }
      else { const halo=Math.max(0, 1 - d/(qs*0.5)); if(halo>0){ const k=halo*halo*0.9; r=Math.min(255,r+cr*k); g=Math.min(255,g+cg*k); b=Math.min(255,b+cb*k); a=Math.max(a, Math.round(255*Math.min(1,k+ (transparent?0:0)))); if(transparent) a=Math.max(a,Math.round(220*k)); } }
    }
    const o=(y*size+x)*4; buf[o]=r; buf[o+1]=g; buf[o+2]=b; buf[o+3]=a;
  }
  return encodePNG(size,size,buf);
}

writeFileSync(resolve(OUT,'icon-background.png'), draw(1024, { transparent:false, scale:0.0001 })); // solid bg
writeFileSync(resolve(OUT,'icon-foreground.png'), draw(1024, { transparent:true,  scale:0.55 }));   // adaptive fg (safe zone)
writeFileSync(resolve(OUT,'icon-only.png'),       draw(1024, { transparent:false, scale:0.62 }));
writeFileSync(resolve(OUT,'splash.png'),          draw(2732, { transparent:false, scale:0.28 }));
writeFileSync(resolve(OUT,'splash-dark.png'),     draw(2732, { transparent:false, scale:0.28 }));
console.log('generated icons + splash in assets/');
