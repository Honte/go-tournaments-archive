import { Button } from '@/components/ui/Button';

export function ExternalButton({ url, children, title }) {
  return (
    <a href={url} target="_blank" title={title}>
      <Button>{children}</Button>
    </a>
  );
}
