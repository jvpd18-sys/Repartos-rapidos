import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function LayoutAdmin() {
  return (
    <div className="flex min-h-screen bg-fondo">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
