import "./globals.css";
import { Sidebar } from "../components/sidebar";

export const metadata = { title: "WorkerOS — governed AI workers" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Sidebar />
          <main className="content">
            <header className="topbar">
              <span className="eyebrow">workspace / acme operations</span>
              <div className="topbar-right">
                <span className="pulse">
                  <i className="dot" /> all systems nominal
                </span>
                <div className="avatar">AM</div>
              </div>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
