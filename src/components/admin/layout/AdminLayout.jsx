import NavAdmin from "./NavAdmin";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <NavAdmin />
      <main className="container mt-3">
        {children}
      </main>
    </div>
  );
}