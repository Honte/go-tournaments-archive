export function jsxJoin(array, separator) {
  const output = [array[0]];

  for (let i = 1; i < array.length; i++) {
    output.push(separator, array[i]);
  }

  return output;
}
