import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudHost Portal - Next-Gen WHMCS & cPanel Hosting CMS",
  description: "Modern, open-source hosting management portal with automated WHM & cPanel provisioning and 1-click SSO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full flex flex-col font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
