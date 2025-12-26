import { Prisma } from "@prisma/client"

// export type TicketWithMetadata = Prisma.DetectionGetPayload<{
//         include: { user: {select:{username: true}} }
//     }> & { isOwner: boolean , permissions : { canDeleteTicket: boolean} }  