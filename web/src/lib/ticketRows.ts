import type { TicketCommentRow, TicketRow } from "@/components/RequestsPanel";

export const ticketListInclude = {
  user: { select: { name: true, street: true, houseNumber: true } },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: { name: true, role: true } },
    },
  },
} as const;

type TicketWithRelations = {
  id: string;
  category: string;
  description: string;
  photoUrl: string | null;
  locationNote: string | null;
  status: string;
  statusChangedAt: Date;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: { name: string; street: string; houseNumber: string };
  comments: {
    id: string;
    body: string;
    imageUrl: string | null;
    createdAt: Date;
    author: { name: string; role: string };
  }[];
};

export function toTicketRows(tickets: TicketWithRelations[]): TicketRow[] {
  return tickets.map((tk) => ({
    id: tk.id,
    category: tk.category,
    description: tk.description,
    photoUrl: tk.photoUrl,
    locationNote: tk.locationNote,
    status: tk.status,
    statusChangedAt: tk.statusChangedAt.toISOString(),
    updatedAt: tk.updatedAt.toISOString(),
    rating: tk.rating,
    createdAt: tk.createdAt.toISOString(),
    userName: tk.user.name,
    userStreet: tk.user.street,
    userHouseNumber: tk.user.houseNumber,
    ownerId: tk.userId,
    comments: tk.comments.map(
      (c): TicketCommentRow => ({
        id: c.id,
        body: c.body,
        imageUrl: c.imageUrl,
        createdAt: c.createdAt.toISOString(),
        authorName: c.author.name,
        authorRole: c.author.role,
      }),
    ),
  }));
}
