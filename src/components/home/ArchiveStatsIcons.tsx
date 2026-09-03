import type { IconBaseProps } from 'react-icons';

export function GamesIcon({ size = '1em', title, ...props }: IconBaseProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <BoardGrid />
      <WhiteStone cx={7.5} cy={7.5} />
      <BlackStone cx={16.5} cy={7.5} />
      <BlackStone cx={7.5} cy={16.5} />
      <WhiteStone cx={16.5} cy={16.5} />
    </svg>
  );
}

export function BlackWinsIcon({ size = '1em', title, ...props }: IconBaseProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <BoardGrid />
      <BlackStone cx={7.5} cy={7.5} />
      <WhiteStone cx={16.5} cy={7.5} />
      <BlackStone cx={7.5} cy={16.5} />
      <BlackStone cx={16.5} cy={16.5} />
    </svg>
  );
}

function BoardGrid() {
  return (
    <path
      d="M0.75 7.5h22.5M0.75 16.5h22.5M7.5 0.75v22.5M16.5 0.75v22.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      opacity="0.45"
    />
  );
}

function BlackStone({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <WhiteStone cx={cx} cy={cy} />
      <circle cx={cx} cy={cy} r="2.25" fill="var(--color-archive-accent-fill)" />
    </>
  );
}

function WhiteStone({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r="4" fill="currentColor" />;
}
