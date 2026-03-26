import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Coach",
  description: "Interview coaching dashboard — track your pipeline, stories, scores, and coaching strategy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Google Fonts loaded via link tags — works in browser even when build env can't reach Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Lora:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex">
        <TooltipProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-auto p-6 lg:p-8">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
