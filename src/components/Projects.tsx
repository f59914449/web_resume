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
            title: "HR Management System (static)",
            description:
              "Full-stack HR with compliance, attendance, payroll.",
            tags: ["FastAPI", "Flutter", "PostgreSQL"],
          },
          {
            title: "E-commerce Platform (static)",
            description: "Web + mobile store with payments.",
            tags: ["Next.js", "React", "MongoDB"],
          },
          {
            title: "Real-Time Notifications (static)",
            description: "WebSocket infra with 10k+ concurrent users.",
            tags: ["WebSocket", "DragonflyDB"],
          },
        ]).map((p) => (
          <ProjectCard key={p.title} title={p.title} description={p.description} tags={p.tags} />
        ))}
      </div>
    </section>
  );
}