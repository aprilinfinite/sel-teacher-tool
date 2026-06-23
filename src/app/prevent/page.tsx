import Link from 'next/link';
import type { Metadata } from 'next';
import EmailSignupSection from '@/components/prevent/EmailSignupSection';

export const metadata: Metadata = {
  title: 'Prevent | Proactive Classroom Supports | SEL Teacher Tools',
  description:
    'Proactive SEL tools for teachers: morning check-ins, routines, visuals, community builders, emotional vocabulary, and sensory-friendly structure.',
};

type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
};

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
};

type Recommendation = {
  id: string;
  title: string;
  subtitle: string;
};

const resourceCards: Resource[] = [
  {
    id: 'r1',
    title: 'Morning Check-In Cards',
    description:
      'Simple visual prompts to help students name feelings and settle into the day with calm routines.',
    category: 'Routine',
    format: 'Printable PDF',
  },
  {
    id: 'r2',
    title: 'Calming Classroom Toolkit',
    description:
      'A collection of sensory-friendly supports, emotion anchors, and low-prep visuals for every learner.',
    category: 'Sensory Support',
    format: 'Download',
  },
  {
    id: 'r3',
    title: 'Community Builder Cards',
    description:
      'Easy small-group activities that strengthen connection, belonging, and positive classroom habits.',
    category: 'Community',
    format: 'Printable PDF',
  },
  {
    id: 'r4',
    title: 'Morning Routine Visuals',
    description:
      'Step-by-step visuals to support independence, transitions, and a predictable start to each day.',
    category: 'Visual Schedule',
    format: 'Worksheet',
  },
  {
    id: 'r5',
    title: 'Emotional Vocabulary Posters',
    description:
      'Classroom-ready emotion posters that support language, regulation, and self-awareness.',
    category: 'SEL Skill',
    format: 'Printable PDF',
  },
  {
    id: 'r6',
    title: 'Quiet Corner Planning Sheet',
    description:
      'A gentle support planner for establishing a calm space and teaching self-regulation routines.',
    category: 'Calming Space',
    format: 'Download',
  },
];

const articleCards: Article[] = [
  {
    id: 'a1',
    title: '5 Morning Practices to Start Class Calmly',
    excerpt:
      'Practical entry routines that welcome students, build ritual, and reduce anxiety before teaching begins.',
    category: 'Morning Routine',
  },
  {
    id: 'a2',
    title: 'Creating a Sensory-Safe Classroom',
    excerpt:
      'How to design a learning space that supports neurodivergent learners and helps the whole class stay grounded.',
    category: 'Neurodivergence',
  },
  {
    id: 'a3',
    title: 'Use Visuals to Build Independence',
    excerpt:
      'A guide to visual supports that reduce confusion, increase student ownership, and make expectations clear.',
    category: 'Visual Supports',
  },
];

const featuredTopics = [
  'Anxiety',
  'Neurodivergence',
  'Emotional Regulation',
  'Trauma',
  'Classroom Belonging',
];

const recommendations: Recommendation[] = [
  {
    id: 'q1',
    title: 'Classroom Support Quiz',
    subtitle: 'Answer a few questions and get the best next steps for your room.',
  },
  {
    id: 'q2',
    title: 'SEL Needs Finder',
    subtitle: 'Quick support ideas based on the challenge you are seeing today.',
  },
];

