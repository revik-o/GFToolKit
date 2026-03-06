import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  BatteryFull,
  BatteryMedium,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/features/battery/ParticleBackground";

export default function SocialBattery() {
  const [audience, setAudience] = useState<"Him" | "Her">("Him");
  const [batteryLevel, setBatteryLevel] = useState<number>(100);

  const loadBattery = useCallback(async () => {
    const { data, error } = await fetchApi<{ level: number }>(
      `/api/v1/social/battery/read?audience=${audience}`,
    );
    if (error) {
      toast.error("Failed to load battery level");
      return;
    }
    if (data) {
      setBatteryLevel(data.level);
    }
  }, [audience]);

  useEffect(() => {
    const fetchBattery = async () => {
      await loadBattery();
    };
    fetchBattery();
  }, [loadBattery]);

  const updateBattery = async (level: number) => {
    setBatteryLevel(level); // Optimistic update

    const { error } = await fetchApi("/api/v1/social/battery/update", {
      method: "PUT",
      body: JSON.stringify({
        level,
        target_audience: audience,
      }),
    });

    if (error) {
      toast.error("Failed to update battery level");
      loadBattery(); // Revert on failure
    }
  };

  // Determine battery color based on level
  const getBatteryColor = useCallback((level: number) => {
    if (level > 70) return "bg-white";
    if (level > 30) return "bg-yellow-500";
    return "bg-red-500";
  }, []);

  // Determine which icon represents the state
  const getBatteryIcon = (level: number) => {
    if (level > 70)
      return <BatteryFull size={120} className="text-emerald-500 opacity-20" />;
    if (level > 30)
      return (
        <BatteryMedium size={120} className="text-yellow-500 opacity-20" />
      );
    if (level > 0)
      return <BatteryWarning size={120} className="text-red-500 opacity-20" />;
    return <Battery size={120} className="text-zinc-700 opacity-20" />;
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Battery</h1>
          <p className="text-zinc-400 mt-1">
            Check in on each other's energy levels in real-time.
          </p>
        </div>

        <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAudience("Him")}
            className={
              audience === "Him"
                ? "bg-blue-900/50 text-blue-300"
                : "text-zinc-400"
            }
          >
            Him's Battery
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAudience("Her")}
            className={
              audience === "Her"
                ? "bg-pink-900/50 text-pink-300"
                : "text-zinc-400"
            }
          >
            Her's Battery
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-center justify-center flex-1 max-w-5xl mx-auto w-full">
        <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <ParticleBackground batteryLevel={batteryLevel} />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {getBatteryIcon(batteryLevel)}
          </div>

          <div className="relative z-10 w-48 h-80 rounded-[2rem] border-8 border-zinc-800 bg-zinc-950 p-2 flex flex-col justify-end shadow-2xl relative overflow-hidden">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-800 rounded-t-lg"></div>

            <div
              className={`w-full rounded-[1.25rem] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${getBatteryColor(batteryLevel)}`}
              style={{ height: `${batteryLevel}%` }}
            >
              {batteryLevel === 100 && (
                <Zap
                  size={48}
                  className="text-emerald-950 opacity-20 absolute"
                />
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
              <span className="text-4xl font-black text-white">
                {batteryLevel}%
              </span>
            </div>
          </div>

          <p className="mt-8 text-lg font-medium text-zinc-300 text-center relative z-10 transition-colors">
            {batteryLevel > 70
              ? "Ready for anything!"
              : batteryLevel > 30
                ? "Doing okay, might need a break soon."
                : batteryLevel > 0
                  ? "Running on fumes, need quiet time."
                  : "Completely drained. Do not disturb."}
          </p>
        </div>

        <div className="flex-1 w-full max-w-md flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Update Level
          </h3>

          <Button
            variant="outline"
            className={`h-14 justify-between text-left font-medium border-zinc-800 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-900/50 ${batteryLevel === 100 ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/50" : "bg-transparent text-zinc-300"}`}
            onClick={() => updateBattery(100)}
          >
            <span className="flex items-center gap-3">
              <BatteryCharging size={18} /> Fully Charged
            </span>
            <span className="text-zinc-500">100%</span>
          </Button>

          <Button
            variant="outline"
            className={`h-14 justify-between text-left font-medium border-zinc-800 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-900/50 ${batteryLevel === 90 ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/50" : "bg-transparent text-zinc-300"}`}
            onClick={() => updateBattery(90)}
          >
            <span className="flex items-center gap-3">
              <BatteryFull size={18} /> High Energy
            </span>
            <span className="text-zinc-500">90%</span>
          </Button>

          <Button
            variant="outline"
            className={`h-14 justify-between text-left font-medium border-zinc-800 hover:bg-yellow-900/20 hover:text-yellow-400 hover:border-yellow-900/50 ${batteryLevel === 70 ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/50" : "bg-transparent text-zinc-300"}`}
            onClick={() => updateBattery(70)}
          >
            <span className="flex items-center gap-3">
              <BatteryMedium size={18} /> Something In Between
            </span>
            <span className="text-zinc-500">70%</span>
          </Button>

          <Button
            variant="outline"
            className={`h-14 justify-between text-left font-medium border-zinc-800 hover:bg-yellow-900/20 hover:text-yellow-400 hover:border-yellow-900/50 ${batteryLevel === 50 ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/50" : "bg-transparent text-zinc-300"}`}
            onClick={() => updateBattery(50)}
          >
            <span className="flex items-center gap-3">
              <BatteryMedium size={18} className="opacity-70" /> Halfway There
            </span>
            <span className="text-zinc-500">50%</span>
          </Button>

          <Button
            variant="outline"
            className={`h-14 justify-between text-left font-medium border-zinc-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 ${batteryLevel === 30 ? "bg-red-900/20 text-red-400 border-red-900/50" : "bg-transparent text-zinc-300"}`}
            onClick={() => updateBattery(30)}
          >
            <span className="flex items-center gap-3">
              <BatteryWarning size={18} /> Running Low
            </span>
            <span className="text-zinc-500">30%</span>
          </Button>

          <Button
            variant="outline"
            className={`h-14 justify-between text-left font-medium border-zinc-800 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50 ${batteryLevel === 0 ? "bg-red-900/20 text-red-500 border-red-900/50" : "bg-transparent text-zinc-300"}`}
            onClick={() => updateBattery(0)}
          >
            <span className="flex items-center gap-3">
              <Battery size={18} className="text-red-500" /> Completely Drained
            </span>
            <span className="text-zinc-500">0%</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
