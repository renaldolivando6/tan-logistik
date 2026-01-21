import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Truck,
    Tags,
    Navigation,
    Receipt,
    FileBarChart,
    Wallet,
    Users,
    FileCheck,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';

import AppLogo from './app-logo';

// Grouped navigation structure
export interface NavGroup {
    label: string;
    items: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isOwner = auth.user?.id === 1;

    const navGroups: NavGroup[] = [
        {
            label: 'Menu',
            items: [
                {
                    title: 'Dashboard',
                    href: route('dashboard'),
                    icon: LayoutGrid,
                },
            ],
        },
        {
            label: 'Master Data',
            items: [
                {
                    title: 'Kendaraan',
                    href: route('kendaraan.index'),
                    icon: Truck,
                },
                {
                    title: 'Kategori Biaya',
                    href: route('kategori-biaya.index'),
                    icon: Tags,
                },
            ],
        },
        {
            label: 'Transaksi',
            items: [
                {
                    title: 'Trip',
                    href: route('trip.index'),
                    icon: Navigation,
                },
                {
                    title: 'Biaya Operasional',
                    href: route('biaya-operasional.index'),
                    icon: Receipt,
                },
                {
                    title: 'Checklist Surat Jalan',
                    href: route('checklist-surat-jalan.index'),
                    icon: FileCheck,
                },
            ],
        },
        {
            label: 'Laporan',
            items: [
                {
                    title: 'Biaya per Kendaraan',
                    href: route('laporan.biaya-kendaraan'),
                    icon: FileBarChart,
                },
                {
                    title: 'Rekap Uang Sangu',
                    href: route('laporan.uang-sangu'),
                    icon: Wallet,
                },
            ],
        },
        // Menu khusus Owner (hanya muncul jika user id = 1)
        ...(isOwner ? [{
            label: 'Pengaturan',
            items: [
                {
                    title: 'Manajemen User',
                    href: route('users.index'),
                    icon: Users,
                },
            ],
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <NavMain key={group.label} label={group.label} items={group.items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}