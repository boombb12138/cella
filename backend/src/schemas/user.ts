import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { usersTable } from '../db/schema';
import { idSchema, passwordSchema, slugSchema } from './common';

export const apiUserSchema = createSelectSchema(usersTable, {
  email: z.string().email(),
  clearSessionsAt: z.string().nullable(),
  acceptInvitationAt: z.string().nullable(),
  invitationAt: z.string().nullable(),
  lastEmailAt: z.string().nullable(),
  lastPostAt: z.string().nullable(),
  lastSeenAt: z.string().nullable(),
  lastVisitAt: z.string().nullable(),
  lastSignInAt: z.string().nullable(),
  createdAt: z.string(),
  modifiedAt: z.string().nullable(),
}).omit({
  hashedPassword: true,
});

export const apiUserWithMembershipCountSchema = apiUserSchema.setKey('membershipCount', z.number());

export type ApiUserWithMembershipCount = z.infer<typeof apiUserWithMembershipCountSchema>;

export type ApiUser = z.infer<typeof apiUserSchema>;

export const checkEmailJsonSchema = z.object({
  email: apiUserSchema.shape.email,
});

export const emailExistsJsonSchema = z.object({
  exists: z.boolean(),
});

export const signInJsonSchema = z.object({
  email: apiUserSchema.shape.email,
  password: passwordSchema,
});

export const resetPasswordJsonSchema = z.object({
  password: passwordSchema,
});

export const signUpJsonSchema = z.object({
  email: apiUserSchema.shape.email,
  password: passwordSchema,
});

export const updateUserParamSchema = z.object({
  userId: idSchema,
});

export const getUserParamSchema = z.object({
  userId: idSchema.or(slugSchema),
});

export const updateUserJsonSchema = createInsertSchema(usersTable, {
  email: z.string().email(),
  firstName: z.string().refine((s) => /^[a-z ,.'-]+$/i.test(s), "First name may only contain letters, spaces, and the following characters: ,.'-"),
  lastName: z.string().refine((s) => /^[a-z ,.'-]+$/i.test(s), "Last name may only contain letters, spaces, and the following characters: ,.'-"),
  slug: z
    .string()
    .refine(
      (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/i.test(s),
      'Slug may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
    ),
})
  .pick({
    email: true,
    bannerUrl: true,
    bio: true,
    firstName: true,
    lastName: true,
    language: true,
    newsletter: true,
    thumbnailUrl: true,
    slug: true,
  })
  .partial();
