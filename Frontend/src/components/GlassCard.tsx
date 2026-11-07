import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "dark" | "input";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "backdrop-blur-md shadow-xl transition-all duration-300",
                    {
                        "bg-white/10 border border-white/20 rounded-xl": variant === "default",
                        "bg-black/20 border border-white/10 rounded-xl": variant === "dark",
                        "bg-white/20 border border-white/30 rounded-lg": variant === "input",
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
