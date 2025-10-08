"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";

import { navItems } from "../constants";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import { getActivePath } from "@/utils/get-active-path";
import { pricingPath, signInPath, signUpPath } from "@/path";

const Sidebar = () => {
  const { user, isFetched } = useAuth();
  const pathName= usePathname();

  const { activeindex }= getActivePath(
    pathName,
    navItems.map(item=>item.href),
    [signUpPath(), signInPath(), pricingPath()]
  )

  const [isTransition, setTransition] = useState(false);
  const [isOpen, setOpen] = useState(false);

  const handleToggle = (open: boolean) => {
    setTransition(true);
    setOpen(open);
    setTimeout(() => setTransition(false), 200);
  };

  if (!user || !isFetched) {
    return <div className="w-[78px] bg-secondary/20" />;
  }

  return (
    <nav
      className={cn(
        "h-screen border-r pt-10",
        isTransition && "duration-200",
        isOpen ? "md:w-60 w-[78px]" : "w-[78px]"
      )}
      onMouseEnter={() => handleToggle(true)}
      onMouseLeave={() => handleToggle(false)}
    >
      <div className="px-3 py-2">
        <nav className="space-y-2">
          {navItems.map((navItem, index) => (
            <SidebarItem
              key={navItem.title}
              isOpen={isOpen}
              isActive={activeindex === index}
              navItem={navItem}
            />
          ))}
        </nav>
      </div>
    </nav>
  );
};

export { Sidebar };