"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${base}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Message sent! Thank you.");
      reset();
    } catch {
      alert("Failed to send message");
    }
  }

  return (
    <section className="py-10">
      <h2 className="font-display text-3xl font-semibold mb-6">Contact</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-xl">
        <input
          {...register("name")}
          placeholder="Your name"
          className="glass-card rounded-lg px-4 py-2"
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}

        <input
          {...register("email")}
          placeholder="Email"
          className="glass-card rounded-lg px-4 py-2"
        />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}

        <textarea
          {...register("message")}
          placeholder="Message"
          rows={5}
          className="glass-card rounded-lg px-4 py-2"
        />
        {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg px-4 py-2 bg-[var(--accent)] text-[#0A192F] font-semibold hover:opacity-90 transition"
        >
          {isSubmitting ? "Sending…" : "Send"}
        </button>
      </form>
    </section>
  );
}