import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pages (incl. /login, /register, etc.) so next-intl can redirect
  // to /uk|/ru|/en. Exclude Next internals and API routes.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
