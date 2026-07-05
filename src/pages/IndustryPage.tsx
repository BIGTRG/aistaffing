import { useConvexAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIndustryBySlug, INDUSTRIES } from "@/data/industries";
import type { IndustryData } from "@/data/industries";

/* ═══════════════════════════════════════════════════════
   AI STAFFING AGENCY — INDUSTRY LANDING PAGE
   Silver theme — matches LandingPage design system
   ═══════════════════════════════════════════════════════ */

/* ─── HOOKS ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, animated };
}

/* ─── SHARED COMPONENTS ─── */

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-bg opacity-[0.04]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2B7AE0] opacity-[0.06] blur-[140px]" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#F27A2E] opacity-[0.04] blur-[100px]" />
    </div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-px bg-[#F27A2E]" />
      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F27A2E]">
        {children}
      </span>
    </div>
  );
}

function HudBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1A1D23]/20 rounded text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1D23]/70 bg-white/50">
      <span className="w-1.5 h-1.5 rounded-full bg-[#2B7AE0] animate-pulse" />
      {children}
    </div>
  );
}

/* ─── INDUSTRY PAGE SECTIONS ─── */

function HeroSection({ industry }: { industry: IndustryData }) {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-24 pb-16">
      <GridBackground />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Back link */}
        <Link
          to="/#industries"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#1A1D23]/40 hover:text-[#1A1D23]/70 transition-colors uppercase tracking-wide mb-4"
        >
          <ArrowLeft className="size-3" />
          All Industries
        </Link>

        <HudBadge>
          {industry.icon} {industry.name} Solutions
        </HudBadge>

        <h1 className="hero-title text-[clamp(2rem,6vw,5rem)] font-black leading-[0.95] tracking-[-0.03em]">
          <span className="block text-[#1A1D23]">{industry.headline.split(" ").slice(0, -2).join(" ")}</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2B7AE0] via-[#4A9AF5] to-[#2B7AE0]">
            {industry.headline.split(" ").slice(-2).join(" ")}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#3A3F48]/60 max-w-2xl mx-auto leading-relaxed font-medium">
          {industry.subheadline}
        </p>

        <p className="text-base text-[#3A3F48]/50 max-w-2xl mx-auto leading-relaxed">
          {industry.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 px-8 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.25)] hover:shadow-[0_0_40px_rgba(242,122,46,0.35)] transition-all"
            >
              {isAuthenticated ? "Go to Dashboard" : "Deploy Your First Agent"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 mt-auto w-full max-w-5xl mx-auto pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {industry.stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-[#1A1D23]/10 rounded-lg p-5 bg-white/40 backdrop-blur-sm text-center hover:border-[#2B7AE0]/30 transition-colors"
            >
              <div className="text-3xl font-bold text-[#1A1D23] font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-[#F27A2E] mt-1 font-mono font-medium">
                {stat.label}
              </div>
              <div className="text-xs text-[#3A3F48]/40 mt-2">{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainPointsSection({ industry }: { industry: IndustryData }) {
  const reveal = useScrollReveal();

  return (
    <section
      ref={reveal.ref}
      className={`py-24 md:py-32 px-6 bg-[#BFC5CD] transition-all duration-1000 ${
        reveal.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <SectionTag>The Problem</SectionTag>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
            Challenges {industry.name} Face{" "}
            <span className="text-[#2B7AE0]">Every Day</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {industry.painPoints.map((point, i) => (
            <div
              key={point.title}
              className="relative border border-[#1A1D23]/10 rounded-lg p-6 bg-white/30 backdrop-blur-sm hover:border-red-400/30 transition-all group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/15 transition-colors">
                  <AlertTriangle className="size-5 text-red-500/70" />
                </div>
                <span className="text-xs font-mono text-[#1A1D23]/30 uppercase tracking-wider">
                  Pain Point {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#1A1D23] mb-2">
                {point.title}
              </h3>
              <p className="text-sm text-[#3A3F48]/50 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsSection({ industry }: { industry: IndustryData }) {
  const reveal = useScrollReveal();

  return (
    <section
      ref={reveal.ref}
      className={`py-24 md:py-32 px-6 transition-all duration-1000 ${
        reveal.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <SectionTag>Recommended Agents</SectionTag>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
              Your {industry.name}{" "}
              <span className="text-[#2B7AE0]">AI&nbsp;Team</span>
            </h2>
            <p className="text-[#3A3F48]/50 mt-3 max-w-lg">
              These agents are specifically configured for {industry.name.toLowerCase()} workflows,
              terminology, and customer expectations.
            </p>
          </div>
          <Link
            to="/signup"
            className="text-[#F27A2E] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            Deploy these agents <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industry.recommendedAgents.map((agent, i) => (
            <div
              key={agent.name}
              className="group relative border border-[#1A1D23]/10 rounded-lg p-5 hover:border-[#2B7AE0]/40 transition-all duration-300 bg-white/40 backdrop-blur-sm"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#1A1D23]/50">
                  Ready to Deploy
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#1A1D23] mb-2 flex items-center gap-2">
                <span className="text-[#2B7AE0]/50 text-xs font-mono">›</span>
                {agent.name}
              </h3>
              <p className="text-sm text-[#3A3F48]/50 leading-relaxed">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection({ industry }: { industry: IndustryData }) {
  const reveal = useScrollReveal();

  return (
    <section
      ref={reveal.ref}
      className={`py-24 md:py-32 px-6 bg-[#BFC5CD] transition-all duration-1000 ${
        reveal.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <SectionTag>Use Cases</SectionTag>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
            How AI Agents Work in{" "}
            <span className="text-[#2B7AE0]">{industry.name}</span>
          </h2>
        </div>

        <div className="space-y-6">
          {industry.useCases.map((uc, i) => (
            <div
              key={uc.title}
              className="group flex gap-6 md:gap-8 p-6 border border-[#1A1D23]/10 rounded-lg hover:border-[#2B7AE0]/30 transition-all bg-white/30 backdrop-blur-sm"
            >
              <div className="relative z-10 shrink-0">
                <div className="w-12 h-12 rounded-full border-2 border-[#2B7AE0]/30 flex items-center justify-center text-xs font-mono font-bold text-[#2B7AE0] bg-white/50 group-hover:border-[#2B7AE0]/60 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="pt-1">
                <h3 className="text-base font-semibold text-[#1A1D23] mb-2 flex items-center gap-2">
                  <Zap className="size-4 text-[#F27A2E]/60 shrink-0" />
                  {uc.title}
                </h3>
                <p className="text-sm text-[#3A3F48]/50 leading-relaxed">
                  {uc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ROISection({ industry }: { industry: IndustryData }) {
  const reveal = useScrollReveal();

  return (
    <section
      ref={reveal.ref}
      className={`py-24 md:py-32 px-6 transition-all duration-1000 ${
        reveal.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <SectionTag>Return on Investment</SectionTag>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
            The Math <span className="text-[#F27A2E]">Speaks for Itself</span>
          </h2>
        </div>

        <div className="border border-[#1A1D23]/15 rounded-lg overflow-hidden bg-[#1A1D23] text-white shadow-[0_4px_40px_rgba(26,29,35,0.25)]">
          {/* Header */}
          <div className="px-6 md:px-8 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <DollarSign className="size-5 text-[#F27A2E]" />
              <h3 className="text-sm font-mono uppercase tracking-[0.15em] text-white/60">
                {industry.roiExample.title}
              </h3>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Calculation */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Target className="size-5 text-[#2B7AE0] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.1em] text-white/30 mb-1">
                    The Math
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {industry.roiExample.calculation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.1em] text-white/30 mb-1">
                    Without AI Agents
                  </div>
                  <p className="text-xl font-bold text-red-400">
                    {industry.roiExample.monthlyLoss}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-start gap-4">
                  <TrendingUp className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.1em] text-white/30 mb-1">
                      With AI Staffing Agency
                    </div>
                    <p className="text-sm text-emerald-400 font-medium leading-relaxed">
                      {industry.roiExample.withAgent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-6 md:px-8 py-5 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/30 font-mono">
                ROI typically positive within the first month
              </p>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="bg-[#2B7AE0] hover:bg-[#2468c4] text-white rounded-sm h-9 px-5 text-xs shadow-[0_0_20px_rgba(43,122,224,0.25)]"
                >
                  Calculate Your ROI <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OtherIndustriesSection({ currentSlug }: { currentSlug: string }) {
  const reveal = useScrollReveal();
  const others = INDUSTRIES.filter((i) => i.slug !== currentSlug).slice(0, 8);

  return (
    <section
      ref={reveal.ref}
      className={`py-24 md:py-32 px-6 bg-[#BFC5CD] transition-all duration-1000 ${
        reveal.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionTag>More Industries</SectionTag>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1D23]">
            We Serve <span className="text-[#2B7AE0]">25+ Industries</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {others.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industries/${ind.slug}`}
              className="group relative px-5 py-4 border border-[#1A1D23]/10 rounded-lg hover:border-[#2B7AE0]/30 hover:bg-white/40 transition-all duration-300 text-center bg-white/20 backdrop-blur-sm"
            >
              <span className="text-lg mb-1 block">{ind.icon}</span>
              <span className="text-sm text-[#1A1D23]/50 group-hover:text-[#1A1D23]/80 transition-colors font-medium">
                {ind.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/#industries"
            className="text-[#F27A2E] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all industries <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection({ industry }: { industry: IndustryData }) {
  return (
    <section className="relative py-32 md:py-40 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2B7AE0] opacity-[0.06] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#1A1D23]">
          Ready to Transform
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27A2E] to-[#FF9A52]">
            Your {industry.name.replace(/&.*/, "").trim()} Business?
          </span>
        </h2>
        <p className="text-[#3A3F48]/50 text-lg max-w-lg mx-auto">
          Book a free consultation. We'll analyze your business, recommend the
          right agents, and have you live in under 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-14 px-10 rounded-sm shadow-[0_0_40px_rgba(242,122,46,0.25)] hover:shadow-[0_0_50px_rgba(242,122,46,0.35)] transition-all"
            >
              Book a Free Consultation
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-8 pt-6">
          {[
            { icon: <CheckCircle2 className="size-4" />, text: "Live in <24 hours" },
            { icon: <CheckCircle2 className="size-4" />, text: "No contracts" },
            { icon: <CheckCircle2 className="size-4" />, text: "Cancel anytime" },
          ].map((t) => (
            <div
              key={t.text}
              className="flex items-center gap-2 text-xs text-[#3A3F48]/40"
            >
              <span className="text-emerald-500/60">{t.icon}</span>
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER (matches LandingPage) ─── */
function Footer() {
  return (
    <footer className="border-t border-[#1A1D23]/8 py-12 px-6 bg-[#1A1D23]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/logo-white.png"
              alt="AI Staffing Agency"
              className="h-8 w-8 opacity-60"
            />
            <span className="text-sm font-semibold text-white/60">
              AI Staffing Agency
            </span>
          </div>
          <p className="text-xs text-white/20 max-w-xs leading-relaxed">
            The first staffing agency that deploys AI agents instead of human
            temps. Built for small service businesses.
          </p>
        </div>
        <div className="flex gap-12 text-xs">
          <div>
            <h4 className="font-mono uppercase tracking-[0.15em] text-white/30 mb-3 text-[10px]">
              Company
            </h4>
            <ul className="space-y-2 text-white/20">
              <li>
                <Link to="/" className="hover:text-white/50 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/#pricing"
                  className="hover:text-white/50 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white/50 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono uppercase tracking-[0.15em] text-white/30 mb-3 text-[10px]">
              Legal
            </h4>
            <ul className="space-y-2 text-white/20">
              <li>
                <a href="#" className="hover:text-white/50 transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white/50 transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.04] text-center text-[11px] text-white/15 font-mono">
        © {new Date().getFullYear()} AI STAFFING AGENCY — A TRG TECH LINK
        COMPANY
      </div>
    </footer>
  );
}

/* ═══════════════════ MAIN PAGE COMPONENT ═══════════════════ */

export function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustryBySlug(slug) : undefined;

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!industry) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-[#C8CDD5] text-[#1A1D23] overflow-x-hidden">
      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass-light">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-white.png"
              alt="AI Staffing Agency"
              className="h-9 w-9 transition-transform group-hover:scale-105 brightness-0"
            />
            <span className="text-sm font-semibold tracking-tight text-[#1A1D23]/80">
              AI Staffing Agency
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/#agents"
              className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase"
            >
              Agents
            </Link>
            <Link
              to="/#pricing"
              className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase"
            >
              Pricing
            </Link>
            <Link
              to="/#industries"
              className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase"
            >
              Industries
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="bg-[#1A1D23] hover:bg-[#2A2D33] text-white text-xs font-semibold px-5 h-8 rounded-sm"
              >
                Get Started <ArrowRight className="size-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ SECTIONS ═══════════════════ */}
      <HeroSection industry={industry} />
      <PainPointsSection industry={industry} />
      <AgentsSection industry={industry} />
      <UseCasesSection industry={industry} />
      <ROISection industry={industry} />
      <OtherIndustriesSection currentSlug={slug!} />
      <CTASection industry={industry} />
      <Footer />
    </div>
  );
}
