import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Goals from "./pages/Goals";
import Promises from "./pages/Promises";
import SocialBattery from "./pages/Battery";
import Finances from "./pages/Finances";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import InvitePartner from "./pages/InvitePartner";
import AcceptPartner from "./pages/AcceptPartner";
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/partner/accept" element={<AcceptPartner />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/invite-partner" element={<InvitePartner />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/promises" element={<Promises />} />
              <Route path="/social-battery" element={<SocialBattery />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" />
    </>
  );
}

export default App;
