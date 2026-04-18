'use client';

import { throttle } from 'lodash-es';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { between } from '@/libs/math';
import { YearsNavigation } from '@/components/navigation/YearsNavigation';

const CAPTURE: AddEventListenerOptions = { capture: true };
const CAPTURE_AND_NOT_PASSIVE: AddEventListenerOptions = { capture: true, passive: false };
const THRESHOLD = 10;
const THROTTLE = 200;
const DELAY = 500;

export type TopNavigationProps = {
  years: number[];
  locale: string;
  current: number;
};

export function TopNavigation({ years, locale, current }: TopNavigationProps) {
  const router = useRouter();
  const elRef = useRef<HTMLDivElement | null>(null);
  const delayRef = useRef<number | null>(null);
  const [index, setIndex] = useState(years.indexOf(current));
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const next = years[index];

    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }

    if (shouldRedirect) {
      delayRef.current = window.setTimeout(() => {
        if (next !== current) {
          router.push(`/${locale}/${next}`);
        }
        setShouldRedirect(false);
      }, DELAY);
    }

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
      }
    };
  }, [current, index, locale, router, shouldRedirect, years]);

  const onWheel = useMemo(
    () =>
      throttle((event: WheelEvent) => {
        setIndex((index) => between(0, index + Math.sign(event.deltaX), years.length - 1));
        setShouldRedirect(true);
      }, THROTTLE),
    [years.length]
  );

  const onMouseDown = useMemo(
    () => (startEvent: MouseEvent) => {
      let lastEvent = startEvent;

      window.addEventListener('mousemove', onMouseMove, CAPTURE);
      window.addEventListener('mouseup', onMouseUp, CAPTURE);

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove, CAPTURE);
        window.removeEventListener('mouseup', onMouseUp, CAPTURE);
        setShouldRedirect(true);
      }

      function onMouseMove(currentEvent: MouseEvent) {
        const distance = currentEvent.clientX - lastEvent.clientX;

        if (Math.abs(distance) >= THRESHOLD) {
          setIndex((index) => between(0, index - Math.sign(distance), years.length - 1));
          lastEvent = currentEvent;
        }

        currentEvent.preventDefault();
      }
    },
    [years.length]
  );

  const onTouchStart = useMemo(
    () => (startEvent: TouchEvent) => {
      let lastEvent = startEvent;

      document.addEventListener('touchmove', onTouchMove, CAPTURE_AND_NOT_PASSIVE);
      document.addEventListener('touchend', onTouchEnd, CAPTURE_AND_NOT_PASSIVE);

      function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove, CAPTURE_AND_NOT_PASSIVE);
        document.removeEventListener('touchend', onTouchEnd, CAPTURE_AND_NOT_PASSIVE);
        setShouldRedirect(true);
      }

      function onTouchMove(currentEvent: TouchEvent) {
        const distance = currentEvent.targetTouches?.[0]?.clientX - lastEvent.targetTouches?.[0]?.clientX;

        if (Math.abs(distance) >= THRESHOLD) {
          setIndex((index) => between(0, index - Math.sign(distance), years.length - 1));
          lastEvent = currentEvent;
        }

        currentEvent.preventDefault();
      }
    },
    [years.length]
  );

  useEffect(() => {
    const node = elRef.current;

    if (!node) {
      return;
    }

    node.addEventListener('wheel', onWheel);
    node.addEventListener('mousedown', onMouseDown, CAPTURE);
    node.addEventListener('touchstart', onTouchStart, CAPTURE_AND_NOT_PASSIVE);

    return () => {
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('mousedown', onMouseDown, CAPTURE);
      node.removeEventListener('touchstart', onTouchStart, CAPTURE_AND_NOT_PASSIVE);
    };
  }, [onWheel, onMouseDown, onTouchStart]);

  return (
    <div ref={elRef} className="cursor-grab">
      <YearsNavigation years={years} current={years[index]} locale={locale} />
    </div>
  );
}
