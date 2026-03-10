import {
  LayoutDashboard, Users, Package, FilePlus, FileText, Settings,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Products', url: '/products', icon: Package },
  { title: 'Invoices', url: '/invoices', icon: FileText },
  { title: 'Create Invoice', url: '/invoices/create', icon: FilePlus },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Top branding */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-sidebar-primary-foreground">K</span>
          </div>
          {!collapsed && (
            <div className="animate-slide-in">
              <p className="font-bold text-sm text-sidebar-foreground leading-none">KHASKINS (PVT) LTD</p>
              <p className="text-xs text-sidebar-foreground/70">Invoicing Portal</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === '/invoices'
                  ? location.pathname === '/invoices'
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end={item.url === '/invoices'}>
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom user info */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
            <Button variant="ghost" size="sm" onClick={logout} className="text-sidebar-foreground/70 hover:text-sidebar-foreground px-0 mt-1 h-auto">
              <LogOut className="w-3 h-3 mr-1" /> Logout
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
