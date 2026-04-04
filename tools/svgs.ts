import EVENT from '@event';
import { writeFile } from 'node:fs/promises';
import { loadTournaments } from '@/data/load';
import { generateSvg } from './svg';

const tournaments = await loadTournaments();

await generateSvgs();
console.log('Done');

async function generateSvgs() {
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (game?.props?.sgf) {
        const sgf = game.props.sgf.replace(process.env.SGF_URL_PREFIX ?? '', '').replace(`${tournament.year}/`, '');

        const source = `./events/${EVENT}/sgf/${tournament.year}/${sgf}`;
        const target = source.replace('.sgf', '.svg');
        const svg = await generateSvg(source);

        if (!svg) {
          continue;
        }

        await writeFile(target, svg);
        console.log('Saved SVG', target);
      }
    }
  }
}
