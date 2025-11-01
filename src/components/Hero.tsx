"use client";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl sm:text-5xl font-bold"
      >
        <span className="accent-underline">Chen Sopheakdey</span>
      </motion.h1>
      <TypeAnimation
        sequence={[
          "ជិន សុភក្តី",
          1200, 
          "Full‑stack Engineer",
          1200,
          "Next.js + Node.js + MongoDB",
          1200,
          "Building delightful, fast UIs",
          1200,
        ]}
        wrapper="div"
        cursor={true}
        repeat={Infinity}
        className="text-lg sm:text-xl opacity-90"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl px-6 py-4 max-w-xl"
      >
        <p className="text-sm">
          10+ years crafting scalable web and mobile applications. Focus on performance,
          modern architectures, and production reliability.
        </p>
      </motion.div>
    </section>
  );
}