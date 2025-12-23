export type Role = "USER" | "ADMIN" | "MOD" | "SERVICE";

export const Permissions = {
  Marketplace: {
    CreateAsset: "marketplace:asset:create",
    ListAsset: "marketplace:asset:list",
    RequestTrade: "marketplace:trade:request",
    Admin: "marketplace:admin",
  },
} as const;

export function rolePermissions(role: Role): Set<string> {
  const base = new Set<string>([
    Permissions.Marketplace.CreateAsset,
    Permissions.Marketplace.ListAsset,
    Permissions.Marketplace.RequestTrade,
  ]);

  if (role === "ADMIN" || role === "MOD" || role === "SERVICE") {
    base.add(Permissions.Marketplace.Admin);
  }
  return base;
}