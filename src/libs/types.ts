export type KeysMatching<T, V> = {
  [K in keyof T]-?: Extract<T[K], V> extends never ? never : K;
}[keyof T];
