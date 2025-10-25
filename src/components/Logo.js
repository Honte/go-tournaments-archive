const STROKE_WHEN_SAME = 1.587
const STROKE_WHEN_DIFFERENT = 3.175

export function Logo({...props}) {
  const color = props.color ?? 'black'
  const isWhite = color === 'white' || color === '#fff' || color === '#ffffff'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      color="#000"
      viewBox="0 0 66.801 135.101"
      {...props}
    >
      <path
        fill="currentColor"
        d="M33.404 107.409c1.3-18.421 6.568-32.252 9.171-39.034-5.099 3.61-13.888 3.656-18.343 0 4.548 14.798 8.21 26.868 9.172 39.034m12.465 27.693c-15.184-27.015-1.225-58.285 12.503-82.29 2.366-1.021 3.987-2.517 4.29-4.837-4.347 2.747-7.95 2.756-11.19 2.064.38 1.165 1.428 2.38 2.982 3.02-12.059 20.692-23.264 51.965-14.717 78.05H27.07c8.548-26.085-2.658-57.357-14.717-78.05 1.554-.64 2.602-1.855 2.983-3.02-3.24.692-6.844.683-11.19-2.064.303 2.32 1.923 3.816 4.29 4.838 13.727 24.004 27.686 55.275 12.502 82.289z"
      />
      <g stroke="currentColor" transform="translate(-104.016 -76.651)">
        <circle
          cx={137.42}
          cy={89.282}
          r={11.043}
          fill="white"
          strokeWidth={isWhite ? STROKE_WHEN_SAME : STROKE_WHEN_DIFFERENT}
        />
        <circle
          cx={137.42}
          cy={131.51}
          r={11.043}
          fill={isWhite ? "black" : "currentColor"}
          strokeWidth={isWhite ? STROKE_WHEN_DIFFERENT : STROKE_WHEN_SAME}
        />
        <circle
          cx={112.28}
          cy={-156.95}
          r={11.043}
          fill="white"
          strokeWidth={isWhite ? STROKE_WHEN_SAME : STROKE_WHEN_DIFFERENT}
          transform="rotate(89.365)"
        />
        <circle
          cx={111.81}
          cy={-114.62}
          r={11.043}
          fill={isWhite ? "black" : "currentColor"}
          strokeWidth={isWhite ? STROKE_WHEN_DIFFERENT : STROKE_WHEN_SAME}
          transform="rotate(89.365)"
        />
      </g>
    </svg>
  );
}
