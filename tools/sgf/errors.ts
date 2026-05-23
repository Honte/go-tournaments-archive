export class MultipleLongestBranchesError extends Error {
  constructor(length: number) {
    super(`Multiple longest branches found with length ${length}`);
  }
}
