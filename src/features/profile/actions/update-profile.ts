"use server";

import { ActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { z } from "zod";
import { updateUserProfile } from "../queries/get-user-profile";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { revalidatePath } from "next/cache";


const updateProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.string().optional(),
});

export const updateProfile = async (
  formState: ActionState,
  formData: FormData
): Promise<ActionState> => {

  const {user , activeOrganization}= await getAuthOrRedirect();
  
  if (!user || !activeOrganization) {
        return toActionState('Error', 'Not Authenticated');
      } ;
  
  try {
   
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      role: formData.get("role"),
    };

   
    const validatedFields = updateProfileSchema.safeParse(data);

    if (!validatedFields.success) {
      return toActionState(
        "Error", 
        "Please check your input fields", 
        formData, 
        validatedFields.error
      );
    }

    
    console.log("Saving user data:", validatedFields.data);
    try {
   
      await updateUserProfile(user.id, {
        firstName: validatedFields.data.firstName as string,
        lastName: validatedFields.data.lastName as string,
        //username: validatedFields.data.username as string,
        role: validatedFields.data.role as string | undefined,
      });


      revalidatePath("/account/profile");

      return toActionState("Success", "Profile updated successfully", formData);
    } catch (error) {
     
      // if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      //     return toActionState("Error", "This username is already taken", formData);
      // }

      console.error("Profile Update Error:", error);
      return toActionState("Error", "Failed to update profile", formData);
    }


  } catch (error) {
    return toActionState("Error", "Failed to update profile", formData);
  }
};