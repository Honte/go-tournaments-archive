declare module 'go-results-highlighter' {
  export type GoResultsHighlighter = {
    highlight(player: number, games?: number, rearrange?: boolean): void;
    dispose(): void;
  };

  function attachHighlighter(
    element: HTMLElement,
    options?: {
      rearranging?: boolean;
      clicking?: boolean;
    }
  ): GoResultsHighlighter;

  export default attachHighlighter;
}
