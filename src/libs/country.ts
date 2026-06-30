export function isFakeCountry(code: string) {
  switch (code.toUpperCase()) {
    case 'XX': // Unknown
    case 'XN': // None
    case 'XO': // Online
      return true;
    default:
      return false;
  }
}
