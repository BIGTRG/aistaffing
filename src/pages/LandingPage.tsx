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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const agents = [
  { name: "Front Desk", roles: ["Receptionist", "Scheduler", "Virtual Assistant"], icon: Headphones, color: "text-blue-400" },
  { name: "Sales", roles: ["Inbound Sales Rep", "Outbound Closer", "Lead Qualifier"], icon: DollarSign, color: "text-orange-400" },
  { name: "Marketing", roles: ["Social Media Manager", "Content Creator", "Ad Specialist"], icon: Palette, color: "text-purple-400" },
  { name: "Support", roles: ["Help Desk Agent", "Complaint Resolution", "Follow-Up Specialist"], icon: Headphones, color: "text-green-400" },
  { name: "Admin & Ops", roles: ["Data Entry Clerk", "Office Manager", "Intake Coordinator"], icon: Users, color: "text-cyan-400" },
  { name: "Finance", roles: ["Invoice Clerk", "Collections Agent", "Billing Coordinator"], icon: BarChart3, color: "text-yellow-400" },
];

const pricing = [
  { title: "AI Receptionist", price: "$300–$800", period: "/month", desc: "Answers calls, books appointments, handles FAQs. 24/7 availability.", popular: false },
  { title: "AI Sales Agent", price: "Hourly + Commission", period: "", desc: "Flat hourly rate + your commission structure. We take 30% of commissions earned.", popular: true },
  { title: "Marketing Team", price: "$1,000–$1,500", period: "/person/mo", desc: "Full-service: social media, ads, design, print coordination. Guaranteed retainer.", popular: false },
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-xs font-semibold text-orange-400 tracking-wide uppercase">
            <Bot className="size-3.5" />
            The Future of Staffing
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Your Staff Never
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-orange-400">
              Sleeps.
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Deploy AI-powered workers — receptionists, sales reps, marketing teams, and more. 
            No liability. No insurance. No workers' comp. No lunch breaks. 
            At your service 24 hours a day, 7 days a week.
          </p>

          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="text-base h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 border-gray-600" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-2">
              <Button size="lg" className="text-base h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-green-400" />
              <span>No contracts required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-green-400" />
              <span>Deploy in 24–48 hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section className="py-16 md:py-24 border-t bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
              Why AI Staffing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              When You Sleep, Your Staff Doesn't.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              First-of-its-kind staffing agency deploying AI agents instead of human temps.
              Same results. Fraction of the cost.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-blue-500/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-500/10 mb-5">
                  <Shield className="size-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Zero Liability</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No workers' comp. No insurance headaches. No HR issues. 
                  AI agents work without the legal overhead of human employees.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-orange-500/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-orange-500/10 blur-2xl transition-all group-hover:bg-orange-500/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-500/10 mb-5">
                  <Clock className="size-5 text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">24/7 Availability</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No sick days. No vacations. No being late. Your AI staff is always on, 
                  always professional, always ready.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-green-500/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-green-500/10 blur-2xl transition-all group-hover:bg-green-500/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-green-500/10 mb-5">
                  <Zap className="size-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Deploy in 24 Hours</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No training period. No ramp-up time. Tell us about your business, 
                  and your AI agent is live within a day.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-purple-500/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-purple-500/10 mb-5">
                  <Phone className="size-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone Forwarding</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Just enter your phone number. Calls forward to your AI receptionist — 
                  your own automatic answering service.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-cyan-500/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-cyan-500/10 blur-2xl transition-all group-hover:bg-cyan-500/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-cyan-500/10 mb-5">
                  <Mail className="size-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Email</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Emails come in, AI drafts the perfect response. 
                  You hit "Yes" to send or "Update" to adjust. That simple.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-orange-500/10 border border-blue-500/20 p-6 md:p-8 transition-all hover:shadow-lg">
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-500/10 mb-5">
                  <Sparkles className="size-5 text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Staffing + Temp Agency</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Long-term placements or short-term contracts. 30 days, 3 months, 6 months —
                  whatever your business needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AGENT ROSTER ─── */}
      <section className="py-16 md:py-24 border-t">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-400 mb-3 tracking-wide uppercase">
              Meet Your Team
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              23 AI Agents Across 7 Departments
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From front desk to C-suite. Pick the agents you need, 
              deploy them to your business, and watch them work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {agents.map((dept) => (
              <div key={dept.name} className="rounded-2xl border bg-card p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-muted">
                    <dept.icon className={`size-5 ${dept.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{dept.name}</h3>
                </div>
                <ul className="space-y-2">
                  {dept.roles.map((role) => (
                    <li key={role} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-3.5 text-green-400 shrink-0" />
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
      <section className="py-16 md:py-24 border-t bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
              Simple Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Pay Less Than a Human. Get More.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Minimum 30-day commitment. No surprise fees. Setup starts at $500.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.title}
                className={`rounded-2xl border p-6 md:p-8 transition-all hover:shadow-lg ${
                  plan.popular ? "border-blue-500/50 bg-gradient-to-br from-blue-600/10 to-blue-600/5 ring-1 ring-blue-500/20" : "bg-card"
                }`}
              >
                {plan.popular && (
                  <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-lg mb-1">{plan.title}</h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link to="/signup">Get Started <ArrowRight className="size-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-24 border-t">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Staff Up?
            </h2>
            <p className="text-lg text-muted-foreground">
              Register for free, get a quote in minutes, and have your first AI agent deployed within 24 hours. 
              No commitment required.
            </p>
            <Button size="lg" className="text-base h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link to="/signup">
                Get Your Free Quote
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-blue-400" />
            <span className="font-semibold text-foreground">AI Staffing Agency</span>
          </div>
          <p>© {new Date().getFullYear()} TRG Tech Link. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
