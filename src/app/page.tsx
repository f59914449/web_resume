import Hero from "../components/Hero";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import LiveCodeSection from "../components/LiveCodeSection";
import Contact from "../components/Contact";
import AlbumsMemories from "../components/AlbumsMemories";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="font-display text-xl font-semibold">Pro PK</div>
        <div className="flex items-center gap-4">
          <a href="/resume" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
            Resume
          </a>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6">
        <Hero />
        {/* Dynamic photo albums with memories mode */}
        <AlbumsMemories />
        <Skills />
        <Projects />
        <LiveCodeSection />
        <Contact />
      </main>
      <footer className="px-6 py-8 text-xs opacity-70">© {new Date().getFullYear()} Sopheakdey Chen</footer>
    </div>
  );
}
