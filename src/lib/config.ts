// lib/config.ts
export const config = {
  authAppUrl: process.env.NEXT_PUBLIC_AUTH_APP_URL ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
};

if (!config.authAppUrl || !config.appUrl) {
  throw new Error(
    "Missing public env variables: NEXT_PUBLIC_AUTH_APP_URL or NEXT_PUBLIC_APP_URL",
  );
}
