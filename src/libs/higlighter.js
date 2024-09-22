import 'go-results-highlighter/dist/browser.css';
import attachHighlighter from 'go-results-highlighter';

export function withHighlighter(element) {
  attachHighlighter(element, {
    rearranging: false
  })
}
