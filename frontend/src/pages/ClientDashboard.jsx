import DashboardLayout from "../components/DashboardLayout";

export default function ClientDashboard() {
  return (
    <DashboardLayout role="Client" menuItems={["Account", "Freelancers", "Inbox", "Payments", "Projects"]}>
      <h1 className="text-3xl font-bold text-[#1abc9c] mb-4">Welcome to the Client Dashboard</h1>
      <p className="text-gray-400">Manage your freelancers and projects from here.</p>
    </DashboardLayout>
  );
}