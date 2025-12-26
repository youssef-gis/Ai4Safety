import { SupplementDeleteEventArgs } from '@/features/supplements/events/event-attachment-deleted';
import { EmailVeriificationEventArgs } from '@/features/auth/events/event-email-verification';
import { InvitationCreateEventArgs } from '@/features/invitation/events/event-invitation-created';
import { OrganizationCreateEventArgs } from '@/features/organization/events/event-organization-created';
import { PasswodResetEventArgs } from '@/features/password/events/event-password-reset';
import { InspectionStartedEventArgs } from '@/features/inspection/events/event-inspection-created';
import {EventSchemas, Inngest} from 'inngest' ;


type Events = {
    'app/password.password-reset':PasswodResetEventArgs;
    'app/auth.sign-up': EmailVeriificationEventArgs;
    "app/invitation.created" : InvitationCreateEventArgs;
   
    "app/supplement.deleted": SupplementDeleteEventArgs;
    "app/organization.created": OrganizationCreateEventArgs;
    "app/inspection.started": InspectionStartedEventArgs;

}

export const inngest = new Inngest({
    id: 'road-to-next-js',
    eventKey:
    process.env.NODE_ENV === "production"
      ? process.env.INNGEST_EVENT_KEY
      : undefined,
    schemas: new EventSchemas().fromRecord<Events>(),
});