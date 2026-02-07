import schema from "@/convex/better-auth/schema";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(components.betterAuth, {
  local: { schema },
  verbose: false,
});

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  // Use SITE_URL from env, or fallback to localhost for development
  const baseURL = process.env.SITE_URL || "http://localhost:3000";

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            overrideUserInfoOnSignIn: true,
            mapProfileToUser: (profile: {
              picture?: string | null;
              name?: string;
              email?: string;
              email_verified?: boolean;
            }) => ({
              name: profile.name ?? "",
              email: profile.email ?? "",
              emailVerified: profile.email_verified ?? false,
              ...(profile.picture != null && profile.picture !== "" && { image: profile.picture }),
            }),
          },
        }
      : undefined;

  return {
    appName: "Kanban Hub",
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    account: {
      skipStateCookieCheck: true,
    },
    emailAndPassword: {
      enabled: true,
    },
    ...(socialProviders && { socialProviders }),
    plugins: [
      convex({
        authConfig,
        jwt: {
          definePayload: ({ user }) => {
            const { id: _id, ...payload } = user;
            return payload;
          },
        },
      }),
    ],
  } satisfies BetterAuthOptions;
};

// For @better-auth/cli
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
