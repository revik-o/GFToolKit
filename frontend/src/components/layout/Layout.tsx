import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { PageTransition } from './PageTransition';
import { AnimatePresence } from 'framer-motion';

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
            <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex h-16 items-center border-b border-zinc-900 px-4 bg-zinc-950/50 backdrop-blur-md">
                    <MobileSidebar />
                    <span className="ml-4 font-bold tracking-tight text-lg">GF Tool Kit</span>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto w-full">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
