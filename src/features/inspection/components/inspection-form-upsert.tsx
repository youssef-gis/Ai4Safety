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
import { ACCEPTED } from "@/features/supplements/constants";
//import { v4 as uuidv4 } from 'uuid';
//import { randomUUID } from 'crypto'; 
import { LucideBox, LucideCloudUpload, LucideScanLine } from "lucide-react";

type InspectionUpdateFormProps = {
    projectId: string;
   
   
}

const InspectionUpsertForm = ({projectId} : InspectionUpdateFormProps) => {
     const inspectionId = useMemo(() => crypto.randomUUID(), []);

    const [uploading, setUploading] = useState(false);
    const [s3Keys, setS3Keys] = useState<string[]>([]);

    const [actionState, action]= useActionState(
        UpsertInspection.bind(null, projectId, inspectionId , s3Keys), 
        EMPTY_ACTION_STATE)
    const [fileCount, setFileCount] = useState(0);
    

    const datePickerImperativeHandleRef =useRef<ImperativeHandleFromDatePicker>(null);
    
    
    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedKeys: string[] = [];

        for (const file of Array.from(files)) {
   
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

 
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value as string);
                });
            formData.append("file", file);

 
            const uploadRes = await fetch(url, {
                        method: "POST",
                        body: formData,
                        });

            if (uploadRes.ok) {
                    uploadedKeys.push(fields.key); 
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
     <Form action={action} actionState={actionState} onSuccess={handleSuccess} >
        <div className="space-y-6">
            
        
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Dataset Name</Label>
                    <Input id="title" name='title' placeholder="e.g. 'North Façade - Post Storm Scan'" />
                    <FieldErrorMsg actionState={actionState} name="title" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="inspectionDate">Capture Date</Label>
                    <div className="text-xs text-muted-foreground mb-1">When were these photos taken?</div>
                    <DatePicker   
                        id="inspectionDate"
                        name="inspectionDate"
                        imperativeHandleRef={datePickerImperativeHandleRef}
                    />
                    <FieldErrorMsg actionState={actionState} name="inspectionDate" />
                </div>
            </div>

            <div className="space-y-3">
                <Label>AI Processing Jobs</Label>
                <div className="grid grid-cols-2 gap-4">
                  
                    <label className="cursor-pointer">
                        <input type="checkbox" name="jobs" value="THREE_D_MODELING" className="peer sr-only" />
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-muted rounded-xl hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                            <LucideBox className="w-6 h-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                            <span className="text-sm font-medium">3D Model</span>
                        </div>
                    </label>

                    <label className="cursor-pointer">
                        <input type="checkbox" name="jobs" value="CRACK_DETECTION" className="peer sr-only" />
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-muted rounded-xl hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                            <LucideScanLine className="w-6 h-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                            <span className="text-sm font-medium">AI Defect Scan</span>
                        </div>
                    </label>
                </div>
                <FieldErrorMsg actionState={actionState} name="jobs" />
            </div>

           
            <div className="space-y-2">
                <Label>Drone Imagery</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/20 transition-colors relative">
                    <input
                        //name="files"
                        type="file"
                        multiple
                        accept={ACCEPTED.join(",")}
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <LucideCloudUpload className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG (Max 100MB per file)
                        </p>
                        {fileCount > 0 && (
                            <div className="mt-2 text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                {fileCount} files selected
                            </div>
                        )}
                    </div>
                </div>
                {uploading && <p className="text-xs text-blue-500 animate-pulse">Uploading to secure storage...</p>}
                
               
                {s3Keys.map((key, idx) => (
                    <input key={idx} type="hidden" name="files" value={key} />
                ))}
                <FieldErrorMsg actionState={actionState} name="files" />
            </div>
        
        </div>   
        
        <div className="pt-4 grid">
            <SubmitButton label='Start Processing' disabled={!uploading} size="lg" /> 
        </div>
    </Form>

    );

}
 
export  {InspectionUpsertForm };
