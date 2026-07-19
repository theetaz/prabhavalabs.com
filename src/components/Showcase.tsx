import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const ParticleWave = lazy(() => import('./ParticleWave'));

const EASE = [0.22, 1, 0.36, 1] as const;

export type ShowcaseProject = {
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  repo?: string;
};

export default function Showcase({ project }: { project: ShowcaseProject | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Scroll-linked zoom-in: the frame grows from 92% to full size as it
  // enters, while the video inside starts overscanned and settles.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  const frameScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  if (!project) return null;

  return (
    <section className="overflow-hidden bg-black px-6 pb-24 pt-6 md:pb-36 md:pt-10">
      <motion.div
        ref={ref}
        style={{ scale: frameScale }}
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative mx-auto aspect-[4/5] max-w-6xl overflow-hidden rounded-3xl sm:aspect-video"
      >
        <motion.div style={{ scale: videoScale }} className="absolute inset-0">
          {mounted && (
            <Suspense fallback={null}>
              <ParticleWave />
            </Suspense>
          )}
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-end md:p-10">
          <div className="liquid-glass max-w-md rounded-2xl p-6 md:p-8">
            <p className="mb-3 text-xs uppercase tracking-widest text-white/50">
              Featured project
            </p>
            <h3 className="font-serif-display mb-2 text-2xl tracking-tight text-white md:text-3xl">
              {project.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/70 md:text-base">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {project.repo && (
            <motion.a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white"
            >
              View source <ArrowUpRight size={16} />
            </motion.a>
          )}
        </div>
      </motion.div>
    </section>
  );
}
