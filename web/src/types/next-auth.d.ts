import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      status: string;
      tenancyType?: string;
    };
  }

  interface User {
    role?: string;
    status?: string;
    tenancyType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
    tenancyType?: string;
  }
}
