import { cp, mkdir, readdir, rm } from 'node:fs/promises';
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

const rootFiles = await readdir(root, { withFileTypes: true });
for (const entry of rootFiles) {
  if (!entry.isFile() || !/^(?:country-.+|apple-touch-icon|favicon-32|icon-(?:192|512|maskable-512))\.png$/u.test(entry.name)) continue;
  await cp(join(root, entry.name), join(output, entry.name));
}

console.log(`Mobile web assets prepared in ${output}`);
