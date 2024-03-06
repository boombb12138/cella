import { and, eq, or } from 'drizzle-orm';
import { MiddlewareHandler } from 'hono';
import { db } from '../../db/db';
import { MembershipModel, membershipsTable } from '../../db/schema/memberships';
import { organizationsTable } from '../../db/schema/organizations';
import { customLogger } from '../../lib/custom-logger';
import { errorResponse } from '../../lib/error-response';
import { Env } from '../../types/common';

// organizationAuthMiddleware() is checking if the user has membership in the organization and if the user has the required role
const organizationAuthMiddleware =
  (accessibleFor?: MembershipModel['role'][]): MiddlewareHandler<Env, ':organizationIdentifier?'> =>
  async (ctx, next) => {
    const body = ctx.req.header('content-type') === 'application/json' ? await ctx.req.raw.clone().json() : undefined;
    const organizationIdentifier = (ctx.req.param('organizationIdentifier') || body?.organizationIdentifier)?.toLowerCase();
    const user = ctx.get('user');

    if (!organizationIdentifier) {
      return await next();
    }

    const [organization] = await db
      .select()
      .from(organizationsTable)
      .where(or(eq(organizationsTable.id, organizationIdentifier), eq(organizationsTable.slug, organizationIdentifier)));

    if (!organization) {
      return errorResponse(ctx, 404, 'organization_not_found', 'warn', true, { organization: organizationIdentifier });
    }

    const [membership] = await db
      .select()
      .from(membershipsTable)
      .where(and(eq(membershipsTable.userId, user.id), eq(membershipsTable.organizationId, organization.id)));

    if ((!membership || (accessibleFor && !accessibleFor.includes(membership.role))) && user.role !== 'ADMIN') {
      return errorResponse(ctx, 403, 'forbidden', 'warn', true, { user: user.id, organization: organization.id });
    }

    ctx.set('organization', organization);

    customLogger('User authenticated in organization', { user: user.id, organization: organization.id });

    await next();
  };

export default organizationAuthMiddleware;
