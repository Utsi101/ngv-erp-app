'use client';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Profile', href: '/profile', icon: Settings },
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Buyers', href: '/buyers', icon: Users },
];

const submenu = [
  { name: 'All Orders', href: '/orders', icon: FileText },
  { name: 'New Order', href: '/orders/create', icon: Plus },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [ordersExpanded, setOrdersExpanded] = useState(false);

  // Auto-expand Orders menu if on /dashboard/orders route
  useEffect(() => {
    if (pathname.startsWith('/orders')) {
      setOrdersExpanded(true);
    } else {
      setOrdersExpanded(false);
    }
  }, [pathname]);

  return (
    <aside className="flex h-full w-56 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-4">
        <Building2 className="h-5 w-5 text-sidebar-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">NGV Export</span>
          <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
            Leather ERP
          </span>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {/* Regular navigation items */}
        {navigation.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.name}
            </Link>
          );
        })}

        {/* Collapsible Orders Menu */}
        <div className="space-y-1">
          <button
            onClick={() => setOrdersExpanded(!ordersExpanded)}
            className={cn(
              'w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              pathname.startsWith('/dashboard/orders')
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Orders</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                ordersExpanded ? 'rotate-180' : ''
              )}
            />
          </button>

          {/* Submenu Items */}
          {ordersExpanded && (
            <div className="space-y-0.5 overflow-hidden animate-in fade-in duration-200">
              {submenu.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors pl-8',
                      isActive
                        ? 'bg-sidebar-accent/60 text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[10px] text-sidebar-foreground/40">v0.1.0 &middot; India Export</p>
      </div>
    </aside>
  );
}
