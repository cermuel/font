import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import { authSchema } from "@/db/schema";
import { sendSignInCode } from "./email";

const monthInSeconds = 60 * 60 * 24 * 30;
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const buildOnlySecret = "build-only-secret-not-used-by-a-running-application";
const googleCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    }
  : {};

export const auth = betterAuth({
  appName: "Make My Font",
  baseURL: process.env.BETTER_AUTH_URL ?? (isProductionBuild ? "http://localhost:3000" : undefined),
  secret: process.env.BETTER_AUTH_SECRET ?? (isProductionBuild ? buildOnlySecret : undefined),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    usePlural: true,
  }),
  session: {
    expiresIn: monthInSeconds,
    updateAge: 60 * 60 * 24,
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
      updateUserInfoOnLink: false,
    },
  },
  socialProviders: googleCredentials,
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      storeOTP: "encrypted",
      resendStrategy: "reuse",
      rateLimit: { window: 60, max: 3 },
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "sign-in") await sendSignInCode(email, otp);
      },
    }),
  ],
});
