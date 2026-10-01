export function getRankCountrySuffix(rank?: string | false, country?: string | Iterable<string> | false) {
  if (country) {
    const countryContent = typeof country === 'string' ? country : Array.from(new Set(country)).join(', ');

    if (country && rank) {
      return `, ${rank} (${countryContent})`;
    }

    return ` (${countryContent})`;
  }

  return rank ? ` (${rank})` : '';
}
