"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  description: string;
  tags: string[];
  image?: string;
};

export default function ProjectCard({ title, description, tags, image = "/window.svg" }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    x.set(px);
    y.set(py);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="glass-card p-4 rounded-xl h-full"
    >
      <div style={{ transform: "translateZ(30px)" }} className="space-y-3">
        <Image src={image} alt="project" width={64} height={64} />
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}