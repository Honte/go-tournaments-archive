declare module 'go-results-highlighter' {
  function attachHighlighter(
    element: HTMLElement,
    options?: {
      rearranging?: boolean;
      clicking?: boolean;
    }
  ): void;
  export default attachHighlighter;
}
