import Hero from '@/components/Hero';
import Header from '@/components/Header';
import CoachingCTA from '@/components/CoachingCTA';
import InstagramPosts from '@/components/InstagramPosts';
import HubCard from '@/components/HubCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';

const hubSections = [
  {
    title: 'Articles',
    description: 'Read up on the latest in hypertrophy, nutrition, strength, and health.',
    href: '/blog',
    bg: 'bg-black',
  },
  {
    title: 'Studies',
    description: 'Browse scientific studies and research breakdowns.',
    href: '/studies',
    bg: 'bg-black',
  },
  {
    title: 'Videos',
    description: 'Watch free fitness videos directly on our site.',
    href: '/videos',
    bg: 'bg-black',
  },
  {
    title: 'Calculators',
    description: 'Calculate your BMR, TDEE, macros, and more.',
    href: '/calculators',
    bg: 'bg-black',
  },
  {
    title: 'Guides',
    description: 'Explore our free and premium guidebooks.',
    href: '/guides',
    bg: 'bg-black',
  },
  {
    title: 'Coaching',
    description: 'Reach out for personalized coaching sessions.',
    href: '/coaching',
    bg: 'bg-black',
  },
];

export default function HomePage() {
  return (
    <main>
      <Header />
      <LeadCaptureForm />
      <CoachingCTA />
      <Hero />
      <InstagramPosts />
      <section className="p-0 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-1 bg-neutral-900 pb-1 py-1">
        {hubSections.map((section) => (
          <HubCard
            key={section.title}
            title={section.title}
            description={section.description}
            href={section.href}
            bg={section.bg}
          />
        ))}
      </section>
    </main>
  );
}
