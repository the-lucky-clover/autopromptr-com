import React from "react";

// Hero image path (replace with your actual image if needed)
const heroImage = "/your-hero-image.png";

// Video background from Pexels
const videoUrl = "https://videos.pexels.com/video-files/9341428/9341428-uhd_2560_1440_24fps.mp4";
const videoAttribUrl = "https://www.pexels.com/video/stars-in-the-the-night-sky-9341428/";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#fff", position: "relative" }}>
      {/* Video background */}
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          top: 0,
          left: 0,
          zIndex: 0,
          opacity: 0.5
        }}
      />
      {/* Attribution in lower right */}
      <div style={{
        position: "fixed",
        right: 12,
        bottom: 10,
        zIndex: 10,
        fontSize: 11,
        color: "#b3b8c5",
        opacity: 0.8,
        pointerEvents: "auto"
      }}>
        Video by <a href={videoAttribUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#7b61ff", textDecoration: "underline" }}>Pexels</a>
      </div>
      {/* Navbar */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "2rem 3vw 1.5rem 3vw",
        background: "transparent",
        position: "relative",
        zIndex: 2
      }}>
        <div style={{ display: "flex", alignItems: "center", fontWeight: 700, fontSize: 28, color: "#a78bfa" }}>
          <span style={{ color: "#a78bfa", fontSize: 32, marginRight: 8 }}>⚡</span> AutoPromptr
        </div>
        <nav style={{ display: "flex", gap: 36, fontSize: 18, fontWeight: 500 }}>
          <a href="#features" style={{ color: "#fff", textDecoration: "none" }}>Features</a>
          <a href="#templates" style={{ color: "#fff", textDecoration: "none" }}>Templates</a>
          <a href="#pricing" style={{ color: "#fff", textDecoration: "none" }}>Pricing</a>
        </nav>
        <a href="/signup" style={{
          background: "linear-gradient(90deg, #7b61ff 0%, #4f8cff 100%)",
          color: "#fff",
          padding: "0.75rem 2rem",
          borderRadius: 32,
          fontWeight: 700,
          fontSize: 18,
          textDecoration: "none",
          boxShadow: "0 2px 8px #0003"
        }}>Get Started</a>
      </header>
      {/* Hero Section */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        padding: "4rem 2vw 2rem 2vw",
        position: "relative"
      }}>
        <div style={{
          background: "rgba(26,26,46,0.7)",
          borderRadius: 32,
          padding: "2.5rem 2rem 2rem 2rem",
          maxWidth: 800,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 32px #0008"
        }}>
          <h1 style={{ fontSize: 54, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
            <span style={{ color: "#7b61ff" }}>Supercharge</span> <span style={{ color: "#fff" }}>Your AI</span><br/>
            <span style={{ color: "#fff" }}>Prompt Workflow</span>
          </h1>
          <p style={{ fontSize: 22, color: "#e0e0e0", margin: "2rem 0 2.5rem 0" }}>
            Supercharge your productivity with intelligent prompt optimization, batch processing, and seamless deployment across all major AI platforms
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 32 }}>
            <a href="/signup" style={{
              background: "linear-gradient(90deg, #7b61ff 0%, #4f8cff 100%)",
              color: "#fff",
              padding: "1rem 2.5rem",
              borderRadius: 32,
              fontWeight: 700,
              fontSize: 22,
              textDecoration: "none",
              boxShadow: "0 2px 8px #0003"
            }}>Get Started →</a>
            <a href="/signin" style={{
              background: "transparent",
              color: "#fff",
              padding: "1rem 2.5rem",
              borderRadius: 32,
              fontWeight: 700,
              fontSize: 22,
              textDecoration: "none",
              border: "2px solid #fff"
            }}>Sign In</a>
          </div>
          <img src={heroImage} alt="Hero" style={{ maxWidth: "700px", width: "100%", borderRadius: "1.5rem", boxShadow: "0 4px 32px #0008", margin: "0 auto" }} />
        </div>
      </section>
    </div>
  );
}
