import { LucideBook, LucideBookCopy, LucideCircleUser, 
        LucideLibrary, LucideProjector, LucideUsers } from "lucide-react";
import { NavItem } from "./types";
import { homePath, organizationPath, 
    profilePath, ticketsByOrganizationPath, 
    ticketsPath, projectsPath } from "@/path";

export const navItems: NavItem[] = [
    {
        title: 'Projects',
        icon: <LucideProjector />,
        href: projectsPath(),
    },
    // {
    //     title: 'All Tickets',
    //     icon: <LucideLibrary />,
    //     href: homePath(),
    // },
    // {
    //     title: 'Our Tickets',
    //     icon: <LucideBookCopy />,
    //     href: ticketsByOrganizationPath(),
    // },
    // {
    //     title: 'My tickets',
    //     icon: <LucideBook />,
    //     href: ticketsPath(),
    // },
    {
        separator: true,
        title: 'Account',
        icon: <LucideCircleUser />,
        href:profilePath(),
    },
    {
        title: 'Organization',
        icon: <LucideUsers />,
        href:organizationPath(),
    }
]

export const closedClassName =
  "text-background opacity-0 transition-all duration-300 group-hover:z-40 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100";
