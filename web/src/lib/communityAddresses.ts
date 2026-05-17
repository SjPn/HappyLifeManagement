import { prisma } from "@/lib/prisma";
import { formatAddressLine } from "@/lib/household";

export type AddressOption = { id: string; label: string };

export async function listCommunityAddresses(): Promise<AddressOption[]> {
  const rows = await prisma.communityAddress.findMany({
    orderBy: [{ street: "asc" }, { houseNumber: "asc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    label: formatAddressLine(a.street, a.houseNumber),
  }));
}

export async function resolveCommunityAddress(addressId: string) {
  const id = addressId.trim();
  if (!id) return null;
  return prisma.communityAddress.findUnique({ where: { id } });
}
