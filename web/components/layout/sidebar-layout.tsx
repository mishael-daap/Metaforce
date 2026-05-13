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
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Folder, User, PanelLeft } from "lucide-react";

const navigation = [
  { name: "Projects", href: "/dashboard/projects", icon: Folder },
  { name: "User Profile", href: "/dashboard/profile", icon: User },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar(); // ← use shadcn's own state
  const isCollapsed = state === "collapsed";

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
                <PanelLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          ) : (
            // Expanded: logo + name on left, toggle on right
            <div className="flex h-16 items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 shrink-0" />
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
      </Sidebar>

      <SidebarInset className="flex-1 overflow-auto">{children}</SidebarInset>
    </>
  );
}
