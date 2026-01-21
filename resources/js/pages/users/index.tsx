import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Users, Plus, Search, Pencil, Trash2, Shield, User } from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
}

interface Props {
    users: UserData[];
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FormField = ({ label, required, error, children }: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {children}
        {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
);

export default function UsersIndex({ users }: Props) {
    const [search, setSearch] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selected, setSelected] = useState<UserData | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openEdit = (user: UserData) => {
        setSelected(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('users.update', selected.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelected(null);
            },
        });
    };

    const handleDelete = (user: UserData) => {
        if (user.id === 1) {
            alert('Tidak dapat menghapus akun owner.');
            return;
        }
        if (confirm(`Hapus user "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    const breadcrumbs = [
        { title: 'Manajemen User', href: route('users.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen User" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-50 rounded-xl">
                            <Users className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Manajemen User</h1>
                            <p className="text-sm text-gray-500">Kelola akun pengguna sistem</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah User
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 max-w-md">
                    <div className="bg-violet-50 rounded-xl p-4">
                        <p className="text-xs text-violet-600">Total User</p>
                        <p className="text-2xl font-bold text-violet-700">{users.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-green-600">Terverifikasi</p>
                        <p className="text-2xl font-bold text-green-700">
                            {users.filter(u => u.email_verified_at).length}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Terdaftar</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                            Tidak ada user ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${user.id === 1 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                                        {user.id === 1 ? (
                                                            <Shield className="w-4 h-4 text-amber-600" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        {user.id === 1 && (
                                                            <span className="text-xs text-amber-600 font-medium">Owner</span>
                                                        )}
                                                        <p className="text-sm text-gray-500 sm:hidden">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-sm text-gray-600">{user.email}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openEdit(user)}
                                                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    {user.id !== 1 && (
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 mt-2">
                        <FormField label="Nama" required error={createForm.errors.name}>
                            <Input
                                placeholder="Nama lengkap"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Email" required error={createForm.errors.email}>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Password" required error={createForm.errors.password}>
                            <Input
                                type="password"
                                placeholder="Minimal 8 karakter"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Konfirmasi Password" required error={createForm.errors.password_confirmation}>
                            <Input
                                type="password"
                                placeholder="Ulangi password"
                                value={createForm.data.password_confirmation}
                                onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                            />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="flex-1" disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 mt-2">
                        <FormField label="Nama" required error={editForm.errors.name}>
                            <Input
                                placeholder="Nama lengkap"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Email" required error={editForm.errors.email}>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Password Baru" error={editForm.errors.password}>
                            <Input
                                type="password"
                                placeholder="Kosongkan jika tidak ingin mengubah"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                            />
                        </FormField>

                        {editForm.data.password && (
                            <FormField label="Konfirmasi Password Baru" error={editForm.errors.password_confirmation}>
                                <Input
                                    type="password"
                                    placeholder="Ulangi password baru"
                                    value={editForm.data.password_confirmation}
                                    onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                />
                            </FormField>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="flex-1" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Update'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}