'use client';

import type { Tournament } from '@/schema/data';
import { throttle } from 'lodash-es';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { YearsNavigation, YearsNavigationHandle } from '@/components/navigation/YearsNavigation';

const CAPTURE: AddEventListenerOptions = { capture: true };
const CAPTURE_AND_NOT_PASSIVE: AddEventListenerOptions = { capture: true, passive: false };
const THRESHOLD = 10;
const THROTTLE = 200;
const DELAY = 500;

export type TopNavigationProps = {
  tournaments: Tournament[];
  locale: string;
  current: number;
};

export function TopNavigation({ tournaments, locale, current }: TopNavigationProps) {
  const router = useRouter();
  const elRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<YearsNavigationHandle | null>(null);
  const delayRef = useRef<number | null>(null);
  const years = tournaments.map((t) => t.year);

  const clearNavigate = useCallback(() => {
    if (delayRef.current !== null) {
      clearTimeout(delayRef.current);
    }
  }, []);

  const scheduleNavigate = useCallback(() => {
    clearNavigate();
    delayRef.current = window.setTimeout(
      () => navRef.current && router.push(`/${locale}/${navRef.current.current()}`),
      DELAY
    );
  }, [clearNavigate, locale, router]);

  const onWheel = useMemo(
    () =>
      throttle((event: WheelEvent) => {
        if (navRef.current) {
          navRef.current.move(event.deltaX);
          scheduleNavigate();
        }
      }, THROTTLE),
    [scheduleNavigate]
  );

  const onMouseDown = useMemo(
    () => (startEvent: MouseEvent) => {
      let lastEvent = startEvent;
      let changed = !!delayRef.current;

      clearNavigate();
      window.addEventListener('mousemove', onMouseMove, CAPTURE);
      window.addEventListener('mouseup', onMouseUp, CAPTURE);

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove, CAPTURE);
        window.removeEventListener('mouseup', onMouseUp, CAPTURE);

        if (changed) {
          scheduleNavigate();
        }
      }

      function onMouseMove(currentEvent: MouseEvent) {
        const distance = currentEvent.clientX - lastEvent.clientX;

        if (navRef.current && Math.abs(distance) >= THRESHOLD) {
          navRef.current.move(-distance);
          lastEvent = currentEvent;
          changed = true;
        }

        currentEvent.preventDefault();
      }
    },
    [clearNavigate, scheduleNavigate]
  );

  const onTouchStart = useMemo(
    () => (startEvent: TouchEvent) => {
      let lastEvent = startEvent;
      let changed = !!delayRef.current;

      clearNavigate();
      document.addEventListener('touchmove', onTouchMove, CAPTURE_AND_NOT_PASSIVE);
      document.addEventListener('touchend', onTouchEnd, CAPTURE_AND_NOT_PASSIVE);

      function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove, CAPTURE_AND_NOT_PASSIVE);
        document.removeEventListener('touchend', onTouchEnd, CAPTURE_AND_NOT_PASSIVE);

        if (changed) {
          scheduleNavigate();
        }
      }

      function onTouchMove(currentEvent: TouchEvent) {
        const distance = currentEvent.targetTouches?.[0]?.clientX - lastEvent.targetTouches?.[0]?.clientX;

        if (navRef.current && Math.abs(distance) >= THRESHOLD) {
          navRef.current.move(-distance);
          lastEvent = currentEvent;
          changed = true;
        }

        currentEvent.preventDefault();
      }
    },
    [clearNavigate, scheduleNavigate]
  );

  useEffect(() => {
    const node = elRef.current;

    node.addEventListener('wheel', onWheel);
    node.addEventListener('mousedown', onMouseDown, CAPTURE);
    node.addEventListener('touchstart', onTouchStart, CAPTURE_AND_NOT_PASSIVE);

    return () => {
      clearNavigate();
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('mousedown', onMouseDown, CAPTURE);
      node.removeEventListener('touchstart', onTouchStart, CAPTURE_AND_NOT_PASSIVE);
    };
  }, [onWheel, onMouseDown, onTouchStart, clearNavigate]);

  return (
    <div ref={elRef} className="cursor-grab">
      <YearsNavigation years={years} current={current} locale={locale} ref={navRef} />
    </div>
  );
}
