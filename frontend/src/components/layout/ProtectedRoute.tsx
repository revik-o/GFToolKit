import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export function ProtectedRoute() {
  const token = Cookies.get("token");
  const location = useLocation();
  const [partnerStatus, setPartnerStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    async function checkPartner() {
      if (!token) {
        setPartnerStatus("disconnected");
        return;
      }

      const { data, error } = await fetchApi<{ has_partner: boolean }>("/api/v1/partner/status");
      if (error || !data?.has_partner) {
        setPartnerStatus("disconnected");
      } else {
        setPartnerStatus("connected");
      }
    }

    checkPartner();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (partnerStatus === "checking") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (partnerStatus === "disconnected" && location.pathname !== "/invite-partner") {
    return <Navigate to="/invite-partner" replace />;
  }

  if (partnerStatus === "connected" && location.pathname === "/invite-partner") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
