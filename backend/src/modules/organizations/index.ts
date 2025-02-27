import { type SQL, and, count, eq, ilike, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import { membershipsTable } from '../../db/schema/memberships';
import { organizationsTable } from '../../db/schema/organizations';

import { config } from 'config';
import { counts } from '../../lib/counts';
import { type ErrorType, createError, errorResponse } from '../../lib/errors';
import { getOrderColumn } from '../../lib/order-column';
import { sendSSEToUsers } from '../../lib/sse';
import { logEvent } from '../../middlewares/logger/log-event';
import { CustomHono } from '../../types/common';
import { checkSlugAvailable } from '../general/helpers/check-slug';
import { insertMembership } from '../memberships/helpers/insert-membership';
import { toMembershipInfo } from '../memberships/helpers/to-membership-info';
import organizationRoutesConfig from './routes';

const app = new CustomHono();

// Organization endpoints
const organizationsRoutes = app
  /*
   * Create organization
   */
  .openapi(organizationRoutesConfig.createOrganization, async (ctx) => {
    const { name, slug } = ctx.req.valid('json');
    const user = ctx.get('user');

    const slugAvailable = await checkSlugAvailable(slug);

    if (!slugAvailable) return errorResponse(ctx, 409, 'slug_exists', 'warn', 'organization', { slug });

    const [createdOrganization] = await db
      .insert(organizationsTable)
      .values({
        name,
        shortName: name,
        slug,
        languages: [config.defaultLanguage],
        defaultLanguage: config.defaultLanguage,
        createdBy: user.id,
      })
      .returning();

    logEvent('Organization created', { organization: createdOrganization.id });

    // Insert membership
    const [createdMembership] = await insertMembership({ user, role: 'admin', entity: createdOrganization });

    return ctx.json(
      {
        success: true,
        data: {
          ...createdOrganization,
          membership: toMembershipInfo(createdMembership),
          counts: {
            memberships: {
              admins: 1,
              members: 1,
              total: 1,
            },
          },
        },
      },
      200,
    );
  })
  /*
   * Get list of organizations
   */
  .openapi(organizationRoutesConfig.getOrganizations, async (ctx) => {
    const { q, sort, order, offset, limit } = ctx.req.valid('query');
    const user = ctx.get('user');

    const filter: SQL | undefined = q ? ilike(organizationsTable.name, `%${q}%`) : undefined;

    const organizationsQuery = db.select().from(organizationsTable).where(filter);

    const [{ total }] = await db.select({ total: count() }).from(organizationsQuery.as('organizations'));

    const memberships = db
      .select()
      .from(membershipsTable)
      .where(and(eq(membershipsTable.userId, user.id), eq(membershipsTable.type, 'organization')))
      .as('memberships');

    const orderColumn = getOrderColumn(
      {
        id: organizationsTable.id,
        name: organizationsTable.name,
        createdAt: organizationsTable.createdAt,
        userRole: memberships.role,
      },
      sort,
      organizationsTable.id,
      order,
    );

    const countsQuery = await counts('organization');

    const organizations = await db
      .select({
        organization: organizationsTable,
        membership: membershipsTable,
        admins: countsQuery.admins,
        members: countsQuery.members,
      })
      .from(organizationsQuery.as('organizations'))
      .leftJoin(memberships, eq(organizationsTable.id, memberships.organizationId))
      .leftJoin(countsQuery, eq(organizationsTable.id, countsQuery.id))
      .orderBy(orderColumn)
      .limit(Number(limit))
      .offset(Number(offset));

    return ctx.json(
      {
        success: true,
        data: {
          items: organizations.map(({ organization, membership, admins, members }) => ({
            ...organization,
            membership: toMembershipInfo(membership),
            counts: {
              memberships: {
                admins,
                members,
                total: members,
              },
            },
          })),
          total,
        },
      },
      200,
    );
  })
  /*
   * Update an organization by id or slug
   */
  .openapi(organizationRoutesConfig.updateOrganization, async (ctx) => {
    const user = ctx.get('user');
    const organization = ctx.get('organization');

    const {
      name,
      slug,
      shortName,
      country,
      timezone,
      defaultLanguage,
      languages,
      notificationEmail,
      emailDomains,
      color,
      thumbnailUrl,
      logoUrl,
      bannerUrl,
      websiteUrl,
      welcomeText,
      authStrategies,
      chatSupport,
    } = ctx.req.valid('json');

    if (slug && slug !== organization.slug) {
      const slugAvailable = await checkSlugAvailable(slug);

      if (!slugAvailable) {
        return errorResponse(ctx, 409, 'slug_exists', 'warn', 'organization', { slug });
      }
    }

    const [updatedOrganization] = await db
      .update(organizationsTable)
      .set({
        name,
        slug,
        shortName,
        country,
        timezone,
        defaultLanguage,
        languages,
        notificationEmail,
        emailDomains,
        color,
        thumbnailUrl,
        logoUrl,
        bannerUrl,
        websiteUrl,
        welcomeText,
        authStrategies,
        chatSupport,
        modifiedAt: new Date(),
        modifiedBy: user.id,
      })
      .where(eq(organizationsTable.id, organization.id))
      .returning();

    const memberships = await db
      .select()
      .from(membershipsTable)
      .where(and(eq(membershipsTable.type, 'organization'), eq(membershipsTable.organizationId, organization.id)));

    if (memberships.length > 0) {
      memberships.map((member) =>
        sendSSEToUsers([member.id], 'update_entity', {
          ...updatedOrganization,
          membership: toMembershipInfo(memberships.find((m) => m.id === member.id)),
        }),
      );
    }

    logEvent('Organization updated', { organization: updatedOrganization.id });

    return ctx.json(
      {
        success: true,
        data: {
          ...updatedOrganization,
          membership: toMembershipInfo(memberships.find((m) => m.id === user.id)),
          counts: await counts('organization', organization.id),
        },
      },
      200,
    );
  })
  /*
   * Get organization by id or slug
   */
  .openapi(organizationRoutesConfig.getOrganization, async (ctx) => {
    const user = ctx.get('user');
    const organization = ctx.get('organization');

    const [membership] = await db
      .select()
      .from(membershipsTable)
      .where(
        and(eq(membershipsTable.userId, user.id), eq(membershipsTable.organizationId, organization.id), eq(membershipsTable.type, 'organization')),
      );

    return ctx.json(
      {
        success: true,
        data: {
          ...organization,
          membership: toMembershipInfo(membership),
          counts: await counts('organization', organization.id),
        },
      },
      200,
    );
  })

  /*
   * Delete organizations by ids
   */
  .openapi(organizationRoutesConfig.deleteOrganizations, async (ctx) => {
    // Extract allowed and disallowed ids
    const allowedIds = ctx.get('allowedIds');
    const disallowedIds = ctx.get('disallowedIds');

    // Map errors of workspaces user is not allowed to delete
    const errors: ErrorType[] = disallowedIds.map((id) => createError(ctx, 404, 'not_found', 'warn', 'organization', { organization: id }));

    // Get members
    const organizationsMembers = await db
      .select({ id: membershipsTable.userId })
      .from(membershipsTable)
      .where(and(eq(membershipsTable.type, 'organization'), inArray(membershipsTable.organizationId, allowedIds)));

    // Delete the organizations
    await db.delete(organizationsTable).where(inArray(organizationsTable.id, allowedIds));

    // Send SSE events for the organizations that were deleted
    for (const id of allowedIds) {
      // Send the event to the user if they are a member of the organization
      if (organizationsMembers.length > 0) {
        const membersId = organizationsMembers.map((member) => member.id).filter(Boolean) as string[];
        sendSSEToUsers(membersId, 'remove_entity', { id, entity: 'organization' });
      }

      logEvent('Organization deleted', { organization: id });
    }

    return ctx.json({ success: true, errors: errors }, 200);
  });

export default organizationsRoutes;
