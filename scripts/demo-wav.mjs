import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = dirname(fileURLToPath(import.meta.url));
const url = 'file://' + resolve(root, '..', 'index.html');
const out = process.argv[2] || '/tmp/looper-demo.wav';

const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await (await b.newContext({ acceptDownloads: true })).newPage();
await pg.goto(url);
await pg.evaluate(() => { initAudio(); });
await pg.waitForFunction(() => typeof buffersReady !== 'undefined' && buffersReady, { timeout: 15000 });
// latch a rage groove: 808 kick, sub, snare, closed hat, open hat, reese, bell
await pg.evaluate(() => { [0,7,1,2,3].forEach(i => { latched[i] = true; }); bpm = 145;
  // bank B reese (16) + bell (9) for some melody
  latched[16] = true; latched[9] = true; });
const dl = pg.waitForEvent('download', { timeout: 30000 });
await pg.evaluate(() => exportWav());
const d = await dl;
await d.saveAs(out);
await b.close();
console.log('demo WAV ->', out);
