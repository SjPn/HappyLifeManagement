import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
          include: {
            community: { select: { blockedAt: true, approvedAt: true } },
          },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        if (user.status === UserStatus.REJECTED) return null;

        if (user.role !== Role.PLATFORM_ADMIN && user.community?.blockedAt) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          tenancyType: user.tenancyType,
          communityId: user.communityId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? Role.RESIDENT;
        token.status = user.status ?? "PENDING";
        token.tenancyType =
          (user as { tenancyType?: string }).tenancyType ?? "OWNER";
        token.communityId =
          (user as { communityId?: string | null }).communityId ?? null;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            status: true,
            tenancyType: true,
            communityId: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.tenancyType = dbUser.tenancyType;
          token.communityId = dbUser.communityId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.tenancyType =
          (token.tenancyType as string | undefined) ?? "OWNER";
        session.user.communityId =
          (token.communityId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
