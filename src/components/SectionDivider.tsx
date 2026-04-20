import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "line" | "diamond" | "wave";
  className?: string;
}

const SectionDivider = ({ variant = "diamond", className }: SectionDividerProps) => {
  if (variant === "wave") {
    return (
      <div className={cn("w-full overflow-hidden leading-none", className)} aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="w-full h-8 md:h-12 text-primary/10"
        >
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  if (variant === "line") {
    return (
      <div className={cn("container mx-auto px-4", className)} aria-hidden="true">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    );
  }

  // diamond (default)
  return (
    <div className={cn("container mx-auto px-4 py-2", className)} aria-hidden="true">
      <div className="flex items-center justify-center gap-4">
        <span className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent to-primary/40" />
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary/60" />
          <span className="h-2 w-2 rotate-45 bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
          <span className="h-1 w-1 rounded-full bg-primary/60" />
        </div>
        <span className="h-px flex-1 max-w-[200px] bg-gradient-to-l from-transparent to-primary/40" />
      </div>
    </div>
  );
};

export default SectionDivider;
