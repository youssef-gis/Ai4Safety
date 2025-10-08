import { getAuth } from '@/features/auth/queries/get-auth';
import { IsOwner } from '@/features/auth/utils/is-owner';
import {prisma} from '@/lib/prisma'
import { getProjectPermissions } from '../permissions/get-project-permissions';

export const getProject = async(projectId:string ) => {
    
    const {user} = await getAuth();

    const project= await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            user :{
                select:{
                    username: true
                }
            }
        }
    });

    if(!project){
        return null;
    };

    const permissions = await getProjectPermissions({
        userId: user?.id, 
        organizationId: project.organizationId})

    return {...project, isOwner: IsOwner(user, project), permissions:{
        canDeleteProject: IsOwner(user, project) && !!permissions.canDeleteProject,
    }};
};