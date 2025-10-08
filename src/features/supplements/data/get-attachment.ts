import { prisma } from "@/lib/prisma";

export const getAttachment = async (id: string) => {
  return await prisma.supplement.findUnique({
    where: {
      id,
    },
    include: {
      inspection: {
        include:{
          project:{
            select:{
              organizationId:true,
            }
          }
        }
      },
      analysis: {
        include:{
          inspection:{
            include:{
              project:{
                select:{
                  organizationId:true
                }
              }
            }
          }
        }
      },
      comment: {
        include: {
          inspection: {
            include:{
              project:{
                select:{
                  organizationId:true,
                }
              }
            }
          },
         
        },
      },
    },
  });
};