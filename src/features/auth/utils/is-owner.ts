import { User } from "@prisma/client";

type Entity={
    creatorId?: string | null;
    inspectionId?: string | null;   
    conductedByUserId?: string | null; 
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


