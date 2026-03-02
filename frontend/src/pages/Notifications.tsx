import { useState, useEffect } from "react";
import { BellRing, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === "undefined") return;

    // Determine WS protocol based on HTTP protocol (wss for https, ws for http)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // For local dev with vite handling proxy, or direct to Go backend at 8080
    // We assume backend is running on 8080 locally if current port is Vite's 5173
    const host =
      window.location.port === "5173" ? "localhost:8080" : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications`;

    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const newNotif: Notification = JSON.parse(event.data);
          setNotifications((prev) => [newNotif, ...prev]);
        } catch (error) {
          console.error("Failed to parse notification:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5s
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerTestNotification = async (
    type: "info" | "success" | "warning" = "info",
  ) => {
    try {
      // In a real app we would have the exact URL matching the current host/port configuration.
      const host =
        window.location.port === "5173" ? "http://localhost:8080" : "";

      const res = await fetch(`${host}/api/v1/notifications/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Notification",
          message: `This is a test message of type: ${type}`,
          type: type,
        }),
      });

      if (!res.ok) {
        console.error("Failed to trigger mock notification");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="text-emerald-400" size={20} />;
      case "warning":
        return <AlertTriangle className="text-yellow-400" size={20} />;
      default:
        return <Info className="text-blue-400" size={20} />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-zinc-400 mt-1 flex items-center gap-2">
            Stay updated with real-time alerts.
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isConnected ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50" : "bg-red-900/30 text-red-400 border border-red-800/50"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}
              ></span>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerTestNotification("info")}
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
          >
            Test Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerTestNotification("success")}
            className="bg-emerald-900/20 border-emerald-900/50 hover:bg-emerald-900/40 text-emerald-400"
          >
            Test Success
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <BellRing size={48} className="opacity-20 mb-4" />
            <p>No new notifications.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="relative group flex p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl transition-all hover:bg-zinc-900 hover:shadow-lg hover:-translate-y-0.5 animate-in fade-in slide-in-from-top-4 duration-300"
            >
              <div className="flex-shrink-0 mr-4 mt-1">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-zinc-100">{notif.title}</h4>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1 pr-6 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              <button
                onClick={() => dismissNotification(notif.id)}
                className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
