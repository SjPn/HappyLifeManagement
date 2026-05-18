import { prisma } from "@/lib/prisma";
import { formatAddressLine } from "@/lib/household";

export type AddressOption = { id: string; label: string };

export async function listCommunityAddresses(
  communityId: string,
): Promise<AddressOption[]> {
  const rows = await prisma.communityAddress.findMany({
    where: { communityId },
    orderBy: [{ street: "asc" }, { houseNumber: "asc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    label: formatAddressLine(a.street, a.houseNumber),
  }));
}

export async function resolveCommunityAddress(
  addressId: string,
  communityId: string,
) {
  const id = addressId.trim();
  if (!id) return null;
  return prisma.communityAddress.findFirst({
    where: { id, communityId },
  });
}
