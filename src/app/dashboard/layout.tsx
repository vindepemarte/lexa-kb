'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Search,
    MessageSquare,
    Star,
    UserCircle,
    HelpCircle
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Search', path: '/dashboard/search', icon: Search },
        { name: 'Chat', path: '/dashboard/chat', icon: MessageSquare },
        { name: 'Account', path: '/dashboard/account', icon: UserCircle },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg">
                Skip to main content
            </a>
            
            {/* Background ambient glow effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
        `
            }} />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-[#1a1635]/80 backdrop-blur-xl border-r border-white/10 z-20">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white text-xl">💜</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                            Lexa KB
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => router.push(item.path)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-pink-400' : ''}`} />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-3">
                    <button
                        onClick={() => router.push('/dashboard/pricing')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
                    >
                        <Star className="w-5 h-5" />
                        <span>Upgrade Pro</span>
                    </button>

                    <a
                        href="mailto:lexa@hellolexa.space"
                        className="w-full flex items-center space-x-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                    >
                        <HelpCircle className="w-5 h-5" />
                        <span>Help & Support</span>
                    </a>

                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium text-left"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main id="main-content" className="flex-1 relative z-10 overflow-y-auto pb-20 md:pb-0 h-screen">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full bg-[#1a1635]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.path)}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-pink-400' : 'text-white/50 hover:text-white/80'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'animate-pulse-glow' : ''}`} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
