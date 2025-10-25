import { writeFile } from 'node:fs/promises';
import sgfParser from '@sabaki/sgf';
import fg from 'fast-glob';

const files = await fg.glob('./public/sgf/**/*.sgf');

let toFix = 0;
let noFix = 0;
for (const file of files) {
  const sgf = sgfParser.parseFile(file);
  let fixed = false;

  if (fixPlayerRanks(sgf)) {
    fixed = true;
  }

  if (warnAboutMissingPlayers(sgf)) {
    console.log(`Missing players: ${file}`);
  }

  if (fixed) {
    toFix++;
    await writeFile(file, sgfParser.stringify(sgf), 'utf-8');
  } else {
    noFix++;
  }
}

function fixPlayerRanks(sgf) {
  const [root] = sgf;
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

function warnAboutMissingPlayers(sgf) {
  const [root] = sgf;

  return !root.data.PB || !root.data.PW;
}

console.log(`Fixed ${toFix} files; ${noFix} were not touched`);
