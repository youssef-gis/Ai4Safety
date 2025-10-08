import { ProjectBreadCrumbs } from "./_navigation/tabs";

const Layout =  ({children}: Readonly<{children: React.ReactNode , 
        params:Promise<{projectId: string}>}>) => {
   
   
    return ( 
        <div className='flex-1 flex flex-col gap-y-8'>
            {/* <ProjectBreadCrumbs/> */}
           
            {children}
        </div>
     );
}
 
export default Layout;