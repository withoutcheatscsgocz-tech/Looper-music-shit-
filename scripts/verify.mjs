// Headless smoke test: loads index.html in Chromium, drives the UI, and
// verifies the Web Audio engine starts, buffers render, and WAV export works.
const _pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const chromium = _pw.chromium || (_pw.default && _pw.default.chromium);
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = pathToFileURL(resolve('index.html')).href;
const errors = [];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|fonts\.googleapis/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });

await page.goto(url);
const pads = page.locator('.pad');
const check = (cond, label) => console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);

// 1. Start engine by hitting pads (kick, hat, snare)
await pads.nth(0).click();
await pads.nth(2).click();
await pads.nth(1).click();
await page.waitForFunction(() => typeof AC !== 'undefined' && AC && AC.state !== undefined, null, { timeout: 5000 });
await page.evaluate(async () => { if (AC.state === 'suspended') await AC.resume(); });
check(await page.evaluate(() => !!AC), 'AudioContext created');

// 2. Buffers pre-render
await page.waitForFunction(() => buffersReady === true, null, { timeout: 8000 });
check(await page.evaluate(() => buffersReady), 'all 32 pad buffers rendered');
check(await page.evaluate(() => padBuffers.filter(b => b && b.length > 0).length === 32), '32 non-empty buffers');

// 3. Transport runs (pads latched -> auto-started)
await page.waitForTimeout(700);
check(await page.evaluate(() => playing === true), 'transport running after latch');

// 4. Exercise new features: bank, screw, scenes, mixer, stutter, tape
await page.click('#btnBank');
check(await page.evaluate(() => bank === 1), 'bank B switch');
await page.click('#btnBank');
await page.evaluate(() => { screwKnob.set(60); });
check(await page.evaluate(() => screwRate < 1), 'screw lowers rate to ' + (await page.evaluate(()=>screwRate)).toFixed(3));
await page.click('.scene[data-s="0"]');           // stores S1 (empty slot)
check(await page.evaluate(() => !!scenes[0]), 'scene S1 stored');
await page.click('#btnMix');
check(await page.evaluate(() => document.getElementById('mixer').classList.contains('show')), 'mixer opens');
check(await page.evaluate(() => document.querySelectorAll('#mixStrips .strip').length === 32), '32 mixer strips');
await page.click('#mixClose');
await page.locator('#btnStut').dispatchEvent('mousedown');
await page.waitForTimeout(150);
await page.locator('#btnStut').dispatchEvent('mouseup');
check(await page.evaluate(() => stutTimer === null), 'stutter starts & stops cleanly');
await page.click('#btnTape');
await page.waitForTimeout(600);
check(await page.evaluate(() => playing === false), 'tape stop halts transport');

// 5. WAV export produces a real file
await page.evaluate(() => { latched[0] = true; if (!playing) startTransport(); });
await page.waitForTimeout(200);
const dl = page.waitForEvent('download', { timeout: 15000 });
await page.click('#btnWav');
const download = await dl;
const fs = await import('node:fs');
const p = await download.path();
const size = p ? fs.statSync(p).size : 0;
check(size > 5000, `WAV exported (${size} bytes)`);

check(errors.length === 0, 'no console/page errors');
if (errors.length) errors.forEach(e => console.log('   ' + e));

await browser.close();
process.exit(errors.length ? 1 : 0);
