import Link from "next/link";
import { Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";


const socialLinks = [
  {
    name: "Facebook",
    icon: FaFacebook,
    href: "https://www.facebook.com/share/18UYqB7XnY/",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/art_studio_by_fm?igsh=MXAzOGxpd2c2bDA1Mw==",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    href: "https://www.youtube.com/@art_studio_by_fm",
  },
];

const WHATSAPP_NUMBER = "923171600275";
const WHATSAPP_DISPLAY = "+92 317 1600275";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Links */}
        <div className="grid grid-cols-1 gap-2 place-items-center text-center">
          {/* Brand */}
          <div className="grid grid-cols-1 gap-2">
            {/* Brand */}
            <div className="w-full flex flex-col items-center">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo.jpeg"
                  alt="logo"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span
                  className="text-2xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Art Fusion
                </span>
              </Link>

              <p className="mt-4 text-sm text-muted-foreground max-w-md">
                Connecting artists and collectors worldwide. Discover, collect,
                and celebrate exceptional artworks.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

              {/* WhatsApp Badge — pill style */}
              <Link
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-0 group"
                aria-label="Chat on WhatsApp"
              >
                {/* Icon circle */}
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full z-10 shadow-md transition-transform group-hover:scale-105"
                  style={{ background: "#25D366" }}
                >
                  <FaWhatsapp className="h-5 w-5 text-white" />
                </span>
 
                {/* Number pill — slightly overlaps the icon */}
                <span
                  className="flex h-9 items-center rounded-r-full pl-4 pr-5 text-sm font-medium transition-all duration-200 group-hover:bg-[#25D366] group-hover:text-white"
                  style={{
                    background: "#B7EFC5",
                    color: "#1a7a3c",
                    marginLeft: "-6px",
                    letterSpacing: "0.03em",
                  }}
                >
                  {WHATSAPP_DISPLAY}
                </span>
              </Link>
            </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Art Fusion. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
