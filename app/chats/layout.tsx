import { AppSidebar } from "@/components/app-sidebar";
import SectionChatList from "@/components/section-chat-list";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col px-6">
              <div className="flex gap-4 py-4 md:gap-6 md:py-6 h-full">
                {/* <Section Chat List /> */}
                <div className="p-4 rounded-md shadow-md max-w-75 flex-1 h-full">
                  <SectionChatList />
                </div>

                {/* <Section Chat /> */}
                <div className="p-4 rounded-md shadow-md  flex-1 h-full ">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </section>
  );
}
