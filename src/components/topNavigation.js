'use client';

import { YearsNavigation } from '@/components/yearsNavigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { throttle } from 'lodash-es';
import { useRouter } from 'next/navigation';

const CAPTURE = {capture: true};
const THRESHOLD = 10;
const THROTTLE = 200;
const DELAY = 500;

export function TopNavigation({tournaments, locale, current}) {
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

  const onWheel = useMemo(() => throttle((event) => {
    if (navRef.current) {
      navRef.current.move(event.deltaX);
      scheduleNavigate();
    }
  }, THROTTLE), [navRef, scheduleNavigate]);

  const onMouseDown = useMemo(() => (startEvent) => {
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

      if (Math.abs(distance) >= THRESHOLD) {
        navRef.current.move(-distance);
        lastEvent = currentEvent;
        changed = true;
      }

      currentEvent.preventDefault();
    }
  }, [clearNavigate, scheduleNavigate]);

  const onTouchStart = useMemo(() => (startEvent) => {
    let lastEvent = startEvent;
    let changed = delayRef.current;

    clearNavigate();
    window.addEventListener('touchmove', onTouchMove, CAPTURE);
    window.addEventListener('touchend', onTouchEnd, CAPTURE);

    function onTouchEnd() {
      window.removeEventListener('touchmove', onTouchMove, CAPTURE);
      window.removeEventListener('touchend', onTouchEnd, CAPTURE);

      if (changed) {
        scheduleNavigate();
      }
    }

    function onTouchMove(currentEvent) {
      console.log(currentEvent);
      const distance = currentEvent.targetTouches?.[0]?.clientX - lastEvent.targetTouches?.[0]?.clientX;

      if (Math.abs(distance) >= THRESHOLD) {
        navRef.current.move(-distance);
        lastEvent = currentEvent;
        changed = true;
      }

      currentEvent.preventDefault();
    }
  }, [clearNavigate, scheduleNavigate]);

  useEffect(() => {
    elRef.current.addEventListener('wheel', onWheel);
    elRef.current.addEventListener('mousedown', onMouseDown, CAPTURE);
    elRef.current.addEventListener('touchstart', onTouchStart, CAPTURE);

    return () => {
      clearNavigate()
      if (elRef.current) {
        elRef.current.removeEventListener('wheel', onWheel);
        elRef.current.removeEventListener('mousedown', onMouseDown, CAPTURE);
        elRef.current.removeEventListener('touchstart', onTouchStart, CAPTURE);
      }
    };
  }, [elRef, delayRef, onWheel, onMouseDown, onTouchStart, clearNavigate]);

  return (
    <div
      className="container flex mx-auto items-center content-center overflow-hidden my-2 faded-left before:w-1/5 faded-right after:w-1/5"
      ref={elRef}>
      <YearsNavigation years={years} current={current} locale={locale} ref={navRef}/>
    </div>
  );
}
