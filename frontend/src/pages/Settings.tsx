import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SettingsPayload = {
    avatar_url: string;
    theme: string;
    username?: string;
    password?: string;
    partner_email?: string;
};

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [avatarUrl, setAvatarUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [partnerEmail, setPartnerEmail] = useState('');
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        const loadSettings = async () => {
            // Parallel fetches to hydrate form
            const [settingsRes, userRes] = await Promise.all([
                fetchApi<{ avatar_url: string; theme: string }>('/api/v1/user/settings/read'),
                fetchApi<{ username: string }>('/api/v1/user/read')
            ]);

            if (settingsRes.data) {
                setAvatarUrl(settingsRes.data.avatar_url || '');
                setTheme(settingsRes.data.theme || 'system');
            }
            if (userRes.data) {
                setUsername(userRes.data.username || '');
            }

            setLoading(false);
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);

        const payload: SettingsPayload = {
            avatar_url: avatarUrl,
            theme,
        };
        if (username.trim()) payload.username = username.trim();
        if (password.trim()) payload.password = password.trim();
        if (partnerEmail.trim()) payload.partner_email = partnerEmail.trim();

        const { error } = await fetchApi('/api/v1/user/settings/update', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        setSaving(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success('Settings updated successfully!');
            setPassword(''); // clear password field
            setPartnerEmail(''); // clear email field after link instruction
        }
    };

    if (loading) {
        return (
            <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6 items-center justify-center">
                <span className="text-zinc-400">Loading your profile...</span>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6 overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-zinc-400 mt-1">Manage your account preferences and partner configurations</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-5xl">

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription className="text-zinc-400">Update your account identity and avatar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="avatarUrl" className="text-zinc-300">Avatar URL</Label>
                            <Input
                                id="avatarUrl"
                                placeholder="https://example.com/image.png"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 focus-visible:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-zinc-300">Display Name</Label>
                            <Input
                                id="username"
                                placeholder="AwesomeUser123"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 focus-visible:ring-indigo-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription className="text-zinc-400">Update your credentials. Leave blank to keep current password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter a new password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 focus-visible:ring-indigo-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <CardHeader>
                        <CardTitle>Visual Theme</CardTitle>
                        <CardDescription className="text-zinc-400">Customize the application aesthetics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Theme Mode</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full focus:ring-indigo-500">
                                    <SelectValue placeholder="System" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                    <SelectItem value="system">System (Auto)</SelectItem>
                                    <SelectItem value="light">Light Mode</SelectItem>
                                    <SelectItem value="dark">Dark Mode</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <CardHeader>
                        <CardTitle>Partner Connection</CardTitle>
                        <CardDescription className="text-zinc-400">Link your account with your partner's email address and share resources</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="partnerAuth" className="text-zinc-300">Partner Email</Label>
                            <Input
                                id="partnerAuth"
                                type="email"
                                placeholder="partner@gmail.com"
                                value={partnerEmail}
                                onChange={(e) => setPartnerEmail(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 focus-visible:ring-indigo-500"
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="mt-8 mb-4 max-w-5xl flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
}