function Breadcrumb() {
  return (
    <div className="text-sm text-[#5c6c57]">
      <Link href="/" className="font-medium text-[#5c6c57] hover:text-[#3b4b36]">
        Home
      </Link>
      <span className="mx-2">→</span>
      <span className="font-semibold text-[#34432b]">Prevent</span>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="rounded-[24px] border border-[#e6e0d0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="overflow-hidden rounded-t-[24px] bg-[#eef3e9]">
        <div className="p-4">
          <div className="mx-auto h-40 max-w-[260px] rounded-[28px] border border-[#e5e1d6] bg-white p-4 shadow-inner">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-8 w-8 rounded-2xl bg-[#f2f0e6]" />
              <div className="h-3 w-16 rounded-full bg-[#d8d1c1]" />
            </div>
            <div className="mb-4 h-3 rounded-full bg-[#d8d1c1]" />
            <div className="mb-2 h-3 rounded-full bg-[#e4dccd] w-3/4" />
            <div className="mb-2 h-3 rounded-full bg-[#e4dccd] w-2/3" />
            <div className="h-3 rounded-full bg-[#e4dccd] w-5/6" />
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f1f3e9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5d6c57]">
            {resource.format}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#2f3b31]">{resource.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#6d6d6d]">{resource.description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-[#5e5a45]">Teacher resource</span>
          <button className="inline-flex items-center justify-center rounded-full bg-[#f7c948] px-5 py-3 text-sm font-semibold text-[#3a3f3c] transition hover:bg-[#e5b83c]">
            Download
          </button>
        </div>
      </div>
    </article>
  );
}

function BlogCard({ article }: { article: Article }) {
  return (
    <article className="rounded-[28px] border border-[#e6e0d0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 h-36 overflow-hidden rounded-3xl bg-[#eef3e9]" />
      <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[#6a7a68]">{article.category}</p>
      <h3 className="text-xl font-semibold text-[#2f3b31]">{article.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#6d6d6d]">{article.excerpt}</p>
      <button className="mt-5 inline-flex rounded-full border border-[#dcd4c6] bg-[#f7f4eb] px-5 py-3 text-sm font-semibold text-[#3b4b36] transition hover:border-[#b9c3ac] hover:bg-[#eef2e6]">
        Read Article
      </button>
    </article>
  );
}

function PreventSidebar() {
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-[#e6e0d0] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#5c6c57]">Featured Topics</h2>
        <div className="space-y-3">
          {featuredTopics.map((topic) => (
            <Link
              key={topic}
              href="#"
              className="flex items-center justify-between rounded-full bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#3e4a3c] transition hover:bg-[#fff4db]"
            >
              <span>{topic}</span>
              <span className="text-[#a9812c]">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#f1d8a0] bg-[#fff9f0] p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5c6c57]">Not sure where to start?</h2>
        <p className="mt-3 text-sm leading-6 text-[#4f4a3f]">
          Use these quick supports to find the right next step for your classroom.
        </p>
        <div className="mt-4 space-y-3">
          {recommendations.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center justify-between rounded-[24px] bg-white px-4 py-4 text-left text-sm font-medium text-[#3b4b36] transition hover:bg-[#fff4dd]"
            >
              <div>
                <p className="font-semibold text-[#3a3f3c]">{item.title}</p>
                <p className="mt-1 text-sm text-[#6d6d6d]">{item.subtitle}</p>
              </div>
              <span className="text-[#a9812c]">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#f3dfb0] bg-[#fff3dd] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6547]">Get new resources first</h2>
            <p className="mt-3 text-sm leading-6 text-[#4f5e4f]">
              Free tools delivered to your inbox when they're added.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7c948]/15 text-[#4f6547]">
            ✉️
          </div>
        </div>
        <Link
          href="#bottom-signup"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#f7c948] px-5 py-3 text-sm font-semibold text-[#3a3f3c] transition hover:bg-[#e5b33c]"
        >
          Join The List
        </Link>
      </section>
    </div>
  );
}

export default function PreventPage() {
  return (
    <main className="bg-[#f1f6ed] text-[#3a3f3c]">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-[#f0e4aa] bg-[#f7c948]/10 p-8 shadow-[0_24px_60px_-40px_rgba(110,82,25,0.22)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#f7c948]/20 text-3xl text-[#3a3f3c] shadow-sm">
                🌱
              </div>
              <h1 className="text-5xl font-semibold tracking-[-0.03em] text-[#3a3f3c] sm:text-6xl">
                Prevent
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#4c503f] sm:text-lg">
              Proactive classroom supports: morning check-ins, routines, visuals, community builders, emotional vocabulary, and sensory-friendly structure.
            </p>
          </div>
        </section>

        <div className="mt-16 grid gap-12 xl:grid-cols-[1.7fr_1fr] xl:gap-12">
          <div className="space-y-8">
            <section>
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-[#5c6c57]">Prevent resources</p>
                <h2 className="mt-3 max-w-[700px] text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-[#27312b]">
                  Tools to build calm before the moment becomes hard.
                </h2>
                <div className="mt-8 flex flex-wrap gap-2">
                  {[
                    { label: 'Morning Check-Ins', icon: '☀️' },
                    { label: 'Emotional Regulation', icon: '🌿' },
                    { label: 'Community Building', icon: '🤝' },
                    { label: 'Sensory Supports', icon: '🧩' },
                    { label: 'Visual Supports', icon: '📘' },
                  ].map((filter) => (
                    <button
                      key={filter.label}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[#f1d98c] bg-[#fff9f0] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3a3f3c] transition hover:border-[#e4d69a] hover:bg-[#fff3d9]"
                    >
                      <span>{filter.icon}</span>
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {resourceCards.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5">
                <p className="text-sm uppercase tracking-[0.3em] text-[#5c6c57]">Related Articles</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#27312b]">
                  Practical reads for supportive routines and calm classrooms.
                </h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {articleCards.map((article) => (
                  <BlogCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          </div>

          <aside className="pt-1">
            <div className="rounded-[36px] border border-[#e6e0d0] bg-white p-5 shadow-sm">
              <PreventSidebar />
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <EmailSignupSection />
        </div>
      </div>
    </main>
  );
}
