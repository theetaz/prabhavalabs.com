import { motion } from 'motion/react';
import { Github } from 'lucide-react';

const links = [
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/#about' },
];

export default function Navbar({ currentPath = '/' }: { currentPath?: string }) {
  const isActive = (href: string) =>
    href.startsWith('/#') ? false : currentPath === href || currentPath.startsWith(href + '/');

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-6 md:py-6"
    >
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full bg-black/55 px-5 py-3 backdrop-blur-2xl md:px-6">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-sinhala text-lg leading-none text-white">ප්‍රභව</span>
          <span className="font-serif-display text-lg italic leading-none text-white/90">Labs</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive(l.href) ? 'text-white' : 'text-white/70'
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="mt-0.5 block h-px w-full bg-white/60" aria-hidden="true" />
              )}
            </a>
          ))}
        </div>

        <a
          href="https://github.com/prabhavalabs"
          target="_blank"
          rel="noreferrer"
          className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          <Github size={16} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </motion.nav>
  );
}
