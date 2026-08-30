import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="pt-16 pb-14 lg:pb-6 lg:pl-16">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
