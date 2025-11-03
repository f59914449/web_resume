"use client";
import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";

type P = { title: string; description: string; tags: string[]; url?: string };

export default function Projects() {
  const [projects, setProjects] = useState<P[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${base}/projects`)
      .then((r) => r.json())
      .then(setProjects)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <section className="py-10">
      <h2 className="font-display text-3xl font-semibold mb-6">Projects</h2>
      {!projects && !error && <p className="opacity-70">Loading projects…</p>}
      {error && <p className="text-red-400 text-sm">Failed to load projects. Showing static examples.</p>}
      <div className="grid md:grid-cols-3 gap-6">
        {(projects || [
          {
            title: "HR Management System",
            description:
              "Full-stack HR system with Cambodian legal compliance, real-time attendance tracking, and automated payroll processing. Multi-role access with audit logging.",
            tags: ["FastAPI", "Flutter", "PostgreSQL", "WebSocket"],
            impact: "Reduced payroll processing time by 80%",
            url: "#contact",
          },
          {
            title: "Multi-Platform E-commerce",
            description:
              "React/Next.js web + Flutter mobile apps with local banking integration (ABA/Acleda). SEO-optimized with responsive design.",
            tags: ["Next.js", "React", "MongoDB", "Flutter"],
            impact: "Handled 50k+ monthly active users",
            url: "#contact",
          },
          {
            title: "Real-Time Notification System",
            description:
              "WebSocket infrastructure supporting 10,000+ concurrent users with 99.9% uptime. DragonflyDB for session management.",
            tags: ["WebSocket", "DragonflyDB", "Redis", "Scaling"],
            impact: "99.9% uptime, 10k+ concurrent users",
            url: "#contact",
          },
        ]).map((p) => (
          <ProjectCard key={p.title} title={p.title} description={p.description} tags={p.tags} />
        ))}
      </div>
    </section>
  );
}