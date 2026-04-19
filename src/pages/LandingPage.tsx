import { useConvexAuth } from "convex/react";
import {
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  Headphones,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Users,
  Zap,
  Bot,
  BarChart3,
  Palette,
  Play,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const agents = [
  { name: "Front Desk", roles: ["Receptionist", "Scheduler", "Virtual Assistant"], icon: Headphones, color: "text-blue-600" },
  { name: "Sales", roles: ["Inbound Sales Rep", "Outbound Closer", "Lead Qualifier"], icon: DollarSign, color: "text-orange-500" },
  { name: "Marketing", roles: ["Social Media Manager", "Content Creator", "Ad Specialist"], icon: Palette, color: "text-purple-600" },
  { name: "Support", roles: ["Help Desk Agent", "Complaint Resolution", "Follow-Up Specialist"], icon: Headphones, color: "text-emerald-600" },
  { name: "Admin & Ops", roles: ["Data Entry Clerk", "Office Manager", "Intake Coordinator"], icon: Users, color: "text-cyan-600" },
  { name: "Finance", roles: ["Invoice Clerk", "Collections Agent", "Billing Coordinator"], icon: BarChart3, color: "text-amber-500" },
];

const pricing = [
  {
    title: "AI Receptionist",
    price: "$300–$800",
    period: "/month",
    desc: "Answers calls, books appointments, handles FAQs. Available 24/7 — never misses a call.",
    features: ["Phone answering & forwarding", "Appointment scheduling", "FAQ handling", "Call logging & transcripts"],
    popular: false,
  },
  {
    title: "AI Sales Agent",
    price: "Hourly + Commission",
    period: "",
    desc: "Flat hourly rate plus your commission structure. We take 30% of commissions earned.",
    features: ["Inbound & outbound calls", "Lead qualification", "Commission tracking", "CRM integration"],
    popular: true,
  },
  {
    title: "Marketing Team",
    price: "$1,000–$1,500",
    period: "/person/mo",
    desc: "Full-service marketing: social media, ads, design, print coordination. Guaranteed retainer.",
    features: ["Social media management", "Ad campaigns", "Graphic design", "Print coordination"],
    popular: false,
  },
];

const testimonialStats = [
  { value: "24/7", label: "Availability" },
  { value: "< 24hrs", label: "Deploy Time" },
  { value: "$0", label: "Workers' Comp" },
  { value: "100%", label: "Uptime" },
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-28 bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220_14%_90%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_14%_90%)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 tracking-wide uppercase">
            <Bot className="size-3.5" />
            The Future of Staffing
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900">
            Your Staff Never
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">
              Sleeps.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Deploy AI-powered workers — receptionists, sales reps, marketing teams, and more.
            No liability. No insurance. No workers' comp. No lunch breaks.
            <span className="font-semibold text-gray-800"> At your service 24/7.</span>
          </p>

          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" className="text-base h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                <Link to="/login">
                  <Play className="size-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-4">
              <Button size="lg" className="text-base h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-blue-600" />
              <span>Free to get started</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-blue-600" />
              <span>Deploy in 24 hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-blue-600" />
              <span>30-day minimum</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {testimonialStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE PITCH ─── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-orange-500 mb-3 tracking-wide uppercase">
              Why AI Staffing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              When You Sleep, Your Staff Doesn't.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              The first staffing agency that deploys AI agents instead of human temps.
              Same results. Fraction of the cost. Zero headaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-blue-200">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-blue-50 mb-4">
                <Shield className="size-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Zero Liability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No workers' comp. No insurance headaches. No HR issues.
                AI agents work without the legal overhead of human employees.
              </p>
            </div>

            <div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-orange-200">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-orange-50 mb-4">
                <Clock className="size-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">24/7 Availability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No sick days. No vacations. No being late. Your AI staff is always on,
                always professional, always ready.
              </p>
            </div>

            <div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-green-200">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-green-50 mb-4">
                <Zap className="size-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Deploy in 24 Hours</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No training period. No ramp-up time. Tell us about your business,
                and your AI agent is live within a day.
              </p>
            </div>

            <div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-purple-200">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-purple-50 mb-4">
                <Phone className="size-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Phone Forwarding</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Just enter your phone number. Calls forward to your AI receptionist —
                your own automatic answering service.
              </p>
            </div>

            <div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-cyan-200">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-cyan-50 mb-4">
                <Mail className="size-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Smart Email</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Emails come in, AI drafts the perfect response.
                You hit "Yes" to send or "Update" to adjust. That simple.
              </p>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 p-6 transition-all hover:shadow-md">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-orange-50 mb-4">
                <Sparkles className="size-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Staffing + Temp Agency</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Long-term placements or short-term contracts. 30 days, 3 months, 6 months —
                whatever your business needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3 tracking-wide uppercase">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              3 Simple Steps to Your AI Team
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-600/25">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Sign Up Free</h3>
              <p className="text-gray-600 text-sm">
                Register and tell us about your business. What industry, how many staff, what roles you need.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-600/25">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Get a Quote</h3>
              <p className="text-gray-600 text-sm">
                Receive instant pricing based on the agents you need. No hidden fees, no surprises.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-orange-500 text-white text-2xl font-bold mb-4 shadow-lg shadow-orange-500/25">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Deploy & Go</h3>
              <p className="text-gray-600 text-sm">
                Your AI agents are live within 24 hours. Forward your phone, connect email — done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AGENT ROSTER ─── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3 tracking-wide uppercase">
              Meet Your Team
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              23 AI Agents Across 7 Departments
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              From front desk to C-suite. Pick the agents you need,
              deploy them to your business, and watch them work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {agents.map((dept) => (
              <div key={dept.name} className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-gray-100">
                    <dept.icon className={`size-5 ${dept.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{dept.name}</h3>
                </div>
                <ul className="space-y-2.5">
                  {dept.roles.map((role) => (
                    <li key={role} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="size-4 text-blue-600 shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-500 mb-3 tracking-wide uppercase">
              Simple Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Pay Less Than a Human. Get More.
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              Minimum 30-day commitment. No surprise fees. Setup starts at $500.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.title}
                className={`rounded-xl border p-6 md:p-8 transition-all hover:shadow-lg flex flex-col ${
                  plan.popular
                    ? "border-blue-300 bg-white ring-2 ring-blue-100 shadow-md"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="inline-block self-start text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">
                    <Star className="size-3 inline mr-1" />
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-lg mb-1 text-gray-900">{plan.title}</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="size-4 text-blue-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                  asChild
                >
                  <Link to="/signup">Get Started <ArrowRight className="size-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Ready to Staff Up?
            </h2>
            <p className="text-lg text-blue-100">
              Register for free, get a quote in minutes, and have your first AI agent
              deployed within 24 hours. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="text-base h-12 px-8 bg-white text-blue-700 hover:bg-blue-50 shadow-lg" asChild>
                <Link to="/signup">
                  Get Your Free Quote
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 border-blue-300 text-white hover:bg-blue-500/20" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-blue-600" />
            <span className="font-semibold text-gray-900">AI Staffing Agency</span>
          </div>
          <p>© {new Date().getFullYear()} TRG Tech Link. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
