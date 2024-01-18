import { Button } from '@/components/button';

export function ExternalButton({ url, children, title }) {
  return (
    <a href={url} target="_blank" title={title}><Button>{children}</Button></a>
  )
}
