'use client';
import { deleteCookieByKey, getCookieByKey } from "@/actions/cookies";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";


const tryParseJsonObject = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};


export const RedirectToast = () => {
    const pathname= usePathname();

    useEffect(()=>{
        const showCookieToast = async ()=>{
            const message=  await getCookieByKey('toast');

            if(message){
                const toastData = tryParseJsonObject(message);
                toast.success(  typeof toastData === "string" ? (
            message
          ) : (
            <span>
              <Link href={toastData.link} className="underline">
                {toastData.message}
              </Link>
            </span>
          ));
                deleteCookieByKey('toast');
            }
        };
        showCookieToast();
    }, [pathname]);

    return null;
}