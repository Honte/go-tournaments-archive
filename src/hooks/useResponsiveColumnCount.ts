import { useEffect, useState } from 'react';

export function useResponsiveColumnCount() {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const medium = window.matchMedia('(min-width: 768px)');
    const extraLarge = window.matchMedia('(min-width: 1280px)');

    function update() {
      setColumnCount(extraLarge.matches ? 3 : medium.matches ? 2 : 1);
    }

    update();
    medium.addEventListener('change', update);
    extraLarge.addEventListener('change', update);

    return () => {
      medium.removeEventListener('change', update);
      extraLarge.removeEventListener('change', update);
    };
  }, []);

  return columnCount;
}
