import type { StylesConfig } from 'react-select';
import type { SearchOption } from './searchOptions';

export const getSearchStyles = (hero: boolean, expanded: boolean): StylesConfig<SearchOption, false> => ({
  container: (base) => ({ ...base, width: '100%' }),
  control: (base, state) => ({
    ...base,
    minHeight: hero ? 46 : 32,
    height: hero ? 46 : 32,
    borderRadius: hero ? 8 : 6,
    backgroundColor: expanded ? 'var(--color-archive-surface)' : 'rgb(255 255 255 / 0.1)',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    borderColor: !expanded
      ? 'rgb(255 255 255 / 0.25)'
      : state.isFocused
        ? 'var(--color-archive-focus-ring)'
        : 'var(--color-archive-border)',
    boxShadow: hero ? '0 1px 2px rgb(0 0 0 / 0.05)' : 'none',
    '&:hover': { borderColor: expanded ? 'var(--color-archive-focus-ring)' : 'rgb(255 255 255 / 0.25)' },
  }),
  valueContainer: (base) => ({
    ...base,
    display: expanded ? base.display : 'none',
    minWidth: 0,
    padding: hero ? '0 12px' : '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    color: 'var(--color-archive-text)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--color-archive-text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: hero ? 44 : 30,
    marginLeft: 'auto',
  }),
  menu: (base) => ({
    ...base,
    right: 0,
    left: 'auto',
    zIndex: 50,
    minWidth: 0,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'var(--color-archive-surface)',
    border: '1px solid var(--color-archive-border)',
    borderRadius: hero ? 8 : 6,
    overflow: 'hidden',
    color: 'var(--color-archive-text)',
  }),
  option: (base, state) => ({
    ...base,
    cursor: 'pointer',
    backgroundColor: state.isFocused ? 'var(--color-archive-surface-hover)' : 'var(--color-archive-surface)',
    color: 'var(--color-archive-text)',
    '&:active': { backgroundColor: 'var(--color-archive-accent-soft)' },
  }),
  loadingMessage: (base) => ({ ...base, color: 'var(--color-archive-text-muted)' }),
  noOptionsMessage: (base) => ({ ...base, color: 'var(--color-archive-text-muted)' }),
});
