import { type RefObject, useLayoutEffect, useState } from 'react';

export function useScrollMargin(ref: RefObject<HTMLDivElement | null>, dependency: number) {
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (!ref.current) {
        return;
      }

      const next = ref.current.getBoundingClientRect().top + window.scrollY;
      setScrollMargin((current) => (current === next ? current : next));
    };

    update();
    window.addEventListener('resize', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
    };
  }, [dependency, ref]);

  return scrollMargin;
}
