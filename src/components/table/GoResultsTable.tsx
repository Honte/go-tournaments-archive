import attachHighlighter, { GoResultsHighlighter } from 'go-results-highlighter';
import 'go-results-highlighter/dist/browser.css';
import { HTMLProps, useCallback, useRef } from 'react';

export type HighlightedTableProps = HTMLProps<HTMLTableElement> & {
  rearranging?: boolean;
};

export function GoResultsTable(props: HighlightedTableProps) {
  const { rearranging = false, ...rest } = props;
  const ref = useRef<GoResultsHighlighter | null>(null);
  const attach = useCallback(
    (element: HTMLTableElement | null) => {
      if (!element) {
        ref.current?.dispose();
        return;
      }

      ref.current = attachHighlighter(element, {
        rearranging,
      });
    },
    [rearranging]
  );

  return <table {...rest} ref={attach} />;
}
