'use client';

import { YearsNavigation } from '@/components/navigation/YearsNavigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { throttle } from 'lodash-es';
import { useRouter } from 'next/navigation';

const CAPTURE = { capture: true };
const CAPTURE_AND_NOT_PASSIVE = { capture: true, passive: false };
const THRESHOLD = 10;
const THROTTLE = 200;
const DELAY = 500;

export function TopNavigation({ tournaments, locale, current }) {
  const router = useRouter();
  const elRef = useRef(null);
  const navRef = useRef(null);
  const delayRef = useRef(null);
  const years = tournaments.map((t) => t.year);

  const clearNavigate = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
  }, [delayRef]);

  const scheduleNavigate = useCallback(() => {
    clearNavigate();
    delayRef.current = setTimeout(() => navRef.current && router.push(`/${locale}/${navRef.current.current()}`), DELAY);
  }, [clearNavigate, locale, router]);

  const onWheel = useMemo(
    () =>
      throttle((event) => {
        if (navRef.current) {
          navRef.current.move(event.deltaX);
          scheduleNavigate();
        }
      }, THROTTLE),
    [navRef, scheduleNavigate]
  );

  const onMouseDown = useMemo(
    () => (startEvent) => {
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

      function onMouseMove(currentEvent) {
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
    () => (startEvent) => {
      let lastEvent = startEvent;
      let changed = delayRef.current;

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

      function onTouchMove(currentEvent) {
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
  }, [elRef, delayRef, onWheel, onMouseDown, onTouchStart, clearNavigate]);

  return (
    <div ref={elRef} className="cursor-grab">
      <YearsNavigation years={years} current={current} locale={locale} ref={navRef} />
    </div>
  );
}
