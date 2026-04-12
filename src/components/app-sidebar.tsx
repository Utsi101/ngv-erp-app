'use client';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Building2, FileText, LayoutDashboard, Package, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Profile', href: '/profile', icon: Settings },
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Buyers', href: '/buyers', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();

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
      <nav className="flex-1 px-2 py-3 space-y-0.5">
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
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[10px] text-sidebar-foreground/40">v0.1.0 &middot; India Export</p>
      </div>
    </aside>
  );
}
