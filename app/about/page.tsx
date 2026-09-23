import Header from "@/components/Header";
import { PROFILE } from "@/lib/profile";
import { Github } from "lucide-react";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream text-muted pb-32">
      <Header />

      <main className="max-w-2xl mx-auto px-6 mt-12 md:mt-24 animate-fade-in">
        <div className="text-crimson text-xs font-bold tracking-[0.4em] mb-10 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-crimson" />
          ABOUT
          <span className="w-8 h-px bg-crimson" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-paper border border-border rounded-xl p-8">
          <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center text-4xl shrink-0">
            {PROFILE.emoji}
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-muted mb-1">
              {PROFILE.name} <span className="text-subtle font-normal text-sm">· {PROFILE.role}</span>
            </h1>
            <p className="text-sm text-subtle leading-relaxed break-keep mb-4">{PROFILE.bio}</p>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-5">
              {PROFILE.stack.map((tag) => (
                <span key={tag} className="text-xs bg-cream text-muted px-3 py-1 rounded-full border border-border">
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-subtle hover:text-crimson transition-colors uppercase"
            >
              <Github size={14} />
              GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
