import DashboardLayout from "../components/DashboardLayout";
import PostJobForm from "./PostJobForm";

const menuItems = [
  "Account Settings",
  "Freelancers",
  "Inbox",
  "Payments",
  "Projects",
  "Post a Job",
];

const contentMap = {
  "Account Settings": (
    <>
      <h1>Account Settings</h1>
      <p>Edit profile, password and more.</p>
    </>
  ),
  "Freelancers": (
    <>
      <h1>Freelancers</h1>
      <p>View or manage freelancers you've worked with.</p>
    </>
  ),
  "Inbox": (
    <>
      <h1>Inbox</h1>
      <p>Your messages with freelancers.</p>
    </>
  ),
  "Payments": (
    <>
      <h1>Payments</h1>
      <p>Review invoices and payment history.</p>
    </>
  ),
  "Projects": (
    <>
      <h1>Projects</h1>
      <p>See current and past projects with freelancers.</p>
    </>
  ),
  "Post a Job": <PostJobForm embed />,
};

export default function ClientDashboard() {
  return (
    <DashboardLayout
      role="Clients"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}

