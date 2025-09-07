
import { prisma } from "@/lib/prisma";

export const validateEmailVerificationCode = async (userId:string,
     useremail:string, usercode: string)=>{
            
        const emailVerificationToken= await prisma.emailVerificationToken.findFirst({
                        where:{
                            userId: userId,
                        },
                    });
        if(!emailVerificationToken || emailVerificationToken.code !== usercode){
            return false;
        }
        await prisma.emailVerificationToken.delete({
            where:{
                id: emailVerificationToken.id
            },
        });
        const isExpired = Date.now() > emailVerificationToken.expiresAt.getTime();
        if(isExpired){
            return false;
        };

        if(emailVerificationToken.email !== useremail){
            return false;
        }

        return true;
};
 