import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  StickyNote,
  Target,
  HeartHandshake,
  BatteryCharging,
  Wallet,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  // { name: "Calendar", path: "/calendar", icon: CalendarDays },
  // { name: "Tasks", path: "/tasks", icon: CheckSquare },
  // { name: "Notes", path: "/notes", icon: StickyNote },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Promises", path: "/promises", icon: HeartHandshake },
  { name: "Social Battery", path: "/social-battery", icon: BatteryCharging },
  // { name: "Finances", path: "/finances", icon: Wallet },
  // { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  return (
    <div
      className={cn(
        "relative hidden lg:flex flex-col bg-zinc-950 border-r border-zinc-900 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-900">
        {!isCollapsed && (
          <span className="text-xl font-bold text-zinc-50 tracking-tight">
            GF Tool Kit
          </span>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-zinc-50 tracking-tight mx-auto">
            GF
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="absolute -right-4 top-4 h-8 w-8 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-50 hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-zinc-50",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-zinc-400",
                  isCollapsed ? "justify-center" : "justify-start",
                )
              }
            >
              <item.icon size={20} className={cn(isCollapsed ? "mb-1" : "")} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900"
        >
          <Menu size={24} />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 bg-zinc-950 border-r-zinc-900 p-0 text-zinc-50"
      >
        <SheetHeader className="p-4 border-b border-zinc-900 text-left">
          <SheetTitle className="text-xl font-bold text-zinc-50">
            GF Tool Kit
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-65px)] py-4">
          <nav className="grid gap-2 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-zinc-50",
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400"
                      : "text-zinc-400",
                  )
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
