"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import type { ReactNode } from "react";

function SidebarLayoutInset({ children }: { children: ReactNode }) {
  const { isMobile, openMobile, state } = useSidebar();
  const expanded = isMobile ? openMobile : state === "expanded";

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger
          className="-ml-1"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={expanded}
        />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
    </SidebarInset>
  );
}

export function SidebarLayout({
  children,
  header,
  footer,
  navigation,
  className,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  navigation?: ReactNode;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className={className}>
        <Sidebar collapsible="icon">
          {header && <SidebarHeader>{header}</SidebarHeader>}
          <SidebarContent>
            <SidebarGroup>
              <nav aria-label="Main navigation">
                <SidebarMenu>{navigation}</SidebarMenu>
              </nav>
            </SidebarGroup>
          </SidebarContent>
          {footer && <SidebarFooter>{footer}</SidebarFooter>}
          <SidebarRail />
        </Sidebar>
        <SidebarLayoutInset>{children}</SidebarLayoutInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export function SidebarNavItem({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<a href={href} title={label} />} tooltip={label}>
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
