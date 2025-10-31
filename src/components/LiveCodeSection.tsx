"use client";
import dynamic from "next/dynamic";

const LiveCode = dynamic(() => import("./LiveCode"), {
  ssr: false,
  loading: () => <p className="opacity-70">Loading interactive code…</p>,
});

export default function LiveCodeSection() {
  return <LiveCode />;
}