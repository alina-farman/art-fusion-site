"use client";

import { useEffect } from "react";

const sections = [
  {
    title: "1. Information We Collect",
    text: "We collect your name, email, password (encrypted), and role (Buyer/Artist) at registration. Artists also provide artwork details like title, price, dimensions, and medium. Buyers provide shipping addresses at checkout. We also collect usage data such as pages visited and artworks viewed to improve your experience.",
  },
  {
    title: "2. How We Use Your Information",
    text: "Your information is used to manage your account, process orders, send order confirmations and notifications, and improve platform performance. We do not sell, rent, or trade your personal data to any third party under any circumstances.",
  },
  {
    title: "3. Data Sharing",
    text: "Artist profiles and artworks are publicly visible. Buyer shipping details are shared only with the relevant artist for order fulfillment. We use Firebase Authentication and Cloudinary for secure login and image storage — both are bound by strict data protection agreements.",
  },
  {
    title: "4. Security & Message Protection",
    text: "All data is transmitted over HTTPS/SSL. Passwords are hashed and never stored in plain text. Our messaging system automatically hides email addresses and phone numbers shared in chats. The messaging interface also disables right-click, copy, text selection, and drag to protect conversation content.",
  },
  {
    title: "5. Your Rights",
    text: "You can update your profile and notification preferences anytime from Account Settings. You may request full account deletion by contacting support. EU users have additional rights under GDPR including data portability and the right to restrict processing.",
  },
  {
    title: "6. Changes & Contact",
    text: "We may update this policy at any time. Significant changes will be communicated via email and a platform notice. For any privacy-related questions, please reach out through the Help Center or submit a support ticket from your dashboard.",
  },
];

export default function PrivacyPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", backgroundColor: "#faf9f7" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "64px 24px 48px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#e2b96f", marginBottom: "12px" }}>Art Fusion Marketplace</p>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "700", margin: "0 0 12px" }}>Privacy Policy</h1>
        <p style={{ color: "#a0aec0", fontSize: "14px" }}>Last Updated: 2024 · Version 1.0</p>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderLeft: "4px solid #e2b96f", borderRadius: "8px", padding: "20px 24px", marginBottom: "36px", fontSize: "14px", lineHeight: "1.7", color: "#4a4a4a" }}>
          This Privacy Policy explains how <strong>Art Fusion</strong> collects, uses, and protects your personal information. By using our platform, you agree to the practices described below.
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