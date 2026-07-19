import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden bg-black px-6 pb-14 pt-32 md:pb-20 md:pt-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8 text-sm uppercase tracking-widest text-white/40"
        >
          The Story
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="font-serif-display text-4xl leading-[1.12] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          One developer, building{' '}
          <em className="italic text-white/60">in the open</em> —<br className="hidden md:block" />
          every tool with a <em className="italic text-white/60">story worth telling.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
          className="mx-auto mt-10 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base"
        >
          Prabhava Labs is the home for everything I release as open source — the experiments, the
          production tools, and the lessons in between. No pitch decks, no gatekeeping. Just useful
          software, its source, and the reasoning behind every decision.
        </motion.p>
      </div>
    </section>
  );
}
