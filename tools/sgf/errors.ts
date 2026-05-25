export class MultipleLongestBranchesError extends Error {
  constructor(length: number) {
    super(`Multiple longest branches found with length ${length}`);
  }
}

export class MultipleGameBranchEndsError extends Error {
  constructor(count: number) {
    super(`Multiple game branch ends found: ${count}`);
  }
}
