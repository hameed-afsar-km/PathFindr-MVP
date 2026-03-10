"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";

interface GlowingEffectProps {
    blur?: number;
    inactiveZone?: number;
    proximity?: number;
    spread?: number;
    variant?: "default" | "white";
    glow?: boolean;
    className?: string;
    disabled?: boolean;
    movementDuration?: number;
    borderWidth?: number;
}

const usePointerPosition = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handle = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener("pointermove", handle, { passive: true });
        return () => window.removeEventListener("pointermove", handle);
    }, []);
    return pos;
};

const GlowingEffect = memo(
    ({
        blur = 0,
        inactiveZone = 0.7,
        proximity = 0,
        spread = 20,
        variant = "default",
        glow = false,
        className,
        movementDuration = 2, // This prop is no longer used
        borderWidth = 1,
        disabled = false,
    }: GlowingEffectProps) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const pos = usePointerPosition();

        useEffect(() => {
            if (disabled || !containerRef.current) {
                if (containerRef.current) {
                    containerRef.current.style.setProperty("--active", "0");
                }
                return;
            }

            const element = containerRef.current;
            const { left, top, width, height } = element.getBoundingClientRect();

            const center = [left + width * 0.5, top + height * 0.5];
            const distanceFromCenter = Math.hypot(pos.x - center[0], pos.y - center[1]);
            const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

            if (distanceFromCenter < inactiveRadius) {
                element.style.setProperty("--active", "0");
                return;
            }

            const isActive =
                pos.x > left - proximity &&
                pos.x < left + width + proximity &&
                pos.y > top - proximity &&
                pos.y < top + height + proximity;

            element.style.setProperty("--active", isActive ? "1" : "0");

            if (isActive) {
                const targetAngle = (180 * Math.atan2(pos.y - center[1], pos.x - center[0])) / Math.PI + 90;
                element.style.setProperty("--start", String(targetAngle));
            }
        }, [pos, inactiveZone, proximity, disabled]);

        return (
            <>
                <div
                    className={cn(
                        "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
                        glow && "opacity-100",
                        variant === "white" && "border-white",
                        disabled && "!block"
                    )}
                />
                <div
                    ref={containerRef}
                    style={
                        {
                            "--blur": `${blur}px`,
                            "--spread": spread,
                            "--start": "0",
                            "--active": "0",
                            "--glowingeffect-border-width": `${borderWidth}px`,
                            "--repeating-conic-gradient-times": "5",
                            "--gradient":
                                variant === "white"
                                    ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                                    : `radial-gradient(circle, hsl(var(--primary)) 10%, transparent 40%),
                radial-gradient(circle at 40% 40%, hsl(var(--accent)) 10%, transparent 30%),
                radial-gradient(circle at 60% 60%, hsl(var(--primary)) 15%, transparent 40%), 
                radial-gradient(circle at 40% 60%, hsl(var(--accent)) 15%, transparent 40%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  hsl(var(--primary)) 0%,
                  hsl(var(--accent)) calc(12.5% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(25% / var(--repeating-conic-gradient-times)),
                  hsl(var(--accent)) calc(37.5% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(50% / var(--repeating-conic-gradient-times)), 
                  hsl(var(--accent)) calc(62.5% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(75% / var(--repeating-conic-gradient-times)),
                  hsl(var(--accent)) calc(87.5% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(100% / var(--repeating-conic-gradient-times))
                )`,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
                        glow && "opacity-100",
                        blur > 0 && "blur-[var(--blur)] ",
                        className,
                        disabled && "!hidden"
                    )}
                >
                    <div
                        className={cn(
                            "glow",
                            "rounded-[inherit]",
                            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                            "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                            "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                            "after:[mask-clip:padding-box,border-box]",
                            "after:[mask-composite:intersect]",
                            "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
                        )}
                    />
                </div>
            </>
        );
    }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
