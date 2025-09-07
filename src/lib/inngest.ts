import { AttachmentDeleteEventArgs } from '@/features/attachments/events/event-attachment-deleted';
import { EmailVeriificationEventArgs } from '@/features/auth/events/event-email-verification';
import { InvitationCreateEventArgs } from '@/features/invitation/events/event-invitation-created';
import { OrganizationCreateEventArgs } from '@/features/organization/events/event-organization-created';
import { PasswodResetEventArgs } from '@/features/password/events/event-password-reset';
import {EventSchemas, Inngest} from 'inngest' ;


type Events = {
    'app/password.password-reset':PasswodResetEventArgs;
    'app/auth.sign-up': EmailVeriificationEventArgs;
    "app/invitation.created" : InvitationCreateEventArgs;
    "app/attachment.deleted": AttachmentDeleteEventArgs;
    "app/organization.created": OrganizationCreateEventArgs;

}

export const inngest = new Inngest({
    id: 'road-to-next-js',
    schemas: new EventSchemas().fromRecord<Events>(),
});