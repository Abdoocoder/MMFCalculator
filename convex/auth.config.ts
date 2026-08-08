import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Convex dashboard -> Auth config -> "Clerk JWT issuer domain"
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
