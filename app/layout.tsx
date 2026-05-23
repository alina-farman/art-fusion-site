import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Art Fusion | Premium Art Marketplace",
  description:
    "Discover and collect exceptional artworks from talented artists worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider — poori app mein user state available rahega */}
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
