import { Negotiator } from 'negotiator';
import { match } from '@formatjs/intl-localematcher';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // check if url has already `locale` in the path
  if (SUPPORTED_LOCALES.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)) {
    return;
  }

  const languages = new Negotiator({ headers: Object.fromEntries(request.headers) }).languages()
  const locale = match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);

  request.nextUrl.pathname = `/${locale}${pathname}`

  return Response.redirect(request.nextUrl);
}

export const config = {
  matcher: '/'
}
