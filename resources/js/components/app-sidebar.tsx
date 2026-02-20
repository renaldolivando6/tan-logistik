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
    MapPin,
    Shield,
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
                {
                    title: 'Pelanggan',
                    href: route('pelanggan.index'),
                    icon: Users,
                },
                {
                    title: 'Lokasi',
                    href: route('lokasi.index'),
                    icon: MapPin,
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
                    title: 'Biaya Maintenance',
                    href: route('biaya-maintenance.index'),
                    icon: Receipt,
                },
            ],
        },
        {
            label: 'Laporan',
            items: [
                {
                    title: 'Laporan Biaya',
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
        ...(isOwner ? [{
            label: 'Pengaturan',
            items: [
                {
                    title: 'Manajemen User',
                    href: route('users.index'),
                    icon: Users,
                },
                {
                    title: 'Owner Menu',
                    href: route('owner.trip-status-override'),
                    icon: Shield,
                },
            ],
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header: oranye terang atas */}
            <SidebarHeader className="tan-sidebar-header">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-white/10 active:bg-white/15"
                        >
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content: oranye tengah → merah gelap */}
            <SidebarContent className="tan-sidebar-content">
                {navGroups.map((group) => (
                    <NavMain key={group.label} label={group.label} items={group.items} />
                ))}
            </SidebarContent>

            {/* Footer: merah gelap terbawah */}
            <SidebarFooter className="tan-sidebar-footer">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}