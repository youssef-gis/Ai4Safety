import { getProjects } from "../queries/get-projects";
import { ProjectItem } from "./project-item";
import { ParsedSearchParams } from "../search-params";
import { Placeholder } from "@/components/placeholder";
import { ProjectSearchInput } from "./project-search-input";
import { ProjectSortSelect } from "./project-sort-select";
import { ProjectPagination } from "./project-pagination";

type ProjectListProps = {
    userId ?: string;
    byOrganization?: boolean
    searchParams: ParsedSearchParams;
};

export const ProjectLisT = async ({userId, byOrganization=false,searchParams}: ProjectListProps) => {
    const {list: projects, metadata: projectMetadata}= await getProjects(
        userId,
        byOrganization,
        searchParams);
    return ( 
        <div className='flex-1 flex flex-col items-center gap-y-4' >
            <div className="w-full max-w-[420px] flex gap-x-2" >
                <ProjectSearchInput placeholder='Search projects' />
                <ProjectSortSelect options={
                        [
                        {sortKey: 'createdAt' , 
                         sortValue:'desc', 
                         label:'Newest',
                        },

                        {sortKey: 'createdAt' , 
                         sortValue:'asc', 
                         label:'Oldest',
                        }
                        ]
                    } />
            </div>
            { projects.length ?(projects.map(
                        (project) => (
                            <ProjectItem key={project.id} project={project}  />
                        )
                )):(<Placeholder label="No Projects Found" />)    
            }
            <div className="w-full max-w-[420px]" >
                <ProjectPagination paginationProjectMetadata={projectMetadata} />
            </div>
        </div>
     );
}