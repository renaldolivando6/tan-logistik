import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-orange-100 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 shadow-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-orange-500 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-colors" />
                {breadcrumbs.length > 0 && (
                    <div className="h-4 w-px bg-orange-200 mx-1" aria-hidden="true" />
                )}
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}