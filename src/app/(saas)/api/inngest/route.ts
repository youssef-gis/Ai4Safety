import { supplementDeletedEvent } from '@/features/supplements/events/event-attachment-deleted'
import { emailVerificationEvent } from '@/features/auth/events/event-email-verification'
import { invitationCreatedEvent } from '@/features/invitation/events/event-invitation-created'
import { organizationCreatedEvent } from '@/features/organization/events/event-organization-created'
import { passwordResetEvent } from '@/features/password/events/event-password-reset'
import {inspectionStartedEvent} from '@/features/inspection/events/event-inspection-created'
import { inngest } from '@/lib/inngest'
import {serve} from 'inngest/next'

export const  {GET, POST, PUT}= serve({
    client:inngest,
    functions: [passwordResetEvent, emailVerificationEvent, 
        invitationCreatedEvent,supplementDeletedEvent, 
        organizationCreatedEvent, inspectionStartedEvent], 
})


