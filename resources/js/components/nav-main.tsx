import { Link } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { type NavItem } from '@/types';

interface NavMainProps {
    label: string;
    items: NavItem[];
}

export function NavMain({ label, items = [] }: NavMainProps) {
    const { urlIsActive } = useActiveUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            {/* Label group: putih semi-transparan */}
            <SidebarGroupLabel className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={urlIsActive(item.href)}
                            tooltip={{ children: item.title }}
                            className={
                                urlIsActive(item.href)
                                    ? 'bg-white/20 text-white font-semibold [&>svg]:text-white hover:bg-white/25 hover:text-white'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white [&>svg]:text-white/70'
                            }
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}