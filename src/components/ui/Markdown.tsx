import ReactMarkdown, { type Components } from 'react-markdown';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { H1 } from '@/components/ui/H1';
import { H2 } from '@/components/ui/H2';

const COMPONENTS: Components = {
  h1: ({ children }) => <H1>{children}</H1>,
  h2: ({ children }) => <H2>{children}</H2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>,
  p: ({ children }) => <p className="my-2">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 my-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 my-2">{children}</ol>,
  a: ({ href, children }) => (href ? <ExternalLink url={href}>{children}</ExternalLink> : children),
};

const SKIP_WHEN_INLINE = ['p'];

export type MarkdownProps = {
  content: string;
  inline?: boolean;
};

export function Markdown({ content, inline = false }: MarkdownProps) {
  return (
    <ReactMarkdown components={COMPONENTS} disallowedElements={inline ? SKIP_WHEN_INLINE : undefined} unwrapDisallowed>
      {content}
    </ReactMarkdown>
  );
}
