export const homePath = ()=>"/";

export const projectsPath = ()=>"/projects";
export const projectPath= (projectId: string)=>`/projects/${projectId}`;
export const projectViewerPath = (projectId: string, inspectionId?: string) => 
  `/projects/${projectId}/viewer${inspectionId ? `?inspectionId=${inspectionId}` : ''}`;
export const projectCreatePath = ()=> '/projects/create';
export const projectEditPath=  (projectId: string)=> `/projects/${projectId}/edit`;
export const inspectionsPath = (projectId: string)=>
    `/projects/${projectId}/inspections`;

export const inspectionsCreatePath = (projectId: string)=>
    `/projects/${projectId}/inspections/create`;

export const pricingPath = ()=> '/pricing';

export const emailVerificationPath = ()=> '/email-verification';
export const emailInvitationPath = ()=> '/email-invitation';


export const signUpPath = ()=> '/sign-up';
export const signInPath = ()=> '/sign-in';

export const passwordForgotPath = ()=> '/password-forgot';
export const passwordResetPath = ()=> '/password-reset';

export const profilePath = ()=> '/account/profile';
export const passwordPath = ()=> '/account/password';

export const organizationPath = ()=> '/organization';
export const organizationCreatePath = ()=> '/organization/create';
export const membershipsPath = (organizationId: string)=>
    `/organization/${organizationId}/memberships`;
export const invitationsPath =  (organizationId: string)=>
    `/organization/${organizationId}/invitations`;
export const credentialsPath =  (organizationId: string)=>
    `/organization/${organizationId}/credentials`;

export const subscriptionPath = (organizationId: string) =>
  `/organization/${organizationId}/subscription`;


export const onboardingPath= ()=> '/onboarding';
export const selectActiveOrganizationPath= ()=> 
    '/onboarding/select-active-organization';

export const attachmentDownloadPath = (attachmentId: string) =>
  `/api/aws/s3/attachments/${attachmentId}`;


export const supplementDownloadPath = (supplementId: string) =>
  `/api/aws/s3/supplements/${supplementId}`;