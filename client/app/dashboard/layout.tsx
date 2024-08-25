// client/app/dashboard/layout.tsx
import SideNav from '@/components/dashboard/SideNav'
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen pt-16">
      <SideNav />
      <div className="flex-grow ml-64 p-6 md:p-12">
        {children}
      </div>
    </div>
  );
}