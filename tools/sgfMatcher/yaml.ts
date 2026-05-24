import { type Document, Scalar, YAMLSeq } from 'yaml';
import type { StageAnalysisResult, UnmatchedEntry } from './types';

export function updateYamlDoc(doc: Document, stageIndex: number, stageResult: StageAnalysisResult): boolean {
  const before = doc.toString({ lineWidth: 0 });
  const stagesPath = ['stages', stageIndex];
  const unmatched = stageResult.unmatchedEntries.sort((a, b) => compareYamlEntryStrings(a.line, b.line));

  if (stageResult.inlineUpdates) {
    for (const update of stageResult.inlineUpdates) {
      doc.setIn([...stagesPath, ...update.path], update.value);
    }
  } else {
    const matched = [...stageResult.reusedEntries, ...stageResult.matchedEntries].sort(compareYamlEntryStrings);

    if (matched.length > 0) {
      doc.setIn([...stagesPath, 'games'], doc.createNode(matched));
    } else {
      doc.deleteIn([...stagesPath, 'games']);
    }
  }

  if (unmatched.length > 0) {
    doc.setIn([...stagesPath, 'unmatchedSgfs'], buildUnmatchedSeq(unmatched));
  } else {
    doc.deleteIn([...stagesPath, 'unmatchedSgfs']);
  }

  return doc.toString({ lineWidth: 0 }) !== before;
}

function compareYamlEntryStrings(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
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
