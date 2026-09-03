import type { ThemeConfig } from 'react-select';

export const archiveSelectTheme: ThemeConfig = (base) => ({
  ...base,
  borderRadius: 4,
  colors: {
    ...base.colors,
    primary: 'var(--color-archive-accent)',
    primary75: 'var(--color-archive-accent-hover)',
    primary50: 'var(--color-archive-accent-soft)',
    primary25: 'var(--color-archive-surface-hover)',
    // Removing a selected filter is a neutral control action.
    danger: 'var(--color-archive-text)',
    dangerLight: 'var(--color-archive-control-hover)',
    neutral0: 'var(--color-archive-surface)',
    neutral5: 'var(--color-archive-page)',
    neutral10: 'var(--color-archive-surface-muted)',
    neutral20: 'var(--color-archive-border)',
    neutral30: 'var(--color-archive-text-muted)',
    neutral40: 'var(--color-archive-text-muted)',
    neutral50: 'var(--color-archive-text-muted)',
    neutral60: 'var(--color-archive-text)',
    neutral70: 'var(--color-archive-text)',
    neutral80: 'var(--color-archive-text)',
    neutral90: 'var(--color-archive-text)',
  },
});
