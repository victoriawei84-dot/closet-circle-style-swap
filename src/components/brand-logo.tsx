import { cn } from "@/lib/utils";

export function BrandLogo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return <span aria-label="SisUse" className={cn("brand-logo", inverse ? "text-ink-foreground" : "text-primary", className)}><span>Sis</span><em>Use</em></span>;
}