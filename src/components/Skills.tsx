"use client";
import { motion } from "framer-motion";

const skills = [
  { name: "Next.js", level: 90 },
  { name: "Node.js", level: 88 },
  { name: "FastAPI", level: 85 },
  { name: "MongoDB", level: 82 },
  { name: "PostgreSQL", level: 80 },
  { name: "Flutter", level: 75 },
];

export default function Skills() {
  return (
    <section className="py-10">
      <h2 className="font-display text-3xl font-semibold mb-6">Skills</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {skills.map((s, idx) => (
          <div key={s.name} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{s.name}</span>
              <span className="text-xs opacity-70">{s.level}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${s.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.05 }}
                className="h-full bg-[var(--accent)]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}