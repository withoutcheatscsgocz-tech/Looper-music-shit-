// Copies the single-file app (index.html) into the Capacitor webDir (www/).
// The whole app is self-contained, so "building the web" is just a sync.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(resolve(root, 'www'), { recursive: true });
copyFileSync(resolve(root, 'index.html'), resolve(root, 'www/index.html'));
console.log('web -> www/index.html');
