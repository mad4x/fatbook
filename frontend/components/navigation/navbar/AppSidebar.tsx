"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarHeader, SidebarMenu,
    SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";

import { SIDEBAR_ELEMENTS } from "@/constants";
import { isVicepreside, getToken, CustomJwtPayload } from "@/lib/jwt";

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
                <SidebarHeader><h1 className="text-3xl font-bold py-3 px-2">Fat<span className="text-blue-400">Book</span></h1></SidebarHeader>
            </Sidebar>
        );
    }

    // --- ORA SIAMO SICURI DI ESSERE NEL BROWSER ---
    // Possiamo derivare tutto in tempo reale senza usare useState!

    const token = getToken();
    const isLoggedIn = !!token; // Trasforma il token in un booleano (true se c'è, false se è null)
    const vicepreside = isVicepreside();

    let userEmail = "";
    if (token) {
        try {
            const decoded = jwtDecode<CustomJwtPayload>(token);
            userEmail = decoded.sub || "";
        } catch (error) {
            console.error("Errore nella lettura del token", error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.replace("/sign-in");
    };
    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className="text-3xl font-bold py-3 px-2">
                    Fat<span className="text-blue-400">Book</span>
                </h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SIDEBAR_ELEMENTS.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            {/* Il Pannello appare solo se lo stato vicepreside è true */}
                            {vicepreside && isLoggedIn && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/vicepresidenza">
                                            <span>Pannello Vicepresidenza</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
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
                    <div className="flex flex-col gap-3 items-center w-full">
                        <div className="flex flex-row gap-2 items-center w-full px-2">
                            <Avatar>
                                {/* Per ora non abbiamo l'immagine, usiamo il fallback */}
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {userEmail.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {/* Mostriamo l'email presa dal JWT in attesa del Nome vero */}
                            <p className="text-sm truncate w-full">{userEmail}</p>
                        </div>

                        <Button
                            className="w-full"
                            variant="destructive" // Magari rosso per il logout?
                            onClick={handleLogout}
                        >
                            Disconnettiti
                        </Button>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar;