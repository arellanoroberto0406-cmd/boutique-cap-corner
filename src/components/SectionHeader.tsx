import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  icon?: ReactNode;
  className?: string;
}

const SectionHeader = ({
  eyebrow,
  title,
  description,
  align = "center",
  icon,
  className,
}: SectionHeaderProps) => {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={cn("flex flex-col gap-3 mb-10 md:mb-14", alignment, className)}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
          {icon && <span className="text-primary">{icon}</span>}
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
            {eyebrow}
          </span>
        </div>
      )}

      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
        <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </span>
      </h2>

      {/* Decorative underline */}
      <div className={cn("flex items-center gap-2", align === "center" ? "justify-center" : "justify-start")}>
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {description && (
        <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
