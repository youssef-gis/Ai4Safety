import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";


const AuthenticatedLayout = async ({
    children,}: Readonly<{children: React.ReactNode}>) => {
    await getAuthOrRedirect()
    return ( 
        <>{children}</>
     );
}
 
export default AuthenticatedLayout;