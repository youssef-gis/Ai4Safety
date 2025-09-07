'use server';

import { ActionState, formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { filesSchema } from "@/features/attachments/schema/files";
import * as attachmentService from "../../attachments/service";
import * as attachmentSubjectDTO from "@/features/attachments/dto/attachment-subject-dto";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import * as commentData from "../data";
import * as ticketData from "@/features/ticket/data";
import { ticketPath } from "@/path";
import { revalidatePath } from "next/cache";
import { z} from "zod";
import { findIdsFromText } from "@/utils/find-ids-from-text";


const createCommentSchema=z.object({
    content: z.string().min(1).max(1024),
    files: filesSchema,
})

export const createComment = async (ticketId: string,
                                    _actionstate: ActionState, 
                                    formData: FormData) => {

    const {user}= await getAuthOrRedirect();

    let comment;

    try {
    
        const {content, files} = createCommentSchema.parse({
            content: formData.get('content'),
            files: formData.getAll('files'),
        });


    comment = await commentData.createComment({
      userId: user.id,
      ticketId,
      content,
      options: {
        includeUser: true,
        includeTicket: true,
      },
    });

    const subject = attachmentSubjectDTO.fromComment(comment);

    if (!subject) {
      return toActionState("Error", "Comment not created");
    }

    await attachmentService.createAttachments({
      subject: subject,
      entity: "COMMENT",
      entityId: comment.id,
      files,
    });

    await ticketData.connectReferencedTickets(
      ticketId,
      findIdsFromText("tickets", content)
    );    

    } catch (error) {
        return formErrorToActionState(error)
    };

    revalidatePath(ticketPath(ticketId));

    return toActionState( 'Success', 'Comment Created', undefined,
        {...comment,isOwner:true});

};