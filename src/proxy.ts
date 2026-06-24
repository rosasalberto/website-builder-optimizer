import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 renamed the "middleware" convention to "proxy". next-intl's
// middleware factory works unchanged here.
export default createMiddleware(routing);

export const config = {
  // Run on everything EXCEPT Payload admin/api, Next internals, and files with
  // an extension. Critical: never rewrite /admin or /api or Payload breaks.
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};
