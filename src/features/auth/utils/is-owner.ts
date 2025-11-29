import { User } from "@prisma/client";

type Entity={
    creatorId?: string | null; // <-- optional now
    inspectionId?: string | null;   // If inspection has project.ownerId
    conductedByUserId?: string | null; // If inspection has conductedByUserId
}

export const IsOwner = (
    authUser: User | null | undefined,
    entity: Entity | null | undefined ) => {

    if (!authUser || !entity){
        return false;
    }

    if(!entity.creatorId){
        return false;
    }
    if(authUser.id !== entity.creatorId){
        return false;
    } else {
        return true;
    }
}


