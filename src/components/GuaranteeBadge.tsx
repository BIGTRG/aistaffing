import { Shield, Check } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   30-DAY MONEY-BACK GUARANTEE BADGE
   ═══════════════════════════════════════════════════════ */

type BadgeVariant = "dark" | "light" | "inline";

interface GuaranteeBadgeProps {
  variant?: BadgeVariant;
  className?: string;
}

export function GuaranteeBadge({ variant = "dark", className = "" }: GuaranteeBadgeProps) {
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative shrink-0">
          <Shield className="size-4 text-[#2B7AE0]" fill="currentColor" fillOpacity={0.15} />
          <Check className="size-2 text-[#2B7AE0] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
        </div>
        <span className="text-[11px] font-medium text-[#3A3F48]/50">30-day money-back guarantee</span>
      </div>
    );
  }

  if (variant === "light") {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-[#1A1D23]/[0.06] bg-white/30 backdrop-blur-sm ${className}`}>
        <div className="relative shrink-0">
          <Shield className="size-5 text-[#2B7AE0]" fill="currentColor" fillOpacity={0.15} />
          <Check className="size-2.5 text-[#2B7AE0] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
        </div>
        <div>
          <div className="text-xs font-semibold text-[#1A1D23]/70">30-Day Money-Back Guarantee</div>
          <div className="text-[10px] text-[#3A3F48]/40">Try risk-free. Full refund if not satisfied.</div>
        </div>
      </div>
    );
  }

  // "dark" default
  return (
    <div className={`relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#1A1D23] px-5 py-4 ${className}`}>
      {/* Subtle glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#2B7AE0] opacity-[0.08] blur-[30px]" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full border border-[#2B7AE0]/30 bg-[#2B7AE0]/10 flex items-center justify-center">
            <Shield className="size-5 text-[#2B7AE0]" fill="currentColor" fillOpacity={0.2} />
            <Check className="size-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-white/90 tracking-wide">30-Day Money-Back Guarantee</div>
          <div className="text-[10px] text-white/30 mt-0.5">Try risk-free. If you're not satisfied, get a full refund.</div>
        </div>
      </div>
    </div>
  );
}
