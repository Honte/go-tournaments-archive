type StoneProps = {
  color: 'black' | 'white';
  className?: string;
};

export function Stone({ color, ...props }: StoneProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <circle
        cx={12}
        cy={12}
        r={9}
        className={`stroke-2 stroke-event-dark ${color === 'black' ? 'fill-event-dark' : 'fill-event-light'}`}
      />
    </svg>
  );
}
