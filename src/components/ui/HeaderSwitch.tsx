'use client';

import { clsx } from 'clsx';
import { type MouseEvent as ReactMouseEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Action } from '@/components/ui/Action';

export type HeaderSwitchOption = {
  value: string;
  label: string;
  content: ReactNode;
  href?: string;
  onSelect?: () => void;
};

type HeaderSwitchProps = {
  label: string;
  current?: string;
  options: HeaderSwitchOption[];
};

type MenuOptionProps = {
  open: boolean;
  option: HeaderSwitchOption;
  onSelect: (option: HeaderSwitchOption) => void;
};

export function HeaderSwitch({ label, current, options }: HeaderSwitchProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const wasOpenBeforePointerDownRef = useRef(false);

  const currentOption = options.find((option) => option.value === current);
  const menuOptions = options.filter((option) => option.value !== current);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    const listenerOptions = { signal: controller.signal };

    document.addEventListener(
      'pointerdown',
      (event) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      },
      listenerOptions
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      },
      listenerOptions
    );

    return () => controller.abort();
  }, [open]);

  const selectOption = (option: HeaderSwitchOption) => {
    option.onSelect?.();
    setOpen(false);
  };

  const handleCurrentClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const shouldSelect = event.detail === 0 ? open : wasOpenBeforePointerDownRef.current;
    wasOpenBeforePointerDownRef.current = false;

    if (shouldSelect && currentOption) {
      selectOption(currentOption);
    } else {
      setOpen(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex size-8 shrink-0 items-center justify-center"
      role="group"
      aria-label={label}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setOpen(false)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}
    >
      <div
        className={clsx(
          'absolute left-1/2 z-50 -translate-x-1/2 overflow-hidden border border-white/25 bg-archive-shell shadow-lg transition-[top,width] duration-150 ease-out',
          open ? '-top-1 w-10 rounded-md' : 'top-0 size-8 rounded-md'
        )}
      >
        <button
          type="button"
          aria-label={`${label}: ${currentOption?.label ?? '-'}`}
          aria-expanded={open}
          aria-controls={menuId}
          title={currentOption?.label}
          className={clsx(
            'group flex w-full cursor-pointer items-center justify-center border-0 text-xs font-bold text-archive-shell-text transition-[height,background-color] duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-archive-shell-text',
            open ? 'h-9.5 bg-archive-shell' : 'h-7.5 bg-white/10'
          )}
          onFocus={() => setOpen(true)}
          onPointerDown={() => {
            wasOpenBeforePointerDownRef.current = open;
          }}
          onClick={handleCurrentClick}
        >
          <span
            className={clsx(
              'flex items-center justify-center rounded-sm transition-colors duration-150 ease-out',
              open ? 'size-8' : 'size-6',
              open && 'group-hover:bg-white/10 group-focus-visible:bg-white/10'
            )}
          >
            {currentOption?.content}
          </span>
        </button>
        <div
          id={menuId}
          aria-hidden={!open}
          className={clsx(
            'grid transition-[grid-template-rows] duration-150 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="flex min-h-0 flex-col overflow-hidden">
            {menuOptions.map((option) => (
              <MenuOption key={option.value} open={open} option={option} onSelect={selectOption} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuOption({ open, option, onSelect }: MenuOptionProps) {
  return (
    <Action
      href={option.href}
      aria-label={option.label}
      title={option.label}
      tabIndex={open ? 0 : -1}
      className="group flex h-10 w-full cursor-pointer items-center justify-center text-xs font-semibold text-archive-shell-text transition-colors duration-150 ease-out hover:text-white focus-visible:text-white focus-visible:outline-none"
      onClick={() => onSelect(option)}
    >
      <span className="flex size-8 items-center justify-center rounded-sm transition-colors duration-150 ease-out group-hover:bg-white/10 group-focus-visible:bg-white/10">
        {option.content}
      </span>
    </Action>
  );
}
