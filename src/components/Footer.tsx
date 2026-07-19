import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Github, Twitter, Globe, ArrowRight } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <footer ref={ref} className="relative overflow-hidden bg-black px-6 pb-10 pt-28 md:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-serif-display text-4xl leading-tight tracking-tight text-white md:text-6xl"
        >
          Follow the work <em className="italic text-white/60">as it happens.</em>
        </motion.h2>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="mx-auto mt-10 w-full max-w-xl"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="shrink-0 rounded-full bg-white p-3 text-black transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowRight size={20} />
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/40">
            New releases, write-ups, and the occasional story behind a project. No noise.
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 flex justify-center gap-4"
        >
          {[
            { icon: Github, href: 'https://github.com/prabhavalabs', label: 'GitHub' },
            { icon: Twitter, href: 'https://x.com', label: 'Twitter / X' },
            { icon: Globe, href: 'https://prabhavalabs.com', label: 'Website' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="liquid-glass rounded-full p-4 text-white/70 transition-all hover:bg-white/5 hover:text-white"
            >
              <Icon size={20} />
            </a>
          ))}
        </motion.div>

        <div className="mt-16 flex flex-col items-center gap-2 border-t border-white/10 pt-8 text-xs text-white/30 md:flex-row md:justify-between">
          <p>
            <span className="font-sinhala text-white/50">ප්‍රභව</span> Labs — where ideas take
            origin.
          </p>
          <p>© {new Date().getFullYear()} Prabhava Labs. Open source, always.</p>
        </div>
      </div>
    </footer>
  );
}
