import type { InputStage, InputTournament } from '@/schema/input';
import { processExplicitStage } from './explicit';
import { processImplicitStage } from './implicit';
import type { StageAnalysisResult } from './types';

type StageProcessInput = {
  tournament: InputTournament;
  stage: InputStage;
  sgfPaths: string[];
  dataDir: string;
  sgfDir: string;
  force: boolean;
  strict: boolean;
};

export async function processStage(input: StageProcessInput): Promise<StageAnalysisResult> {
  switch (input.stage.type) {
    case 'tournament':
      return processImplicitStage({ ...input, stage: input.stage });
    case 'league':
    case 'ladder-table':
    case 'round-robin-table':
    case 'final':
      return processExplicitStage({ ...input, stage: input.stage });
  }
}
