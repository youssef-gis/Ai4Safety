import {prisma} from '@/lib/prisma'

import { ParsedSearchParams } from '../search-params';
import { getAuth } from '@/features/auth/queries/get-auth';
import { IsOwner } from '@/features/auth/utils/is-owner';
import { getActiveOrganization } from '@/features/organization/queries/get-active-organization';
import { getOrganizationsByUserId } from '@/features/organization/queries/get-organizations-by-user';
import { PAGE_SIZES } from '@/components/pagination/constants';



export const getTickets = async (userId: string | undefined,
    byOrganization:boolean,
    searchParams:ParsedSearchParams)  => {
     const {user} = await getAuth();

    const activeOrganization = await getActiveOrganization()
    
    const params = await (searchParams);

    //console.log("params.size:", params.size, "allowed:", PAGE_SIZES);

    if (!PAGE_SIZES.includes(params.size)) {
    throw new Error("Invalid page size");
    }
   
    const where = {
            userId,
                title:{
                    contains: params.search,
                    mode:'insensitive' as const,
            },
            ...(byOrganization && activeOrganization
                ? {
                    organizationId: activeOrganization.id,
                }:{}
            ),
          
        };
    const take =params.size;
    const skip = params.page * params.size;
 

    // const [tickets, count]= await prisma.$transaction([  
    //     prisma.ticket.findMany({
    //                 where,
    //                 skip,
    //                 take,
    //                 orderBy:{
    //                 [params.sortKey]: params.sortValue,
    //                 },
    //                 include: {
    //                     user: {
    //                         select:{ 
    //                             username:true
    //                         },
                        
    //                     }

    //                 }
    //             }),
    //     prisma.ticket.count({
    //     where
    //     }),
    // ]); 

    const organizationsByUser = await getOrganizationsByUserId();

    return{
        // list: tickets.map((ticket)=>{

        //     const organization = organizationsByUser.find(
        //         (org)=>org.id === ticket.organizationId
        //     );

        //     return{
        //     ...ticket,
        //     isOwner: IsOwner(user, ticket),
        //     permissions:{
        //         canDeleteTicket:IsOwner(user, ticket) &&
        //                         !!organization?.membershipByUser.canDeleteTicket,
        //     },
        
        //     }       
        // }),
        // metadata: {
        //     count,
        //     hasNextPage: count > skip + take,
        // }
    }
};