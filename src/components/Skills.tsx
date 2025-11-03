"use client";
import { motion } from "framer-motion";

const skillGroups = [
  {
    category: "Frontend",
    skills: [
      { name: "Next.js / React", level: 95 },
      { name: "TypeScript", level: 92 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Framer Motion", level: 85 },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js / Express", level: 90 },
      { name: "FastAPI (Python)", level: 88 },
      { name: "REST & GraphQL", level: 85 },
      { name: "WebSocket / Real-time", level: 82 },
    ],
  },
  {
    category: "Database",
    skills: [
      { name: "MongoDB", level: 88 },
      { name: "PostgreSQL", level: 85 },
      { name: "Redis / DragonflyDB", level: 80 },
    ],
  },
  {
    category: "Mobile & Tools",
    skills: [
      { name: "Flutter", level: 85 },
      { name: "Git / CI/CD", level: 90 },
      { name: "Docker", level: 82 },
      { name: "AWS / GCP", level: 75 },
    ],
  },
];

export default function Skills() {
  return (
    <section className="py-10">
      <h2 className="font-display text-3xl font-semibold mb-6">Skills</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {skillGroups.map((group) => (
          <div key={group.category} className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--accent)] mb-3">
              {group.category}
            </h3>
            <div className="space-y-3">
              {group.skills.map((s, idx) => (
                <div key={s.name} className="glass-card rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs opacity-70">{s.level}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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
          </div>
        ))}
      </div>
    </section>
  );
}
