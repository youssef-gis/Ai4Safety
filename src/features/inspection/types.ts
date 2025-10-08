import { Prisma } from "@prisma/client";

export type InspectionWithMetadata = Prisma.InspectionGetPayload<{
  include: {
    conductedByUser: {
      select: { username: true };
    };

    supplements: true;
  };
}> & { isOwner: boolean };