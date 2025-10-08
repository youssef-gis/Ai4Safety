'use client';
import { Moon, SunMedium } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";

export const ThemeSwitcher = () => {
    const {theme, setTheme}= useTheme()
    return ( 
        <Button size='icon' variant="outline"  onClick={()=>setTheme(
            theme === 'light'? 'dark':'light')} >
            {theme==='light'?<SunMedium />:<Moon />}
            <span className="sr-only" >Toggle Theme</span>
        </Button>
     );
}