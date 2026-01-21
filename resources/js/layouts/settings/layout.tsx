import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SettingsNavItem {
    title: string;
    routeName: string;
    icon: React.ComponentType<{ className?: string }> | null;
}

const sidebarNavItems: SettingsNavItem[] = [
    {
        title: 'Profile',
        routeName: 'profile.edit',
        icon: null,
    },
    {
        title: 'Password',
        routeName: 'user-password.edit',
        icon: null,
    },
    {
        title: 'Appearance',
        routeName: 'appearance.edit',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    // Check if current URL matches the route
    const isActive = (routeName: string) => {
        try {
            const routeUrl = route(routeName);
            // Compare pathname parts
            return url.includes(routeName.split('.')[0]) ||
                window.location.pathname.endsWith(new URL(routeUrl, window.location.origin).pathname);
        } catch {
            return false;
        }
    };

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.routeName}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isActive(item.routeName),
                                })}
                            >
                                <Link href={route(item.routeName)}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}