import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    // Tambah prop variant: 'sidebar' untuk teks putih, 'dropdown' untuk teks gelap
    variant = 'sidebar',
}: {
    user: User;
    showEmail?: boolean;
    variant?: 'sidebar' | 'dropdown';
}) {
    const getInitials = useInitials();

    const isSidebar = variant === 'sidebar';

    return (
        <>
            <Avatar className={`h-8 w-8 overflow-hidden rounded-full ${isSidebar ? 'ring-2 ring-white/30' : 'ring-2 ring-orange-200'}`}>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className={`rounded-full font-semibold text-xs ${isSidebar ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'}`}>
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className={`truncate font-semibold ${isSidebar ? 'text-white' : 'text-neutral-800'}`}>
                    {user.name}
                </span>
                {showEmail && (
                    <span className={`truncate text-xs ${isSidebar ? 'text-white/60' : 'text-neutral-500'}`}>
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}