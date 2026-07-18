// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Phone, PhoneOff, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════
   ROI CALCULATOR — Show prospects what they're losing
   ═══════════════════════════════════════════════════════ */

const CONVERSION_RATE = 0.20;
const AI_COST = 200; // Starter plan

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Custom Slider ─── */
function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  label,
  icon: Icon,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  formatValue: (v: number) => string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#2B7AE0]/10 flex items-center justify-center">
            <Icon className="size-4 text-[#2B7AE0]" />
          </div>
          <span className="text-sm font-medium text-[#1A1D23]/80">{label}</span>
        </div>
        <span className="text-sm font-bold font-mono text-[#1A1D23] bg-[#1A1D23]/[0.04] px-2.5 py-1 rounded">
          {formatValue(value)}
        </span>
      </div>
      <div className="relative h-10 flex items-center">
        <div className="absolute inset-x-0 h-2 rounded-full bg-[#1A1D23]/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F27A2E] to-[#FF9A52] transition-[width] duration-75"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="roi-slider absolute inset-x-0 w-full h-10 cursor-pointer appearance-none bg-transparent z-10"
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-[#1A1D23]/25 uppercase">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function ROICalculator() {
  const [callsPerDay, setCallsPerDay] = useState(50);
  const [missRate, setMissRate] = useState(30);
  const [dealValue, setDealValue] = useState(500);
  const [staffedHours, setStaffedHours] = useState(8);

  // Calculations
  const missedCallsPerMonth = Math.round(callsPerDay * (missRate / 100) * 30);
  const lostRevenuePerMonth = Math.round(missedCallsPerMonth * dealValue * CONVERSION_RATE);
  const netSavingsPerMonth = Math.max(0, lostRevenuePerMonth - AI_COST);
  const annualSavings = netSavingsPerMonth * 12;
  const unstaffedHours = 24 - staffedHours;
  const afterHoursMissed = Math.round(callsPerDay * (unstaffedHours / 24) * 30);

  // Scroll reveal
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="roi-calculator"
      className={`py-24 md:py-32 px-6 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-8 h-px bg-[#F27A2E]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F27A2E]">Revenue Impact</span>
            <div className="w-8 h-px bg-[#F27A2E]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1A1D23]">
            How Much Are Missed Calls{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Costing&nbsp;You?</span>
          </h2>
          <p className="text-[#3A3F48]/50 max-w-xl mx-auto">
            Adjust the sliders to match your business. Watch the savings add up in real-time.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">

          {/* Left — Inputs */}
          <div className="relative border border-[#1A1D23]/10 rounded-lg p-8 bg-white/40 backdrop-blur-sm space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#2B7AE0] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#1A1D23]/40">Your Business Inputs</span>
            </div>

            <RangeSlider
              min={5}
              max={200}
              step={5}
              value={callsPerDay}
              onChange={setCallsPerDay}
              formatValue={(v) => `${v} calls`}
              label="Calls per day"
              icon={Phone}
            />
            <RangeSlider
              min={10}
              max={60}
              step={5}
              value={missRate}
              onChange={setMissRate}
              formatValue={(v) => `${v}%`}
              label="Missed call rate"
              icon={PhoneOff}
            />
            <RangeSlider
              min={50}
              max={10000}
              step={50}
              value={dealValue}
              onChange={setDealValue}
              formatValue={(v) => `$${v.toLocaleString()}`}
              label="Average deal value"
              icon={DollarSign}
            />
            <RangeSlider
              min={4}
              max={12}
              step={1}
              value={staffedHours}
              onChange={setStaffedHours}
              formatValue={(v) => `${v} hrs`}
              label="Front desk staffed hours"
              icon={Clock}
            />
          </div>

          {/* Right — Results */}
          <div className="space-y-5">
            {/* Losses card */}
            <div className="border border-red-500/15 rounded-lg p-6 bg-red-50/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-red-500/60">What You're Losing</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold font-mono text-red-600">
                    <AnimatedNumber value={missedCallsPerMonth} />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.1em] text-red-500/40 mt-1">Missed calls / month</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-red-600">
                    <AnimatedNumber value={afterHoursMissed} />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.1em] text-red-500/40 mt-1">After-hours calls lost</div>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/10">
                <div className="text-[11px] uppercase tracking-[0.1em] text-red-500/40 mb-1">Lost revenue per month</div>
                <div className="text-3xl font-bold font-mono text-red-600">
                  <AnimatedNumber value={lostRevenuePerMonth} prefix="$" />
                </div>
                <div className="text-[10px] text-red-400/50 mt-1 font-mono">
                  Based on {(CONVERSION_RATE * 100).toFixed(0)}% conversion rate
                </div>
              </div>
            </div>

            {/* Savings card */}
            <div className="relative border border-[#2B7AE0]/20 rounded-lg p-6 bg-[#1A1D23] overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#2B7AE0] opacity-[0.08] blur-[60px]" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#F27A2E] opacity-[0.06] blur-[40px]" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-400/70">With AI Staffing Agency</span>
                </div>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.1em] text-white/30 mb-1">AI agent cost</div>
                    <div className="text-lg font-bold font-mono text-white/60">${AI_COST}/mo</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.1em] text-[#2B7AE0]/60 mb-1">Net savings / month</div>
                    <div className="text-2xl font-bold font-mono text-[#2B7AE0]">
                      <AnimatedNumber value={netSavingsPerMonth} prefix="$" />
                    </div>
                  </div>
                </div>

                {/* Big annual number */}
                <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-[#F27A2E]/60 mb-2">
                    Annual savings
                  </div>
                  <div className="text-5xl md:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#F27A2E] via-[#FF9A52] to-[#F27A2E] leading-none">
                    <AnimatedNumber value={annualSavings} prefix="$" />
                  </div>
                  <div className="text-[10px] text-white/20 mt-2 font-mono">
                    That's {annualSavings > 0 ? Math.round(annualSavings / (AI_COST * 12)) : 0}x return on your AI investment
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <a href="#pricing">
                    <Button className="w-full bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.3)] hover:shadow-[0_0_40px_rgba(242,122,46,0.4)] transition-all">
                      Start Saving Now
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick stat */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/30 border border-[#1A1D23]/[0.06]">
              <TrendingUp className="size-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-[#3A3F48]/50">
                <span className="font-semibold text-[#1A1D23]/70">93% of missed calls never call back.</span>{" "}
                An AI receptionist answers every call, 24/7/365.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
