'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Inspection } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-buttton";
import { useActionState, useMemo, useRef, useState } from "react";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";

import { Form } from "@/components/forms/form";

import { DatePicker, ImperativeHandleFromDatePicker } from "@/components/date-picker";
import { UpsertInspection } from "../actions/upsert-inspection";
import { Button } from "@/components/ui/button";
import { Attachments } from "@/features/attachments/components/attachments";
import { ACCEPTED } from "@/features/supplements/constants";
import { v4 as uuidv4 } from 'uuid';

type InspectionUpdateFormProps = {
    projectId: string;
   
   
}

const InspectionUpsertForm = ({projectId} : InspectionUpdateFormProps) => {
     const inspectionId = useMemo(() => uuidv4(), []);

    const [uploading, setUploading] = useState(false);
    const [s3Keys, setS3Keys] = useState<string[]>([]);

    const [actionState, action]= useActionState(
        UpsertInspection.bind(null, projectId, inspectionId , s3Keys), EMPTY_ACTION_STATE)
    

    const datePickerImperativeHandleRef =useRef<ImperativeHandleFromDatePicker>(null);
    
    // Generate a unique ID for the attachment on the server
    
    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedKeys: string[] = [];

        for (const file of Array.from(files)) {
        // 1. Ask backend for a presigned URL
            const presignRes = await fetch("/api/aws/s3/supplements/presign-upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filename: file.name, contentType: file.type, 
                                            projectId:projectId, 
                                            entity: 'INSPECTION', 
                                            entityId: inspectionId }),
                            });

            if (!presignRes.ok) {
                console.error("Failed to get presigned URL");
                continue;
            }

            const { url, fields } = await presignRes.json();

      // 2. Build FormData for S3
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value as string);
                });
            formData.append("file", file);

      // 3. Upload directly to S3
            const uploadRes = await fetch(url, {
                        method: "POST",
                        body: formData,
                        });

            if (uploadRes.ok) {
                    uploadedKeys.push(fields.key); // store the uploaded file's S3 key
        } else {
                    console.error("Failed to upload file:", file.name);
        }
    }

    setS3Keys(uploadedKeys);
    setUploading(false);
  }

    const handleSuccess = () => {
        datePickerImperativeHandleRef.current?.reset();
        setS3Keys([]);
    }; 

    return (
       
     <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
        <div className="flex flex-col gap-y-6">
              
            <div className="flex items-center gap-x-4">
                    <Label htmlFor="title"  className="w-40">Inspection Title</Label>
                    <Input id="title" name='title' type="text" className='flex-1'
                    // defaultValue={ (actionState.payload?.get('title') as string ) 
                    //                 ?? inspection?.title} 
                    />
            </div>
                    <FieldErrorMsg actionState={actionState} name="title" />

            <div className="flex items-center gap-x-4">
                    <Label htmlFor="inspectionDate" className="w-40" >Inspection Date</Label>

                    <DatePicker   
                        id="inspectionDate"
                        name="inspectionDate"
                        // defaultValue={
                        //     (actionState.payload?.get("inspectionDate")  as string) ??
                        //     inspection?.inspectionDate
                        //         }
                        imperativeHandleRef={datePickerImperativeHandleRef }
                       
                        />
            </div>
                    <FieldErrorMsg actionState={actionState} name="inspectionDate" />

                    
            
            <div className="flex  items-center gap-x-4 ">

                <Label className="w-40">Jobs To Run</Label>

                    <div className="flex flex-col gap-y-2">

                        <label className="flex items-center gap-x-2">
                            <input type="checkbox" name="jobs" value="THREE_D_MODELING" />
                            <span>3D Reconstruction</span>
                        </label>

                        <label className="flex items-center gap-x-2">
                            <input type="checkbox" name="jobs" value="CRACK_DETECTION" />
                            <span>Crack Detection</span>
                        </label>
                    </div>
            </div>
                <FieldErrorMsg actionState={actionState} name="jobs" />

            <div className="flex  items-center gap-x-4 ">

                <Input
                        name="files"
                        id="files"
                        type="file"
                        multiple
                        accept={ACCEPTED.join(",")}
                        onChange={handleFileUpload}
                        
                /> 
                {uploading && <p>Uploading files to S3...</p>}
                {/* Hidden inputs with uploaded S3 keys */}
                {s3Keys.map((key, idx) => (
                <input key={idx} type="hidden" name="files" value={key} />
                ))}           
                    
            </div>    

                <FieldErrorMsg actionState={actionState} name="files" />
        
        </div>   
                
                <SubmitButton label= 'Start Inspection'  disabled={uploading} /> 
    </Form>
    
    );

}
 
export  {InspectionUpsertForm };