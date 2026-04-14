"use client";

import { motion } from "framer-motion";

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none">
            {/* Layer 1: Animated Linear Gradient (High Performance) */}
            <div className="absolute inset-0 animate-gradient-slow opacity-30" />

            {/* Layer 2: Mesh Gradient for Depth (High Performance Blur) */}
            <div className="mesh-gradient" />

            {/* Layer 3: Optimized Moving Beams */}
            <motion.div
                animate={{
                    translateX: ["-100%", "200%"],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 8
                }}
                className="absolute top-0 left-0 w-[40%] h-full -skew-x-12 gpu"
                style={{
                    background: "linear-gradient(to right, transparent, hsla(var(--primary) / 0.03), transparent)"
                }}
            />

            {/* Layer 4: Minimal Particles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: (i * 33) + "%", y: "110%" }}
                    animate={{
                        opacity: [0, 0.1, 0],
                        y: ["110%", "-10%"],
                    }}
                    transition={{
                        duration: 25 + i * 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 6
                    }}
                    className="absolute w-[1px] h-[40px] bg-gradient-to-b from-primary/20 to-transparent gpu"
                    style={{ left: (i * 33) + "%" }}
                />
            ))}

            {/* Static Overlays */}
            <div
                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"
            />
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)]"
            />
        </div>
    );
};
