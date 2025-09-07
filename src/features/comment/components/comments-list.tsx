import React from "react";
import { CommentDeleteButton } from "./comment-delete-btn";
import { CommentItem } from "./comment-item";
import { CommentWithMetadata } from "../types";
import { AttachmentDeleteButton } from "@/features/attachments/components/attachment-delete-button";
import { AttachmentList } from "@/features/attachments/components/attachment-list";

type CommentListProps = {
    comments: CommentWithMetadata[];
    onDeleteComment: (id: string)=>void;
    onDeleteAttachment?: (id: string) => void;
}

export const CommentList = ({comments, onDeleteComment,onDeleteAttachment}: CommentListProps) => {
    return (
        <>
                  {comments.map((comment)=>{
                const commentDeleteButton = (
                    <CommentDeleteButton key='0' id={comment.id}
                    onDeleteComment={onDeleteComment} />
                );
                const buttons = [ ...(comment.isOwner ?
                    [commentDeleteButton]:[]),
                ]  


        const sections = [];

        if (comment.attachements.length) {
          sections.push({
            label: "Attachments",
            content: (
              <AttachmentList
                attachments={comment.attachements}
                buttons={(attachmentId) => [
                  ...(comment.isOwner
                    ? [
                        <AttachmentDeleteButton
                          key="0"
                          id={attachmentId}
                          onDeleteAttachment={onDeleteAttachment}
                        />,
                      ]
                    : []),
                ]}
              />
            ),
          });
        }

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            sections={sections}
            buttons={buttons}
          />
        );
      })}
    </>
  );
};

