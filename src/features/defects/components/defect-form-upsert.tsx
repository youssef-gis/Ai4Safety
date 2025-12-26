'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AlertTriangle, ImageIcon, X } from 'lucide-react';

import { Detection } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-buttton";
import { useActionState, useRef, useTransition } from "react";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";

import { Form } from "@/components/forms/form";

import { DatePicker, ImperativeHandleFromDatePicker } from "@/components/date-picker";
import { UpsertDetection } from "../actions/upsert-detection";
import { Button } from "@/components/ui/button";
import { deleteDefect } from "../actions/delete-detection";
import { cn } from "@/lib/utils";



type DetectionUpdateFormProps = {
    detection?: Detection;
    inspectionId: string;
    geometry?: { type: 'polyline' | 'polygon' | 'point'; coordinates: {x: number, y: number, z: number}[], 
                measurement?: string; labelPosition?: {x: number, y: number, z: number}; 
                annotation2D?: {x: number, y: number}[] | null; sourceImageId?: string | null
            };
    onCancel: () => void;
    onFormSuccess: () => void;
    canDelete: boolean;
    canEdit: boolean;
    onOpenImage: (detection: Detection)=>void;
}

const DetectionUpsertForm = ({detection, inspectionId, geometry, 
            onCancel, onFormSuccess, canDelete, canEdit, onOpenImage} : DetectionUpdateFormProps) => {
    const [actionState, action]= useActionState(
        UpsertDetection.bind(null, detection?.id, inspectionId), EMPTY_ACTION_STATE)

    const [isDeleting, startDeleteTransition] = useTransition();
    
    //const datePickerImperativeHandleRef =useRef<ImperativeHandleFromDatePicker>(null);

    const handleSuccess = () => {
        //datePickerImperativeHandleRef.current?.reset();
        onFormSuccess();
    }; 

    const handleDelete = async () => {
        if (!detection) return;
        
        // Simple browser confirmation
        if (confirm("Are you sure you want to delete this defect?")) {
            startDeleteTransition(async () => {
                const result = await deleteDefect(detection.id);
                if (result.status === 'Success') {
                    onFormSuccess(); // This will close the form and refresh the map
                } else {
                    alert(result.message); // Show an error
                }
            });
        }
    };

    return (        
    <div className="relative w-full h-full">

        <Button 
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="absolute -top-2 -right-2 text-muted-foreground hover:text-foreground z-10"
        >
            <X className="w-5 h-5" />
        </Button>
        
        
        <h3 className="text-lg font-bold mb-4 pr-8">
            {detection ? 'Edit Defect' : 'New Defect'}
        </h3>

        <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
            {geometry && (
                    <input 
                        type="hidden" 
                        name="Defect_Location" 
                        value={JSON.stringify(geometry)} 
                    />
                )}
            {detection?.sourceImageId && (
                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Source Image
                            </span>
                            {/* This badge confirms we have 2D data */}
                            {detection.annotation2D && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Has Drawing
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="text-sm truncate flex-1 font-mono">
                                {detection.sourceImageId}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenImage(detection)} // 👈 Open Modal in Edit Mode
                                className="gap-2 h-8"
                            >
                                <ImageIcon className="w-3 h-3" />
                                Edit Drawing
                            </Button>
                        </div>
                    </div>
                )}
            <div className="mb-2">
                <Label htmlFor="Defect_Type"  
                    className="block text-sm font-medium  mb-1">
                        Defect Type
                </Label>
                <select id="Defect_Type" name='Defect_Type'
                defaultValue={ (actionState.payload?.get('Defect_Type') as string ) ?? detection?.type} 
                className="w-full p-2 border border-input bg-background rounded-md text-sm">
                    <option value="SPALLING_CRACK" >Spalling Crack</option>
                    <option value="EFFLORESCENCE" >Efflorescence</option>
                    <option value="WATER_DAMAGE" >Water Damage</option>
                    <option value="CORROSION_STAIN" >Corrosion Stain</option>
                    <option value="INSULATION_FAULT" >Insulation Fault</option>
                </select>
                
                <FieldErrorMsg actionState={actionState} name="Defect_Type" />
            </div>

            <div className="mb-2">
                <Label htmlFor="Defect_Severity"  
                    className="block text-sm font-medium  mb-1">
                        Defect Severity
                </Label>
                <select id="Defect_Severity" name='Defect_Severity'
                defaultValue={ (actionState.payload?.get('Defect_Severity') as string ) ?? detection?.severity} 
                className="w-full p-2 border border-input bg-background rounded-md text-sm">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
                
                <FieldErrorMsg actionState={actionState} name="Defect_Severity" />
            </div>
            
            <div className="mb-2">
                <Label htmlFor="Defect_Status"  
                    className="block text-sm font-medium  mb-1">
                        Defect Status
                </Label>
                <select id="Defect_Status" name='Defect_Status'
                defaultValue={ (actionState.payload?.get('Defect_Status') as string ) ?? detection?.status} 
                className="w-full p-2 border border-input bg-background rounded-md text-sm">
                    <option value="NEW">New</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                
                <FieldErrorMsg actionState={actionState} name="Defect_Status" />
            </div>

            <div className="mb-2">
                <Label htmlFor="Defect_Notes" className="block text-sm font-medium  mb-1">Notes</Label>
                <Textarea id='Defect_Notes' name='Defect_Notes' 
                    defaultValue={ (actionState.payload?.get('Defect_Notes') as string ) ?? detection?.notes} 
                    className="w-full p-2 border border-gray-300 rounded-md " rows={2}></Textarea>
            </div>

            <div className={cn(
                    "flex w-full gap-2 pt-2",
                    detection ? "justify-between" : "justify-center"
                )}>
                {detection && canDelete && (
                    <Button 
                        type="button"
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"/> : 
                                    <AlertTriangle className="w-4 h-4" />}
                    </Button>
                )}
       
               {(!detection || canEdit) && (
                        <SubmitButton 
                            label={detection ? 'Save Changes' : 'Create Defect'} 
                            disabled={false}   
                        />
                        )}
            </div>
        </Form>
    </div>
    );
}
 
export  {DetectionUpsertForm};