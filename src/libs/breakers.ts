import { Breaker, ScoringBreaker } from '@/schema/data';

export function isScoringBreaker(breaker?: Breaker | null): breaker is ScoringBreaker {
  return Boolean(breaker) && breaker !== Breaker.DIRECT_MATCH;
}
