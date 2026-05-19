import type { App } from "firebase-admin/app";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

let firebaseApp: App | null | undefined;

function getFirebaseApp(): App | null {
  if (firebaseApp !== undefined) return firebaseApp;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    firebaseApp = null;
    return null;
  }

  try {
    const serviceAccount = JSON.parse(json) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    firebaseApp =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
      });
    return firebaseApp;
  } catch (e) {
    console.error("[push] Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
    firebaseApp = null;
    return null;
  }
}

export function isPushConfigured(): boolean {
  return getFirebaseApp() !== null;
}

export type PushPayload = {
  title: string;
  body: string;
  /** Path only, e.g. /uk/requests — opened when user taps notification. */
  path?: string;
};

export async function sendPushToTokens(
  tokens: string[],
  payload: PushPayload,
): Promise<void> {
  const app = getFirebaseApp();
  if (!app || tokens.length === 0) return;

  const message: MulticastMessage = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.path ? { path: payload.path } : undefined,
    android: { priority: "high" },
  };

  const messaging = getMessaging(app);
  const batch = await messaging.sendEachForMulticast(message);

  const stale: string[] = [];
  batch.responses.forEach((res, i) => {
    if (!res.success) {
      const code = res.error?.code;
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        stale.push(tokens[i]!);
      }
    }
  });

  if (stale.length > 0) {
    await prisma.devicePushToken.deleteMany({
      where: { token: { in: stale } },
    });
  }
}
