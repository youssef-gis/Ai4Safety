'use server';

import { ActionState, formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { createSession } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { generateRandomToken } from "@/utils/crypto";
import z from "zod";
import { setSessionCookie } from "../utils/session-cookie";
import { hashPassword } from "@/features/password/utils/hash-and-verify";
import { redirect } from "next/navigation";
import { projectsPath } from "@/path";
 
import { inngest } from "@/lib/inngest";
import { MembershipRole, Prisma } from "@prisma/client";

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1)
      .max(191)
      .refine(
        (value) => !value.includes(" "),
        "Username cannot contain spaces"
      ),
    email: z.string().min(1, { message: "Is required" }).max(191).email(),
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

export const SignUp = async (
  _actionState:ActionState, 
  formData: FormData) => {
    try {
        const {username, email, password}= signUpSchema.parse(
            Object.fromEntries(formData)
        );
        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
          data: {
            username,
            email,
            passwordHash,
          },
        });

        const invitations = await prisma.invitation.findMany({
          where:{
            email,
          },
        });
        
        await prisma.$transaction([
         prisma.invitation.deleteMany({
          where:{
            email,
          },
        }),

         prisma.membership.createMany({
          data: invitations.map((invitation)=>({
            organizationId: invitation.organizationId,
            userId: user.id,
            MembershipRole: "MEMBER",
            isActive: false,
            }))
          })          
        ]);

        await inngest.send({
          name:'app/auth.sign-up',
          data:{
            userId: user.id
          }
        })
        
        const sessionToken = generateRandomToken();
        const session = await createSession(sessionToken, user.id);

        await setSessionCookie(sessionToken, session.expiresAt);


    }  catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return toActionState(
          "Error",
          "Either email or username is already in use",
          formData
        );
      }

      return formErrorToActionState(error, formData);
    }

  redirect(projectsPath());
};