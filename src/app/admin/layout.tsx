import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardProvider from '@/components/admin/DashboardProvider';

export const metadata = {
  title: {
    absolute: 'Admin Dashboard | SEL Teacher Tools',
  },
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f1f6ed] min-h-screen">
      <DashboardProvider>
        <AdminSidebar />
        <AdminHeader />
        {/* Main content area */}
        <main className="md:ml-64 mt-16 md:mt-20 px-4 md:px-8 py-6">
          {children}
        </main>
      </DashboardProvider>
    </div>
  );
}
