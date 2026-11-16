"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layout,
  Palette,
  Type,
  Smartphone,
  Tablet,
  Monitor,
  Save,
  UploadCloud,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  Loader2,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function WebsiteBuilderStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"content" | "templates" | "style">("content");

  // Editable Site Configuration State
  const [siteTitle, setSiteTitle] = useState("Johnson Creative Studio");
  const [template, setTemplate] = useState("agency");
  const [businessName, setBusinessName] = useState("Johnson Creative Studio");
  const [tagline, setTagline] = useState("High-impact digital design and cloud engineering");
  const [heroHeading, setHeroHeading] = useState("Scale Your Business With Stunning Web Experiences");
  const [heroSubheading, setHeroSubheading] = useState(
    "We design, build, and deploy lightning-fast digital products tailored to convert visitors into loyal clients."
  );
  const [primaryCtaText, setPrimaryCtaText] = useState("Get Free Consultation");
  const [secondaryCtaText, setSecondaryCtaText] = useState("View Our Work");
  const [themeColor, setThemeColor] = useState("#4f46e5");
  const [feature1Title, setFeature1Title] = useState("Custom Web Design");
  const [feature1Desc, setFeature1Desc] = useState("Bespoke, conversion-focused websites built with modern technologies.");
  const [feature2Title, setFeature2Title] = useState("Cloud Optimization");
  const [feature2Desc, setFeature2Desc] = useState("Enterprise-grade speed, 99.99% uptime, and global CDN delivery.");
  const [feature3Title, setFeature3Title] = useState("SEO & Growth");
  const [feature3Desc, setFeature3Desc] = useState("Targeted organic search engine optimization to drive continuous organic traffic.");
  const [contactEmail, setContactEmail] = useState("hello@johnsonstudio.com");
  const [contactPhone, setContactPhone] = useState("+1 (555) 234-5678");

  useEffect(() => {
    Promise.all([
      fetch(`/api/services/${id}`).then((r) => r.json()),
      fetch(`/api/services/${id}/builder`).then((r) => r.json()),
    ])
      .then(([sData, bData]) => {
        setService(sData.service);
        if (bData.project) {
          setProject(bData.project);
          setSiteTitle(bData.project.siteTitle);
          setTemplate(bData.project.template || "agency");

          try {
            const cfg = JSON.parse(bData.project.config || "{}");
            if (cfg.businessName) setBusinessName(cfg.businessName);
            if (cfg.tagline) setTagline(cfg.tagline);
            if (cfg.heroHeading) setHeroHeading(cfg.heroHeading);
            if (cfg.heroSubheading) setHeroSubheading(cfg.heroSubheading);
            if (cfg.primaryCtaText) setPrimaryCtaText(cfg.primaryCtaText);
            if (cfg.secondaryCtaText) setSecondaryCtaText(cfg.secondaryCtaText);
            if (cfg.themeColor) setThemeColor(cfg.themeColor);
            if (cfg.features && cfg.features[0]) {
              setFeature1Title(cfg.features[0].title);
              setFeature1Desc(cfg.features[0].description);
            }
            if (cfg.features && cfg.features[1]) {
              setFeature2Title(cfg.features[1].title);
              setFeature2Desc(cfg.features[1].description);
            }
            if (cfg.features && cfg.features[2]) {
              setFeature3Title(cfg.features[2].title);
              setFeature3Desc(cfg.features[2].description);
            }
            if (cfg.contactEmail) setContactEmail(cfg.contactEmail);
            if (cfg.contactPhone) setContactPhone(cfg.contactPhone);
          } catch {
            // fallback defaults
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getCurrentConfig = () => ({
    businessName,
    tagline,
    heroHeading,
    heroSubheading,
    primaryCtaText,
    secondaryCtaText,
    themeColor,
    features: [
      { title: feature1Title, description: feature1Desc },
      { title: feature2Title, description: feature2Desc },
      { title: feature3Title, description: feature3Desc },
    ],
    contactEmail,
    contactPhone,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${id}/builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle,
          template,
          config: getCurrentConfig(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProject(data.project);
      alert("Draft saved successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishSuccess(false);
    try {
      // First save current draft
      await fetch(`/api/services/${id}/builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle,
          template,
          config: getCurrentConfig(),
        }),
      });

      // Then trigger live publishing to public_html
      const res = await fetch(`/api/services/${id}/builder/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setProject(data.project);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 6000);
    } catch (err: any) {
      alert("Publish Error: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const colorPresets = [
    { name: "Indigo", value: "#4f46e5" },
    { name: "Emerald", value: "#059669" },
    { name: "Sky", value: "#0284c7" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Rose", value: "#e11d48" },
    { name: "Amber", value: "#d97706" },
  ];

  const templatePresets = [
    { id: "agency", name: "Modern Agency / Studio", desc: "Sleek, bold layout with high-converting CTA headers" },
    { id: "saas", name: "Cloud & SaaS Tech", desc: "Engineered for web apps, software, and subscriptions" },
    { id: "portfolio", name: "Creative Showcase", desc: "Visual-first portfolio for creators and designers" },
    { id: "restaurant", name: "Dining & Coffee Bar", desc: "Warm aesthetic with menu highlights and reservations" },
  ];

  if (loading || !service) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col z-50 overflow-hidden">
      {/* Studio Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/services/${id}`}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Studio</span>
          </Link>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">{siteTitle}</span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Domain: {service.domain}
              </span>
            </div>
          </div>
        </div>

        {/* Viewport Toggles (Desktop, Tablet, Mobile) */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewport("desktop")}
            title="Desktop View"
            className={`p-2 rounded-lg text-xs transition flex items-center space-x-1 ${
              viewport === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Desktop</span>
          </button>
          <button
            onClick={() => setViewport("tablet")}
            title="Tablet View"
            className={`p-2 rounded-lg text-xs transition flex items-center space-x-1 ${
              viewport === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Tablet</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            title="Mobile View"
            className={`p-2 rounded-lg text-xs transition flex items-center space-x-1 ${
              viewport === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Mobile</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition"
          >
            {publishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deploying to cPanel...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Publish to Domain</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body: Left Sidebar + Center Live Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Customizer Panel */}
        <aside className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/60">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                activeTab === "content"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Content</span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                activeTab === "templates"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>
            <button
              onClick={() => setActiveTab("style")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                activeTab === "style"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Branding</span>
            </button>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                    Hero Section
                  </span>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hero Headline
                      </label>
                      <textarea
                        rows={2}
                        value={heroHeading}
                        onChange={(e) => setHeroHeading(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Subheading Description
                      </label>
                      <textarea
                        rows={3}
                        value={heroSubheading}
                        onChange={(e) => setHeroSubheading(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Primary Button
                        </label>
                        <input
                          type="text"
                          value={primaryCtaText}
                          onChange={(e) => setPrimaryCtaText(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Secondary Button
                        </label>
                        <input
                          type="text"
                          value={secondaryCtaText}
                          onChange={(e) => setSecondaryCtaText(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                    Service Cards
                  </span>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <input
                        type="text"
                        value={feature1Title}
                        onChange={(e) => setFeature1Title(e.target.value)}
                        placeholder="Feature 1 Title"
                        className="w-full font-semibold bg-transparent text-white focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={feature1Desc}
                        onChange={(e) => setFeature1Desc(e.target.value)}
                        className="w-full text-slate-400 bg-transparent text-[11px] focus:outline-none"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <input
                        type="text"
                        value={feature2Title}
                        onChange={(e) => setFeature2Title(e.target.value)}
                        placeholder="Feature 2 Title"
                        className="w-full font-semibold bg-transparent text-white focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={feature2Desc}
                        onChange={(e) => setFeature2Desc(e.target.value)}
                        className="w-full text-slate-400 bg-transparent text-[11px] focus:outline-none"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <input
                        type="text"
                        value={feature3Title}
                        onChange={(e) => setFeature3Title(e.target.value)}
                        placeholder="Feature 3 Title"
                        className="w-full font-semibold bg-transparent text-white focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={feature3Desc}
                        onChange={(e) => setFeature3Desc(e.target.value)}
                        className="w-full text-slate-400 bg-transparent text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                    Contact Information
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATES TAB */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Switching templates changes typography and structure instantly:
                </p>
                {templatePresets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition ${
                      template === t.id
                        ? "bg-indigo-600/20 border-indigo-500 shadow-md"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{t.name}</span>
                      {template === t.id && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* BRANDING TAB */}
            {activeTab === "style" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Primary Accent Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setThemeColor(c.value)}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                          themeColor === c.value
                            ? "border-white bg-slate-800"
                            : "border-slate-800 bg-slate-950 hover:bg-slate-800"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                        <span className="text-xs font-medium text-slate-300">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Hex Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Live Interactive Canvas */}
        <main className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center overflow-y-auto relative">
          {/* Success Banner */}
          {publishSuccess && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>Published live to {service.domain} (public_html/index.html)!</span>
            </div>
          )}

          {/* Interactive Screen Frame */}
          <div
            className={`h-full transition-all duration-300 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto flex flex-col ${
              viewport === "desktop"
                ? "w-full max-w-5xl"
                : viewport === "tablet"
                ? "w-[768px] max-w-full"
                : "w-[390px] max-w-full"
            }`}
          >
            {/* Mock Browser URL Bar */}
            <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex items-center space-x-2 shrink-0">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="flex-1 max-w-md mx-auto bg-slate-900/90 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-400 text-center border border-slate-800 truncate">
                https://{service.domain}/
              </div>
            </div>

            {/* LIVE PREVIEW WEBSITE */}
            <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col">
              {/* Navbar */}
              <nav className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-md text-sm"
                    style={{ backgroundColor: themeColor }}
                  >
                    {businessName.slice(0, 1)}
                  </div>
                  <span className="font-extrabold text-white text-base tracking-tight">
                    {businessName}
                  </span>
                </div>

                <div className="hidden sm:flex items-center space-x-6 text-xs text-slate-300 font-medium">
                  <span className="hover:text-white cursor-pointer">Services</span>
                  <span className="hover:text-white cursor-pointer">About</span>
                  <span className="hover:text-white cursor-pointer">Portfolio</span>
                  <span className="hover:text-white cursor-pointer">Contact</span>
                </div>

                <button
                  className="px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs shadow-md"
                  style={{ backgroundColor: themeColor }}
                >
                  Contact Us
                </button>
              </nav>

              {/* Hero Section */}
              <section className="px-6 py-16 text-center max-w-3xl mx-auto space-y-6">
                <div
                  className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    borderColor: `${themeColor}40`,
                    color: themeColor,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{tagline}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {heroHeading}
                </h1>

                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  {heroSubheading}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    className="px-6 py-3 rounded-xl text-white font-bold text-xs shadow-lg flex items-center space-x-2 transition hover:opacity-90"
                    style={{ backgroundColor: themeColor }}
                  >
                    <span>{primaryCtaText}</span>
                  </button>
                  <button className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs transition">
                    <span>{secondaryCtaText}</span>
                  </button>
                </div>
              </section>

              {/* Features / Services Section */}
              <section className="px-6 py-12 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{feature1Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature1Desc}</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{feature2Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature2Desc}</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{feature3Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature3Desc}</p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-xs text-slate-500 text-center">
                <p>
                  © {new Date().getFullYear()} {businessName}. All rights reserved. • {contactEmail} • {contactPhone}
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
