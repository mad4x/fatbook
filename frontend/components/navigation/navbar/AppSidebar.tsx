import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { SIDEBAR_ELEMENTS } from "@/constants";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {auth} from "@/auth";

const AppSidebar = async () => {
  const session = await auth();
  console.log(session?.user?.image)
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!session ? (
          <a href="/sign-in">
            <Button className="w-full">
              Accedi
            </Button>
          </a>
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <Avatar>
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p>{session.user?.name}</p>
          </div>

        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar