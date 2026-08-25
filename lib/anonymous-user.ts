export const ANONYMOUS_USER_COOKIE = "roastbro_anonymous_uid";

function parseCookieHeader(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex === -1) return accumulator;

      const key = cookie.slice(0, separatorIndex).trim();
      const value = cookie.slice(separatorIndex + 1).trim();
      if (key) accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

export function resolveAnonymousUserId(cookieHeader?: string | null): { userId: string; isNew: boolean } {
  const cookies = parseCookieHeader(cookieHeader);
  const existingUserId = cookies[ANONYMOUS_USER_COOKIE];
  if (existingUserId && typeof existingUserId === "string" && existingUserId.trim().length > 0) {
    return { userId: existingUserId, isNew: false };
  }

  const generatedUserId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `anonymous-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return { userId: generatedUserId, isNew: true };
}
