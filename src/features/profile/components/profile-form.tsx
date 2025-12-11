"use client";

import { useActionState } from "react";
import { Camera, User } from "lucide-react";

import { updateProfile } from "../actions/update-profile";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardContent, CardFooter } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { FieldErrorMsg } from "@/components/forms/field-error";

type ProfileFormProps = {
  user: {
    firstName: string | null;
    lastName: string | null;
    username: string;
    email: string;
    role: string | null;
  }
};

const INITIAL_USER = {
  firstName: "Nathan",
  lastName: "Roberts",
  email: "nathan.roberts@ai4safety.com",
  role: "Senior Safety Officer",
  initials: "NR",
};

export const ProfileForm = ({user}: ProfileFormProps) => {
  const [actionState, action] = useActionState(updateProfile, EMPTY_ACTION_STATE);
  
  const getInitials = () => {
    if (user.firstName && user.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return (user.username?.[0] || "U").toUpperCase();
  };

  return (
    <Form action={action} actionState={actionState}>
      <Separator className="mb-6" />

      <CardContent className="space-y-8 px-0">
        
        {/* Avatar Section (Visual Only for now) */}
        <div className="flex items-center gap-x-6">
          <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted border items-center justify-center">
            <span className="text-xl font-medium text-muted-foreground">
              {/* {INITIAL_USER.initials} */}
              {getInitials()}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-x-3">
              <Button type="button" variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* First Name */}
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="First Name"
              defaultValue={
                (actionState.payload?.get("firstName") as string) || user.firstName || ""
              }
            />
            <FieldErrorMsg name="firstName" actionState={actionState} />
          </div>

          {/* Last Name */}
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              defaultValue={
                (actionState.payload?.get("lastName") as string) || user.lastName || ""
              }
            />
            <FieldErrorMsg name="lastName" actionState={actionState} />
          </div>

          {/* Email (Read Only) */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                className="pl-9"
                defaultValue={user.email}
                disabled
              />
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              This is the email you use to login.
            </p>
          </div>

          {/* Job Title */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="role">Job Title / Role</Label>
            <Input
              id="role"
              name="role"
              placeholder="e.g. Safety Officer"
              defaultValue={
                (actionState.payload?.get("role") as string) || user.role || ""
              }
            />
            <FieldErrorMsg name="role" actionState={actionState} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6 px-0">
        <p className="text-sm text-muted-foreground">
          Profile information
        </p>
        <SubmitButton label="Save Changes" disabled={false} />
      </CardFooter>
    </Form>
  );
};