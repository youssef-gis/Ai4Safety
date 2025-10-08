import { Prisma } from "@prisma/client"

export type ProjectWithMetadata = Prisma.ProjectGetPayload<{
        include: { user: {select:{username: true}} }
    }> & { isOwner: boolean , permissions : { canDeleteProject: boolean} }  