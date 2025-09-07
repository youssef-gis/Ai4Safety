'use server';

import { setCookieByKey } from "@/actions/cookies";
import { ActionState, 
    formErrorToActionState, 
    toActionState} from "@/components/forms/utils/to-action-state";
import { prisma } from "@/lib/prisma";

import { signInPath } from "@/path";
import { hashToken } from "@/utils/crypto";
import { redirect } from "next/navigation";
 
import z from "zod";
import { hashPassword } from "../utils/hash-and-verify";



const passwordResetSchema = z.object({
        password: z.string().min(6).max(191),
        confirmPassword: z.string().min(6).max(191),
  })  
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

const passwordReset =  async (tokenId:string,
    _actionState:ActionState, formData: FormData, ) => {
    try {
        const { password}= passwordResetSchema.parse({
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
    });

    const tokenHash = hashToken(tokenId);
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
        where: {tokenHash},
    });

    if(passwordResetToken) {
        await prisma.passwordResetToken.delete({
            where:{tokenHash},
        });
    };

    if(!passwordResetToken || Date.now() > passwordResetToken.expiresAt.getTime()){
        return toActionState('Error', 'Expired or Invalid verification token', formData);
    };

    await prisma.session.deleteMany({
        where:{
            userId: passwordResetToken.userId,
        },
    });
    
    const passwordHash = await hashPassword(password);
    
    await prisma.user.update({
        where: {id: passwordResetToken.userId},
        data: {passwordHash},
    })


    } catch (error) {
      return  formErrorToActionState(error, formData)
    }   
    
    await setCookieByKey('toast', 'Succesfully reset password');
    redirect(signInPath())

};

export { passwordReset }