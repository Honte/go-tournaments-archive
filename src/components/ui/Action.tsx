import type { ComponentProps } from 'react';
import { Link, type LinkProps } from '@/components/navigation/Link';

export type ActionProps = ComponentProps<'button'> | LinkProps;

export function Action(props: ActionProps) {
  return isLinkProps(props) ? <Link {...props} /> : <button type="button" {...props} />;
}

function isLinkProps(props: ActionProps): props is LinkProps {
  return Boolean('href' in props && props.href);
}
