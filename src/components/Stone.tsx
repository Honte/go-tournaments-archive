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
        r={10}
        className={`stroke-2 ${
          color === 'black'
            ? 'fill-archive-stone-black stroke-archive-stone-stroke-black'
            : 'fill-archive-stone-white stroke-archive-stone-stroke-white'
        }`}
      />
    </svg>
  );
}
