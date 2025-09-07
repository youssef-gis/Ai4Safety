'use client';
import {useInView} from "react-intersection-observer";
import { CardElement } from "@/components/card-compact";
import { CommentCreateForm } from "../comment-create-form";
import { CommentWithMetadata } from "../../types";

import { useEffect } from "react";


import { usePaginatedComments } from "./use-paginated-comments";
import { CommentList } from "../comments-list";
import { Skeleton } from "@/components/ui/skeleton";
import { paginationData } from "@/components/pagination/types";


type CommentsProps={
    ticketId: string;
    paginatedComments : paginationData<CommentWithMetadata>
    
}
export const Comments =  ({ticketId, paginatedComments}:CommentsProps) => {
    const {
        comments,
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        onCreateComment,
        onDeleteComment,
        onCreateAttachment,
        onDeleteAttachment,
    } = usePaginatedComments(ticketId, paginatedComments)

    const {ref, inView} = useInView();

    useEffect(()=>{
        if(inView && hasNextPage && !isFetchingNextPage){
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage])

    return (
    <>
      <CardElement
        title="Create Comment"
        description="A new comment will be created"
        content={
          <CommentCreateForm
            ticketId={ticketId}
            onCreateComment={onCreateComment}
          />
        }
      />
      <div className="flex flex-col gap-y-2 ml-8">
        <CommentList
          comments={comments}
          onDeleteComment={onDeleteComment}
          //onCreateAttachment = {onCreateAttachment}
          onDeleteAttachment={onDeleteAttachment}
        />

        {isFetchingNextPage && (
          <>
            <div className="flex gap-x-2">
              <Skeleton className="h-[82px] w-full" />
              <Skeleton className="h-[40px] w-[40px]" />
            </div>
            <div className="flex gap-x-2">
              <Skeleton className="h-[82px] w-full" />
              <Skeleton className="h-[40px] w-[40px]" />
            </div>
          </>
        )}
      </div>

      <div ref={ref}>
        {!hasNextPage && (
          <p className="text-right text-xs italic">No more comments.</p>
        )}
      </div>
    </>
  );
}; 