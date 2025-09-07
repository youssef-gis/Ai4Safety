import { prisma } from "@/lib/prisma";
import { generateRandomCod } from "@/utils/crypto"

const EMAIL_VERIFICATION_CODE_LIFETIME_MS = 1000*60*10.

export const generateEmailVerificationCode = async (
    userId: string,
    email: string
) => {

    await prisma.emailVerificationToken.deleteMany({
        where:{
            userId,
        }
    })

    const code = generateRandomCod();
    
    await prisma.emailVerificationToken.create({
        data:{
            code,
            userId,
            email,
            expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_CODE_LIFETIME_MS),
        },
    });

    return code;

}