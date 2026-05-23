"use client";

import { useEffect } from "react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    text: "By accessing or using Art Fusion, you confirm that you have read and agree to these Terms and Conditions. If you do not agree, you must not use the platform. Art Fusion reserves the right to modify these terms at any time — continued use after changes constitutes acceptance.",
  },
  {
    title: "2. Eligibility & Accounts",
    text: "You must be at least 13 years old to register. Each user may hold one account. Art Fusion offers two roles: Buyer (browse and purchase artworks) and Artist (upload and sell artworks). You are responsible for keeping your login credentials confidential and for all activity under your account.",
  },
  {
    title: "3. Artist Responsibilities",
    text: "By uploading artwork, you confirm you are the original creator or hold full legal rights to sell it. Listings must be accurate in title, price, dimensions, and medium. Art Fusion charges a platform commission on each sale — artists receive the remaining payout. All uploads are subject to admin review and may be approved, rejected, featured, or removed.",
  },
  {
    title: "4. Buyer Responsibilities",
    text: "By placing an order you agree to pay the listed price plus applicable shipping. Orders are confirmed upon receiving an email with a unique order number. Cancellations are only possible before the order is fulfilled. Refund requests must be submitted through the Order Management section and are subject to admin review.",
  },
  {
    title: "5. Messaging & Conduct",
    text: "All communication between buyers and artists must remain within Art Fusion's internal messaging system. Attempting to move transactions off-platform is a violation of these terms. Our system automatically hides emails and phone numbers in messages. Harassment, spam, hate speech, or any abusive behavior will result in immediate suspension.",
  },
  {
    title: "6. Intellectual Property",
    text: "Purchasing an artwork transfers physical ownership only — copyright and reproduction rights remain with the artist unless explicitly stated otherwise. Art Fusion's platform design, logo, and technology are proprietary and may not be copied or redistributed without written consent.",
  },
  {
    title: "7. Suspension & Liability",
    text: "Art Fusion may suspend or permanently ban any account that violates these terms, engages in fraud, or disrupts the platform. Art Fusion acts solely as a marketplace intermediary and is not liable for disputes over artwork authenticity, quality, or delivery. We do not guarantee uninterrupted platform availability.",
  },
  {
    title: "8. Contact & Support",
    text: "For any questions about these terms, please contact our support team through the Help Center or by submitting a support ticket from your account dashboard.",
  },
];

export default function TermsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", backgroundColor: "#faf9f7" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "64px 24px 48px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#e2b96f", marginBottom: "12px" }}>Art Fusion Marketplace</p>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "700", margin: "0 0 12px" }}>Terms & Conditions</h1>
        <p style={{ color: "#a0aec0", fontSize: "14px" }}>Last Updated: 2024 · Version 1.0</p>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderLeft: "4px solid #e2b96f", borderRadius: "8px", padding: "20px 24px", marginBottom: "36px", fontSize: "14px", lineHeight: "1.7", color: "#4a4a4a" }}>
          Please read these Terms and Conditions carefully before using <strong>Art Fusion</strong>. They govern your use of our marketplace and outline the rights and responsibilities of all users.
        </div>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: "28px", paddingBottom: "28px", borderBottom: i < sections.length - 1 ? "1px solid #e8e4dc" : "none" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>{s.title}</h2>
            <p style={{ fontSize: "14px", lineHeight: "1.75", color: "#555", margin: 0 }}>{s.text}</p>
          </div>
        ))}

        <div style={{ textAlign: "center", paddingTop: "24px", color: "#bbb", fontSize: "12px" }}>
          © {new Date().getFullYear()} Art Fusion. All rights reserved.
        </div>
      </div>
    </div>
  );
}