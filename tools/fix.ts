import EVENT from '@event';
import { readFile, writeFile } from 'node:fs/promises';
import fg from 'fast-glob';
import { Sgf, type SgfNode } from '@tools/sgf';

const files = await fg.glob(`./events/${EVENT}/**/*.sgf`);

let toFix = 0;
let noFix = 0;
let corrupted = 0;
for (const file of files) {
  try {
    const sgf = new Sgf(await readFile(file, 'utf-8'));
    const root = sgf.getRoot();
    let fixed = false;

    if (fixPlayerRanks(root)) {
      fixed = true;
    }

    if (warnAboutMissingPlayers(root)) {
      console.log(`Missing players: ${file}`);
    }

    if (fixed) {
      toFix++;
      await writeFile(file, sgf.toString(), 'utf-8');
    } else {
      noFix++;
    }
  } catch {
    corrupted++;
  }
}

function fixPlayerRanks(root: SgfNode): boolean {
  let fixed = false;

  if (root.data.RB) {
    root.data.BR = root.data.RB;
    delete root.data.RB;
    fixed = true;
  }

  if (root.data.RW) {
    root.data.WR = root.data.RW;
    delete root.data.RW;
    fixed = true;
  }

  return fixed;
}

function warnAboutMissingPlayers(root: SgfNode): boolean {
  return !root.data.PB || !root.data.PW;
}

console.log(`Fixed ${toFix} files; ${noFix} were not touched; ${corrupted} files were corrupted.`);
