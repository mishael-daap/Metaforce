"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Folder, LogOut, PanelLeft } from "lucide-react";
import StaticLoader from "@/components/ui/logo-static";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Projects", href: "/dashboard/projects", icon: Folder },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="icon"
        className="shrink-0"
      >
        <SidebarHeader className="border-b">
          {isCollapsed ? (
            // Collapsed: just the toggle button, centered
            <div className="flex h-16 items-center justify-center">
              <button
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-sidebar-accent"
                aria-label="Open sidebar"
              >
                <StaticLoader className="h-7 w-7" />
              </button>
            </div>
          ) : (
            // Expanded: logo + name on left, toggle on right
            <div className="flex h-16 items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <StaticLoader className="h-7 w-7 shrink-0" />
                <span className="font-semibold">Metaforce</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-sidebar-accent"
                aria-label="Close sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="flex-1 py-4 overflow-y-auto">
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/dashboard/projects" &&
                    (pathname?.startsWith("/dashboard/project/") ||
                      pathname?.startsWith("/project/")));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "flex items-center py-2 text-sm font-medium transition-colors",
                        isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center w-full"
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isCollapsed ? "mx-auto" : "",
                          )}
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <div
            className={cn(
              "flex items-center p-2",
              isCollapsed ? "justify-center" : "justify-between gap-2",
            )}
          >
            {user?.image ? (

              <Avatar>
                    <AvatarImage
                      src={user.image}
                      alt={user.name ?? "User avatar"}
                    />
                    <AvatarFallback>{user.name ?? "U"}</AvatarFallback>
                  </Avatar>
            ) : (
              <div
                className={cn(
                  "rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-medium",
                  isCollapsed ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm",
                )}
              >
                {user?.name?.charAt(0).toUpperCase() ??
                  user?.email?.charAt(0).toUpperCase() ??
                  "U"}
              </div>
            )}

            {!isCollapsed && (
              <div className="flex min-w-0 flex-1 flex-col ml-2">
                <span className="text-sm font-medium truncate">
                  {user?.name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="p-2 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 overflow-auto">{children}</SidebarInset>
    </>
  );
}
