import { loadTournaments } from '@/data/load';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

buildTemplates();

async function buildTemplates() {
  const tournaments = await loadTournaments();

  for (const tournament of tournaments) {
    const { players, games, stages, year, location } = tournament;
    const tournamentDir = join(TEMPLATES_DIR, String(year))
    const hasManyStages = stages.length > 1;

    await mkdir(tournamentDir, { recursive: true });


    for (const stage of stages) {
      switch (stage.type) {
        case 'league': // currently on leagues tournaments are supported
          for (const [roundNo, round] of stage.rounds.entries()) {
            for (const [gameNo, gameId] of round.entries()) {
              const game = games[gameId];
              const b = players[(game.players.find((p) => p.color === 'black') ?? game.players[0])?.id];
              const w = players[(game.players.find((p) => p.color === 'white') ?? game.players[1])?.id];

              if (!b || !w) {
                continue;
              }

              const data = {
                CA: 'UTF-8',
                FF: 4, // file format
                GM: 1, // game of go
                SZ: 19,
                EV: `Polish Go Championship ${year}`,
                PC: location,
                GN: `Round ${roundNo + 1} - Board ${gameNo + 1}`,
                KM: stage.komi ?? null,
                RU: stage.rules ?? 'japanese',
                RE: game.result,
                PB: b.name,
                PW: w.name,
                BR: b.rank,
                WR: w.rank
              };

              const stagePrefix = hasManyStages ? `-${stage.type}` : '';
              const file = join(tournamentDir, `${year}${stagePrefix}-${roundNo + 1}-${b.id}-${w.id}.sgf`);
              let content = ';'

              for (const prop in data) {
                const item = data[prop]

                if (item) {
                  content += `${prop}[${item}]`
                }
              }

              content += '\n()'

              await writeFile(file, content, 'utf-8');
            }
          }
          break;
      }
    }
  }
}


