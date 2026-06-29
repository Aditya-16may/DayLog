import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-5">
      <Navbar />

      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>

            <div className="lg:col-span-9">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}