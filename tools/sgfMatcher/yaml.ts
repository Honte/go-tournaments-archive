import { type Document, Scalar, YAMLSeq } from 'yaml';
import { compareEntries } from './entries';
import type { StageProcessResult, UnmatchedEntry } from './types';

export function updateYamlDoc(doc: Document, stageIndex: number, stageResult: StageProcessResult): void {
  const stagesPath = ['stages', stageIndex];
  const matched = [...stageResult.reusedEntries, ...stageResult.matchedEntries].sort(compareEntries);
  const unmatched = stageResult.unmatchedEntries.sort((a, b) => compareEntries(a.line, b.line));

  if (matched.length > 0) {
    doc.setIn([...stagesPath, 'games'], doc.createNode(matched));
  } else {
    doc.deleteIn([...stagesPath, 'games']);
  }

  if (unmatched.length > 0) {
    doc.setIn([...stagesPath, 'unmatchedSgfs'], buildUnmatchedSeq(unmatched));
  } else {
    doc.deleteIn([...stagesPath, 'unmatchedSgfs']);
  }
}

function buildUnmatchedSeq(entries: UnmatchedEntry[]): YAMLSeq<Scalar<string>> {
  const seq = new YAMLSeq<Scalar<string>>();
  for (const entry of entries) {
    const node = new Scalar(entry.line);
    if (entry.reasons.length > 0) {
      node.comment = ` ${entry.reasons.join(', ')}`;
    }
    seq.add(node);
  }
  return seq;
}
