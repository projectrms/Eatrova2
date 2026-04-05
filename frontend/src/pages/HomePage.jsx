import React, { useEffect, useRef } from "react";
import "../styles/HomePage.css";
import Navbar from "../components/Navbar";
import { motion, useScroll, useTransform } from "framer-motion";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function HomePage() {

  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll();

  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);

  /* LENIS SMOOTH SCROLL */
  const lenis = new Lenis({ smooth: true, lerp: 0.08 });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on("scroll", ScrollTrigger.update);

  /* HERO TEXT */
  gsap.from(".hero-content h1", { y: 120, opacity: 0, duration: 1.4, ease: "power4.out" });
  gsap.from(".hero-content p", { y: 60, opacity: 0, delay: 0.3, duration: 1.2 });

  /* INTRO */
  gsap.from(".intro", { scrollTrigger: { trigger: ".intro", start: "top 75%" }, opacity: 0, y: 100, duration: 1.4 });

  /* GALLERY: stagger one-by-one */
  gsap.utils.toArray(".gallery-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none none" },
      y: 120,
      opacity: 0,
      duration: 1.2,
      delay: i * 0.15,
      ease: "power3.out"
    });
  });

  /* SPLIT STORY */
  gsap.utils.toArray(".split").forEach((section, i) => {
    const img = section.querySelector("img");
    const text = section.querySelector(".text");

    gsap.from(img, {
      scrollTrigger: { trigger: section, start: "top 85%", end: "bottom 60%", scrub: 0.7 },
      x: i % 2 === 0 ? -150 : 150,
      opacity: 0,
      duration: 1
    });

    gsap.from(text, {
      scrollTrigger: { trigger: section, start: "top 85%", end: "bottom 60%", scrub: 0.7 },
      x: i % 2 === 0 ? 150 : -150,
      opacity: 0,
      duration: 1
    });
  });

  /* FEATURES: 3D pop-up & parallax */
  gsap.utils.toArray(".feature-card").forEach((card, i) => {
    // Entrance
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // 3D hover pop effect
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 7; // tilt intensity
      const rotateY = ((x - centerX) / centerX) * 7;
      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    });
  });

}, []);
  return (
    <>
      <Navbar />

      <div className="home" ref={containerRef}>

        <section className="hero">
  {/* Animated Background Blobs */}
  <div className="hero-bg">
    <div className="blob blob1"></div>
    <div className="blob blob2"></div>
    <div className="blob blob3"></div>
  </div>

  <div className="hero-content">
    <h1 className="eatrova-logo">
      Eatrova
    </h1>
    <p>Smart • Elegant • Fast Restaurant Management</p>
    <div className="hero-btns">
      <button
        className="hero-btn"
        onClick={() =>
          containerRef.current.querySelector(".features").scrollIntoView({ behavior: "smooth" })
        }
      >
        Explore Features
      </button>
      <button
        className="hero-btn order-btn"
        onClick={() => alert("Redirect to order page")}
      >
        Order Now
      </button>
    </div>
  </div>
</section>

        <section className="intro">
  <h2>Manage Your Restaurant Smarter</h2>
  <p>
    Eatrova helps you track orders, manage staff, analyze sales, and serve customers seamlessly.
  </p>
  <div className="intro-btns">
    <button onClick={() => containerRef.current.querySelector(".features").scrollIntoView({behavior:"smooth"})}>Features</button>
    <button onClick={() => containerRef.current.querySelector(".gallery").scrollIntoView({behavior:"smooth"})}>Menu</button>
  </div>
</section>

        {/* GALLERY */}
        <section className="gallery">
          <h2>Signature Dishes</h2>

          <div className="gallery-grid">
            {[
              { img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092", name: "Luxury Steak" },
              { img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", name: "Fresh Salad" },
              { img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d", name: "Burger Deluxe" },
              { img: "https://images.unsplash.com/photo-1529042410759-befb1204b468", name: "Fine Dessert" }
            ].map((item, i) => (
              <div className="gallery-card" key={i}>
  <img src={item.img} alt="" />
  <div className="overlay">
    <h3>{item.name}</h3>
    <p>Delicious & Fresh</p>
  </div>
</div>
            ))}
          </div>
        </section>

        {/* SPLIT STORY */}
        <section className="split">
          <img src="https://images.unsplash.com/photo-1551218808-94e220e084d2" />
          <div className="text">
            <h2>Precision in Every Order</h2>
            <p>Real-time syncing ensures flawless service speed.</p>
          </div>
        </section>

        <section className="split reverse">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d" />
          <div className="text">
            <h2>Smart Restaurant Control</h2>
            <p>Manage operations with intelligence and clarity.</p>
          </div>
        </section>

        <section className="features">
  <div className="features-head">
    <h2>Powerful Features</h2>
    <p>Everything you need to manage your restaurant smartly and efficiently.</p>
  </div>

  <div className="feature-grid">
    {[
      { title: "Live Orders", desc: "Track orders in real-time for faster service.", icon:"🛎️" },
      { title: "Analytics", desc: "Visualize sales, revenue, and customer trends.", icon:"📊" },
      { title: "Automation", desc: "Automate billing, table management, and notifications.", icon:"⚙️" },
      { title: "Staff Management", desc: "Monitor and manage chefs, waiters, and shifts.", icon:"👨‍🍳" }
    ].map((f, i) => (
      <div className="feature-card" key={i}>
        <h3>{f.icon} {f.title}</h3>
        <p>{f.desc}</p>
      </div>
    ))}
  </div>
</section>

        <section className="cta">
  <h2>Ready to Elevate Your Restaurant?</h2>
  <p>Join Eatrova and transform your restaurant operations today!</p>
  <button className="cta-btn" onClick={() => alert("Redirect to signup/demo")}>Start Now</button>
</section>
      </div>
    </>
  );
}