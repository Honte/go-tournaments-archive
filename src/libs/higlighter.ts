import attachHighlighter from 'go-results-highlighter';
import 'go-results-highlighter/dist/browser.css';

export function withHighlighter(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  attachHighlighter(element, {
    rearranging: false,
  });
}
