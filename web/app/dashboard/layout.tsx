"use client";

import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

     <SidebarProvider> 
      
    <SidebarLayout>
      {children}
    </SidebarLayout>
    </SidebarProvider>
  );
}