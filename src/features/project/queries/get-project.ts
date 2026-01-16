import { getAuth } from '@/features/auth/queries/get-auth';
import { IsOwner } from '@/features/auth/utils/is-owner';
import {prisma} from '@/lib/prisma'
import { getProjectPermissions } from '../permissions/get-project-permissions';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { toActionState } from '@/components/forms/utils/to-action-state';
import { ca } from 'date-fns/locale';

export const getProject = async(projectId:string ) => {
    
    const {user, activeOrganization} = await getAuthOrRedirect();

    if (!user || !activeOrganization) {
        return toActionState('Error', 'Not Authenticated');
    };      

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
      
        select: {
            id: true,
            name: true,
            organizationId: true, 
            user: {
                select: {
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
        organizationId: project.organizationId});
    const isOwner = IsOwner(user, project);

    return {...project, isOwner, permissions:{
        canDeleteProject: isOwner && !!permissions.canDeleteProject,
        canEditProject: isOwner && !!permissions.canEditProject
    }};
};
