# LOOPER // RAGE PAD

A real-time **beat pad / DJ-looper** for the new wave of rage/experimental rap
(Yeat, 2Hollis, Ken Carson, Destroy Lonely, Summrs energy). Glitchy 808s,
distorted snares, chopped hats, dark atmospheric pads, vinyl stabs, phonk
percussion — **all synthesized live with the Web Audio API. No audio files.**

The entire app is a single self-contained file: [`index.html`](./index.html).
Open it in any browser and tap to play.

## How it works — the DJ looper

This isn't a one-shot-and-gone pad. There's an always-running **16-step
transport** locked to the BPM. Latch pads into it and layer up a beat:

- **LOOP mode** (default) — tap a pad to **latch its groove** into the loop.
  Tap again to drop it. Layer the 808, hat, snare, pad… and the beat builds
  itself. The transport auto-starts on the first latch.
- **TAP mode** — classic one-shot finger drumming.
- **EDIT mode** — tap a pad to select it, then tap the step bar to draw/erase
  its 16-step pattern. Each pad keeps its own pattern.

### Controls
| Control | What it does |
|---|---|
| **BPM dial** | 80–160 BPM (default 140). Loop re-times live as you turn it. |
| **Verb** | Global algorithmic reverb send. |
| **Drive** | Global waveshaper distortion. |
| **Filter** | Global lowpass sweep (master tone). |
| **Swing** | Shuffle — delays the off-16th notes for a phonk bounce. |
| **Pump** | Sidechain — ducks the whole mix to every kick for that rage-beat breathing. |
| **BANK A/B** | Switch between the two 16-pad banks (32 sounds total). |
| **BARS** | Loop length: 1 / 2 / 4 bars (16 / 32 / 64 steps). |
| **LO-FI** | Bitcrush + filtered lo-fi digital texture. |
| **PLAY / STOP** | Start/stop the transport. |
| **SAVE / LOAD** | Store/recall a full preset (incl. scenes & per-pad tweaks) in localStorage. |
| **WAV** | Render the full looped beat offline and download it as a `.wav`. |
| **CLR** | Clear all patterns and latches. |

### Scenes & Song mode
Four **scene slots** (S1–S4) snapshot the whole latched loop. Tap **STORE**
then a slot to save; tap a filled slot to recall it live. **SONG** auto-chains
your stored scenes — advancing to the next one every loop cycle for instant
intro → verse → drop arrangements.

### Per-pad sound tweaking
**Long-press any pad** to open its editor: **Volume**, **Pitch** (±12
semitones), **Decay**, and **Mute** — each pad independent. Sounds are
pre-rendered to buffers so pitch/decay are true sampler controls.

### Sounds (32 pads, 2 banks)
**Bank A:** 808 kick · snare+clap · closed/open hat · hat roll · glitch crash ·
rimshot · sub thud · dark pad · bell · vinyl scratch · glitch FX · reverse
cymbal · noise sweep · pluck · cowbell.
**Bank B:** reese bass · 808 sub-glide · 909 toms (hi/lo) · vox chop · reverse
vox · rave clap · laser zap · hard donk · air horn · siren · glass hit · arp
stab · FM bell · noise hit.

### Vibe
A reactive frequency **visualizer** pulses behind the grid, pads **glow** on
hit, and taps fire **haptic feedback**. Custom neon pad-grid **app icon +
splash** are generated for the APK.

Desktop testing: keys `1 2 3 4 / q w e r / a s d f / z x c v` map to the 16
pads of the current bank, `Space` toggles the transport.

## Sound palette (16 pads)
808 warped kick · snare + clap layer · closed hat · open hat · chopped hat roll ·
glitch crash · pitch-shifted rimshot · sub bass thud · dark atmospheric pad ·
detuned bell stab · vinyl scratch stab · digital glitch FX · reverse cymbal ·
noise sweep · melodic pluck · phonk cowbell.

## Build the Android APK (Capacitor)

The app is wrapped with [Capacitor](https://capacitorjs.com/). The web layer is
just `index.html` copied into `www/`.

### Option A — GitHub Actions (no local Android SDK needed)
Push to the branch (or run the **Build Android APK** workflow manually from the
Actions tab). CI installs the Android SDK, builds, and uploads
`looper-debug-apk` as a downloadable artifact. See
[`.github/workflows/android.yml`](./.github/workflows/android.yml).

### Option B — Local build
Requires Node 18+, JDK 21, and the Android SDK (`ANDROID_HOME` set).

```bash
npm install
npm run build:web        # copy index.html -> www/
npx cap add android      # scaffold the native android/ project (first time)
npm run assets           # generate + apply the neon app icon + splash
npm run apk:debug        # sync + gradlew assembleDebug
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

To open in Android Studio instead: `npm run open:android`.

### Signed release APK + GitHub Release
Push a version tag to build a **signed release APK** and publish it to a
GitHub Release automatically (see [`.github/workflows/release.yml`](./.github/workflows/release.yml)):

```bash
git tag v1.0.0 && git push origin v1.0.0
```

By default CI generates a throwaway signing key (installable/sideloadable).
For a stable upload key, set repo secrets `KEYSTORE_BASE64`,
`KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` and they'll be used instead.

> `android/` and `node_modules/` are git-ignored — they are generated by
> `cap add android` / `npm install`.
