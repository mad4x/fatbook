"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarHeader, SidebarMenu,
    SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { SIDEBAR_ELEMENTS } from "@/constants";
import { isVicepreside, getToken, getUserInfo } from "@/lib/jwt";

const AppSidebar = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) {
        return (
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-3 py-3 px-2">
                        <img src="/FatBook_logo.svg" alt="FatBook" className="h-11 w-11" />
                        <h1 className="text-3xl font-bold">
                            Fat<span className="text-blue-400">Book</span>
                        </h1>
                    </div>
                </SidebarHeader>
            </Sidebar>
        );
    }

    const token = getToken();
    const isLoggedIn = !!token;
    const vicepreside = isVicepreside();
    const userInfo = getUserInfo(token);

    const handleLogout = () => {
        localStorage.removeItem("token");
        document.cookie = "token=; Max-Age=0; path=/";
        router.replace("/sign-in");
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-1">
                    <img src="/FatBook_logo.svg" alt="FatBook" className="h-10 w-10 object-contain block"/>
                    <h1 className="text-3xl font-bold">
                        Fat<span className="text-blue-400">Book</span>
                    </h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SIDEBAR_ELEMENTS.filter((item) => item.title !== "Impostazioni").map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            {vicepreside && isLoggedIn && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/vicepresidenza">
                                            <span>Pannello Vicepresidenza</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {SIDEBAR_ELEMENTS.filter((item) => item.title === "Impostazioni").map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {!isLoggedIn ? (
                    <Link href="/sign-in" className="w-full">
                        <Button className="w-full">Accedi</Button>
                    </Link>
                ) : (
                    <div className="flex flex-col gap-4 w-full p-2">
                        <div className="flex flex-row items-center gap-3 overflow-hidden">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200 font-semibold">
                                    {userInfo.nome?.substring(0, 1).toUpperCase()}
                                    {userInfo.cognome?.substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col items-start overflow-hidden">
                                <p className="text-sm font-semibold truncate w-full text-slate-900 dark:text-slate-100">
                                    {userInfo.nome} {userInfo.cognome}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate w-full">
                                    {userInfo.email}
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            variant="destructive"
                            onClick={handleLogout}
                        >
                            Disconnettiti
                        </Button>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
