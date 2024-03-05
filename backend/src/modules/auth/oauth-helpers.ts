import { and, eq } from 'drizzle-orm';
import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { oauthAccountsTable } from '../../db/schema/oauth-accounts';
import { setCookie } from '../../lib/cookies';

import { config } from 'config';
import { db } from '../../db/db';
import { customLogger } from '../../lib/custom-logger';

type ProviderId = 'GITHUB' | 'MICROSOFT' | 'GOOGLE';

// Create a session before redirecting to the oauth provider
export const createSession = (ctx: Context, provider: string, state: string, codeVerifier?: string, redirect?: string) => {
  setCookie(ctx, 'oauth_state', state);

  if (codeVerifier) setCookie(ctx, 'oauth_code_verifier', codeVerifier);
  if (redirect) setCookie(ctx, 'oauth_redirect', redirect);

  customLogger('User redirected', { strategy: provider });
};

// Get the redirect URL from the cookie or use default
export const getRedirectUrl = (ctx: Context): string => {
  const redirectCookie = getCookie(ctx, 'oauth_redirect');
  let redirectUrl = config.frontendUrl + config.defaultRedirectPath;
  if (redirectCookie) redirectUrl = config.frontendUrl + decodeURIComponent(redirectCookie);

  return redirectUrl;
};

// Insert oauth account into db
export const insertOauthAccount = async (userId: string, providerId: ProviderId, providerUserId: string) => {
  db.insert(oauthAccountsTable).values({ providerId, providerUserId, userId });
};

// Find oauth account in db
export const findOauthAccount = async (providerId: ProviderId, providerUserId: string) => {
  return db
    .select()
    .from(oauthAccountsTable)
    .where(and(eq(oauthAccountsTable.providerId, providerId), eq(oauthAccountsTable.providerUserId, providerUserId)));
};
