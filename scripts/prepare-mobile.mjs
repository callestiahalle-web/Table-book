import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'www');
const directories = ['assets', 'css', 'js'];
const requiredFiles = ['index.html', 'site.webmanifest'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const directory of directories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

for (const file of requiredFiles) {
  await cp(join(root, file), join(output, file));
}

console.log(`Mobile web assets prepared in ${output}`);
