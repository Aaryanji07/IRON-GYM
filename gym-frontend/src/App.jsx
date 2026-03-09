import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Landing      from "./pages/Landing";
import Login        from "./pages/Login";
import RegisterClient from "./pages/RegisterClient";
import RegisterOwner  from "./pages/RegisterOwner";

// Admin
import AdminBookings  from "./admin/AdminBookings";
import AdminDashboard from "./admin/AdminDashboard";
import AdminGyms      from "./admin/AdminGyms";
import AdminUsers     from "./admin/AdminUsers";


// Gym Owner
import OwnerDashboard from "./owner/OwnerDashboard";
import OwnerGym       from "./owner/OwnerGym";
import OwnerSlots     from "./owner/OwnerSlots";
import OwnerBookings  from "./owner/OwnerBookings";

// Client
import ClientDashboard from "./client/ClientDashboard";
import ClientGyms      from "./client/ClientGyms";
import ClientGymDetail from "./client/ClientGymDetail";
import ClientBookings  from "./client/ClientBookings";

const getUser = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };

const Guard = ({ role, children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"                  element={<Landing />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register/client"   element={<RegisterClient />} />
        <Route path="/register/owner"    element={<RegisterOwner />} />

        {/* Admin */}
        <Route path="/admin"             element={<Guard role="admin"><AdminDashboard /></Guard>} />
        <Route path="/admin/gyms"        element={<Guard role="admin"><AdminGyms /></Guard>} />
        <Route path="/admin/users"       element={<Guard role="admin"><AdminUsers /></Guard>} />
        <Route path="/admin/bookings"    element={<Guard role="admin"><AdminBookings /></Guard>} />

        {/* Gym Owner */}
        <Route path="/owner"             element={<Guard role="gym_owner"><OwnerDashboard /></Guard>} />
        <Route path="/owner/gym"         element={<Guard role="gym_owner"><OwnerGym /></Guard>} />
        <Route path="/owner/slots"       element={<Guard role="gym_owner"><OwnerSlots /></Guard>} />
        <Route path="/owner/bookings"    element={<Guard role="gym_owner"><OwnerBookings /></Guard>} />

        {/* Client */}
        <Route path="/client"            element={<Guard role="client"><ClientDashboard /></Guard>} />
        <Route path="/client/gyms"       element={<Guard role="client"><ClientGyms /></Guard>} />
        <Route path="/client/gym/:id"    element={<Guard role="client"><ClientGymDetail /></Guard>} />
        <Route path="/client/bookings"   element={<Guard role="client"><ClientBookings /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}