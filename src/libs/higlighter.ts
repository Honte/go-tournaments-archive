import attachHighlighter from 'go-results-highlighter';
import 'go-results-highlighter/dist/browser.css';

export function withHighlighter(element: HTMLElement) {
  attachHighlighter(element, {
    rearranging: false,
  });
}
