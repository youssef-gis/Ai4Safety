'use client';
import { Moon, SunMedium } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";

export const ThemeSwitcher = () => {
    const {theme, setTheme}= useTheme()
    return ( 
        <Button size='icon' onClick={()=>setTheme(
            theme === 'light'? 'dark':'light')} >
            {theme==='light'?<Moon />:<SunMedium />}
            <span className="sr-only" >Toggle Theme</span>
        </Button>
     );
}