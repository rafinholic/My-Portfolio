import React, { useState, useEffect, useRef } from "react";
import { Project, PortfolioSettings } from "../types";
import { ExternalLink, Github, Mail, Send, CheckCircle2, ChevronRight, X, Download } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required." }).max(100, { message: "Name can be at most 100 characters." }),
  email: z.string().trim().min(1, { message: "Email is required." }).email({ message: "Please provide a valid email address." }),
  subject: z.string().trim().max(150, { message: "Subject can be at most 150 characters." }).optional().or(z.literal("")),
  message: z.string().trim().min(1, { message: "Message content is required." }).min(10, { message: "Message must be at least 10 characters." }).max(2000, { message: "Message can be at most 2000 characters." }),
});

interface PortfolioViewProps {
  settings: PortfolioSettings;
  projects: Project[];
  onMessageSent: (success: boolean, text: string) => void;
}

export default function PortfolioView({ settings, projects, onMessageSent }: PortfolioViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Elegant nodes / particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1,
      });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      mouse.x = (e.clientX - rect.left) * scaleX;
      mouse.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const isDarkMode = () => document.documentElement.classList.contains("dark");

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      // Use higher contrast or softer colors that match the yellow bg and dark mode bg
      const strokeColor = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(10, 10, 10, 0.08)";
      const dotColor = dark ? "rgba(255, 255, 255, 0.3)" : "rgba(10, 10, 10, 0.35)";
      const hoverLineColor = dark ? "rgba(255, 255, 255, 0.2)" : "rgba(10, 10, 10, 0.18)";

      // Draw elegant grid lines in background
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5;
      const gridSpacing = 20;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw interactive lines to mouse
      if (mouse.x > 0 && mouse.y > 0) {
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = hoverLineColor;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Contact state
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  // Extract unique categories dynamically
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  // Filter projects
  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const field = name as "name" | "email" | "subject" | "message";
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, text: "" });
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; subject?: string; message?: string } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "name" || path === "email" || path === "subject" || path === "message") {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitStatus({ type: "error", text: "Please correct the highlighted validation errors." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          text: "Thank you! Your message has been received successfully.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
        onMessageSent(true, "Message sent!");
      } else {
        setSubmitStatus({
          type: "error",
          text: data.error || "An error occurred. Please try again.",
        });
        onMessageSent(false, data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus({
        type: "error",
        text: "Could not reach the server. Please verify your connection.",
      });
      onMessageSent(false, "Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-16 space-y-28 scroll-smooth selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
      
      {/* 1. Hero Section */}
      <section
        className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center min-h-[55vh] py-12"
        id="hero-section"
      >
        <div className="md:col-span-7 space-y-6 animate-fade-in">
          <h1 className="font-serif font-light text-5xl sm:text-7xl lg:text-8xl text-[#0A0A0A] dark:text-white leading-[1.05] tracking-tight">
            Hi, I am <span className="font-semibold block sm:inline italic text-[#0A0A0A] dark:text-[#F5F5F5]">{settings.name}</span>
          </h1>
          <h2 className="font-mono italic font-medium text-2xl sm:text-3xl text-zinc-600 dark:text-zinc-350">
            {settings.title}
          </h2>
          <p className="font-mono lowercase font-light text-zinc-500 dark:text-zinc-400 max-w-2xl text-base sm:text-lg leading-relaxed border-l border-zinc-250 dark:border-zinc-800 pl-6">
            {settings.bio}
          </p>
        </div>
        
        <div className="md:col-span-5 flex justify-center items-center h-full w-full animate-fade-in">
          <div className="w-full max-w-[577px] border border-zinc-900/10 dark:border-white/10 p-2 bg-[#FAF9F6]/20 dark:bg-[#0A0A0A]/20 backdrop-blur-sm self-center">
            <canvas
              ref={canvasRef}
              className="home-hero-canvas w-full h-auto block bg-transparent"
              aria-hidden="true"
              width="577"
              height="300"
            />
          </div>
        </div>
      </section>

      {/* 2. Project Gallery Section */}
      <section className="space-y-12" id="gallery-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200/60 dark:border-zinc-850 pb-6">
          <div className="space-y-2">
            <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[#0A0A0A] dark:text-white">
              Selected Works
            </h2>
            <p className="font-sans font-light text-zinc-450 dark:text-zinc-400 text-sm">
              An interactive collection of creative design, engineering systems, and visual narratives.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1 bg-transparent border border-zinc-200/80 dark:border-zinc-800 p-1 rounded-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-none text-[10px] font-mono uppercase tracking-widest cursor-pointer transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-[#FAF9F6] dark:bg-white dark:text-zinc-950 font-semibold"
                    : "text-zinc-455 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
                id={`filter-tab-${cat.replace(/\s+/g, "-")}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((proj) => (
            <article
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className="group flex flex-col bg-white dark:bg-[#121212] rounded-none border border-zinc-205 dark:border-zinc-850 hover:border-zinc-400 dark:hover:border-zinc-650 overflow-hidden cursor-pointer shadow-none transition-all duration-300"
              id={`project-card-${proj.id}`}
            >
              {/* Media Container */}
              <div className="relative aspect-video w-full bg-[#FAF9F6] dark:bg-zinc-900 overflow-hidden border-b border-zinc-200/50 dark:border-zinc-800/40">
                <img
                  src={proj.image}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-950/95 px-2.5 py-1 rounded-none text-[8px] font-mono tracking-widest uppercase text-zinc-550 dark:text-zinc-350 border border-zinc-250/20">
                  {proj.category}
                </div>
                {proj.featured && (
                  <div className="absolute top-3 right-3 bg-zinc-900 text-[#FAF9F6] dark:bg-white dark:text-zinc-950 px-2.5 py-1 rounded-none text-[8px] font-mono uppercase tracking-widest">
                    Featured
                  </div>
                )}
              </div>

              {/* Text Container */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif font-medium text-xl text-zinc-900 dark:text-white group-hover:underline underline-offset-4 decoration-zinc-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="font-sans font-light text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  {proj.tags.slice(0, 3).map((tg) => (
                    <span
                      key={tg}
                      className="font-mono text-[9px] text-[#0A0A0A] dark:text-zinc-450 uppercase tracking-wider"
                    >
                      [{tg}]
                    </span>
                  ))}
                  {proj.tags.length > 3 && (
                    <span className="font-mono text-[9px] text-zinc-400">
                      +{proj.tags.length - 3} MORE
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-200/80 dark:border-zinc-800 rounded-none space-y-3">
              <span className="block text-zinc-400 text-sm font-light">No creative works found in this segment.</span>
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-300 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. About Section */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-200/60 dark:border-zinc-850 pt-20"
        id="about-section"
      >
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-zinc-905 dark:text-white">
            Behind the Craft
          </h2>
          <p className="font-mono text-[9px] tracking-widest text-[#0A0A0A] dark:text-zinc-400 leading-relaxed uppercase">
            / INTERACTION ARCHITECTURE & VISUAL DESIGN /
          </p>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="font-sans font-light text-zinc-500 dark:text-zinc-400 space-y-6 text-base sm:text-lg leading-relaxed">
            {settings.aboutMe.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Skill Tag Deck */}
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
              // Core Aptitude Deck
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {settings.skills.map((skill) => (
                <div
                  key={skill}
                  className="font-sans text-xs border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 p-3 rounded-none font-medium text-center bg-transparent hover:border-zinc-405 dark:hover:border-zinc-600 transition-colors"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Social Profiles Grid */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-850">
            {settings.socials.github && (
              <a
                href={settings.socials.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 text-zinc-550 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white text-xs uppercase tracking-wider font-mono transition-colors"
              >
                <Github size={13} />
                <span>GitHub</span>
              </a>
            )}
            {settings.socials.linkedin && (
              <a
                href={settings.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 text-zinc-550 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white text-xs uppercase tracking-wider font-mono transition-colors"
              >
                <ExternalLink size={13} />
                <span>LinkedIn</span>
              </a>
            )}
            {settings.socials.twitter && (
              <a
                href={settings.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 text-zinc-550 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white text-xs uppercase tracking-wider font-mono transition-colors"
              >
                <ExternalLink size={13} />
                <span>Twitter / X</span>
              </a>
            )}
            {settings.socials.email && (
              <a
                href={`mailto:${settings.socials.email}`}
                className="flex items-center space-x-2 text-zinc-550 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white text-xs uppercase tracking-wider font-mono transition-colors"
              >
                <Mail size={13} />
                <span>Email</span>
              </a>
            )}
            {settings.resumeUrl && settings.resumeUrl !== "#" && (
              <a
                href={settings.resumeUrl}
                className="ml-auto inline-flex items-center space-x-2 text-xs text-[#0A0A0A] dark:text-zinc-200 font-semibold tracking-wide uppercase hover:underline"
              >
                <span>Curriculum Vitae</span>
                <ChevronRight size={12} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. Download Resume Section */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-200/60 dark:border-zinc-850 pt-20"
        id="resume-section"
      >
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-zinc-900 dark:text-white">
            Curriculum Vitae
          </h2>
          <p className="font-mono text-[9px] tracking-widest text-[#0A0A0A] dark:text-zinc-400 leading-relaxed uppercase">
            / PROFESSIONAL COMPASS & SUMMARY DECK /
          </p>
        </div>

        <div className="lg:col-span-8">
          <div className="border border-zinc-200/80 dark:border-zinc-850 bg-white dark:bg-[#121212] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h3 className="font-serif font-medium text-xl text-zinc-900 dark:text-white">
                Technical Resume Timeline
              </h3>
              <p className="font-sans font-light text-zinc-500 dark:text-zinc-400 text-sm max-w-md">
                Click below to retrieve the comprehensive curriculum vitae compiled with my backend architectures, EEE systems coursework, and complete academic portfolio.
              </p>
            </div>
            {settings.resumeUrl && settings.resumeUrl !== "#" ? (
              <a
                href={settings.resumeUrl}
                download
                className="inline-flex items-center space-x-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-6 py-3.5 rounded-none text-xs font-semibold uppercase tracking-widest transition-all duration-200 whitespace-nowrap cursor-pointer"
                id="landing-download-resume-button"
              >
                <Download size={14} />
                <span>Download Resume</span>
              </a>
            ) : (
              <span className="text-xs font-mono text-zinc-400 italic">
                Resume document is currently not configured on this portfolio.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 5. Contact Form Section */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-200/60 dark:border-zinc-850 pt-20"
        id="contact-section"
      >
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[#0A0A0A] dark:text-white">
            Initiate Contact
          </h2>
          <p className="font-sans font-light text-zinc-500 sm:text-zinc-450 text-sm leading-relaxed max-w-sm">
            Have an exciting deployment inquiry, interface system collaboration, or editorial project dream? Call or message the studio.
          </p>
          <div className="space-y-1.5 pt-4">
            <span className="block text-[8px] font-mono tracking-widest text-[#0A0A0A] dark:text-zinc-400 uppercase">/ PERSISTENT ADDR</span>
            <a
              href={`mailto:${settings.socials.email}`}
              className="font-mono text-xs text-[#0A0A0A] dark:text-zinc-200 block underline underline-offset-4 leading-normal hover:text-zinc-500 dark:hover:text-white transition-colors cursor-pointer"
            >
              {settings.socials.email}
            </a>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-850 rounded-none p-6 sm:p-8">
          <form onSubmit={handleContactSubmit} className="space-y-6" id="portfolio-contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="name-input" className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                  Name <span className="text-zinc-950 dark:text-white">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name-input"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-none bg-[#FAF9F6] dark:bg-[#0A0A0A]/40 border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-[#0A0A0A] dark:focus:border-white'} text-[#0A0A0A] dark:text-white focus:outline-none transition-colors text-sm`}
                  placeholder="Jane Miller"
                />
                {errors.name && (
                  <p className="text-red-500 text-[10px] font-mono mt-1" id="name-input-error">// {errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                  Email URL <span className="text-zinc-950 dark:text-white">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email-input"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-none bg-[#FAF9F6] dark:bg-[#0A0A0A]/40 border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-[#0A0A0A] dark:focus:border-white'} text-[#0A0A0A] dark:text-white focus:outline-none transition-colors text-sm`}
                  placeholder="jane@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] font-mono mt-1" id="email-input-error">// {errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject-input" className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Subject Focus
              </label>
              <input
                type="text"
                name="subject"
                id="subject-input"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-none bg-[#FAF9F6] dark:bg-[#0A0A0A]/40 border ${errors.subject ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-[#0A0A0A] dark:focus:border-white'} text-[#0A0A0A] dark:text-white focus:outline-none transition-colors text-sm`}
                placeholder="Collaboration, consulting, systems..."
              />
              {errors.subject && (
                <p className="text-red-500 text-[10px] font-mono mt-1" id="subject-input-error">// {errors.subject}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message-input" className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Message Content <span className="text-zinc-950 dark:text-white">*</span>
              </label>
              <textarea
                name="message"
                id="message-input"
                required
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-none bg-[#FAF9F6] dark:bg-[#0A0A0A]/40 border ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-[#0A0A0A] dark:focus:border-white'} text-[#0A0A0A] dark:text-white focus:outline-none transition-colors text-sm`}
                placeholder="Describe your design specifications, scope details, timelines..."
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-[10px] font-mono mt-1" id="message-input-error">// {errors.message}</p>
              )}
            </div>

            {submitStatus.type && (
              <div
                className={`p-4 rounded-none flex items-start space-x-2 text-sm ${
                  submitStatus.type === "success"
                    ? "bg-zinc-50 text-zinc-850 dark:bg-zinc-900/30 dark:text-zinc-305 border border-zinc-200 dark:border-zinc-800"
                    : "bg-red-50 text-red-805 dark:bg-red-950/20 dark:text-red-305 border border-red-200/50"
                }`}
                id="contact-form-status-banner"
              >
                {submitStatus.type === "success" && <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />}
                <span>{submitStatus.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-3 w-full sm:w-auto px-8 py-4 rounded-none bg-[#0A0A0A] hover:bg-zinc-800 text-[#FAF9F6] dark:bg-white dark:hover:bg-zinc-150 dark:text-zinc-950 text-xs font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="contact-submit-button"
            >
              <Send size={13} />
              <span>{isSubmitting ? "Sending..." : "Submit Message"}</span>
            </button>
          </form>
        </div>
      </section>

      {/* 6. Project Details Overlay Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in" id="project-detail-modal">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-[#121212] border border-zinc-300 dark:border-zinc-800 rounded-none overflow-y-auto shadow-none p-6 sm:p-8 space-y-6">
            
            {/* Modal Exit Action */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
              id="close-modal-button"
            >
              <X size={18} />
            </button>

            {/* Title / Sub-tags */}
            <div className="space-y-2 pr-10">
              <span className="font-mono text-[9px] text-zinc-400 tracking-widest uppercase font-semibold">
                // {selectedProject.category}
              </span>
              <h3 className="font-serif font-medium text-3xl text-zinc-904 dark:text-white leading-tight">
                {selectedProject.title}
              </h3>
            </div>

            {/* Media Container */}
            <div className="aspect-video w-full rounded-none overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/10">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Sub-header detail grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-850">
              <div className="space-y-3">
                <h4 className="font-mono text-[10px] tracking-widest text-zinc-450 uppercase">
                  // Technology Inventory
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tg) => (
                    <span
                      key={tg}
                      className="font-mono text-[10px] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-305 px-2 py-1 rounded-none uppercase"
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-mono text-[10px] tracking-widest text-[#0a0a0a] dark:text-white uppercase">
                  // Links & Release Code
                </h4>
                <div className="flex flex-wrap gap-4">
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold text-zinc-950 dark:text-zinc-200 underline underline-offset-4"
                    >
                      <ExternalLink size={13} />
                      <span>Live Deployment</span>
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline underline-offset-4"
                    >
                      <Github size={13} />
                      <span>Source Repository</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Body Area */}
            <div className="prose prose-zinc dark:prose-invert max-w-none text-[#0A0A0A] dark:text-zinc-300 font-sans text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap">
              {/* Parse double line feeds as HTML paragraphs or markdown style blocks */}
              {selectedProject.content.startsWith("##") ? (
                selectedProject.content.split("\n\n").map((chunk, i) => {
                  if (chunk.startsWith("## ")) {
                    return (
                      <h4 key={i} className="font-serif font-semibold text-xl text-zinc-900 dark:text-white pt-4 pb-1">
                        {chunk.replace("## ", "")}
                      </h4>
                    );
                  }
                  if (chunk.startsWith("- ")) {
                    return (
                      <ul key={i} className="list-disc pl-5 py-2 space-y-1.5 font-sans font-light">
                        {chunk.split("\n").map((li, j) => (
                           <li key={j}>{li.replace("- ", "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="font-sans font-light text-zinc-550 dark:text-zinc-400 leading-relaxed">{chunk}</p>;
                })
              ) : (
                selectedProject.content.split("\n\n").map((para, i) => <p key={i} className="font-sans font-light text-zinc-550 dark:text-zinc-400 leading-relaxed">{para}</p>)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
