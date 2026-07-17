import Link from 'next/link';
import type { Metadata } from 'next';
import EmailSignupSection from '@/components/prevent/EmailSignupSection';
import ResourceList from '@/components/prevent/ResourceList';
import PreventSidebar from '@/components/prevent/PreventSidebar';
import CategoryFilterButtons from './CategoryFilterButtons';
import { categoryConfigs, type CategoryConfig } from './categoryConfig';

type Props = {
  category: keyof typeof categoryConfigs;
};

/**
 * Shared Resource Category Page.
 *
 * Renders the full page layout for any SEL category:
 * - Hero banner with category-specific styling
 * - Resource list filtered by category
 * - Related articles section
 * - Sidebar with featured topics, recommendations, and signup
 * - Email signup section
 *
 * Usage:
 *   <ResourceCategoryPage category="prevent" />
 *   <ResourceCategoryPage category="respond" />
 *   <ResourceCategoryPage category="recover" />
 *   <ResourceCategoryPage category="teacher-support" />
 */
export default function ResourceCategoryPage({ category }: Props) {
  const config: CategoryConfig = categoryConfigs[category] || categoryConfigs.prevent;

  const articleCards = [
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

  return (
    <main className="bg-[#f1f6ed] text-[#3a3f3c]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8 md:py-10">
        {/* Hero Banner */}
        <section
          className="overflow-hidden rounded-[24px] md:rounded-[32px] p-6 md:p-8 lg:p-12"
          style={{
            borderColor: config.heroBorder,
            borderWidth: '1px',
            borderStyle: 'solid',
            backgroundColor: `color-mix(in srgb, ${config.heroBg}, transparent)`,
            boxShadow: config.heroShadow,
          }}
        >
          <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 md:gap-5">
              <div
                className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-[24px] md:rounded-[28px] text-2xl md:text-3xl text-[#3a3f3c] shadow-sm shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${config.heroIconBg}, transparent)` }}
              >
                {config.icon}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-[#3a3f3c]">
                {config.title}
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base leading-7 md:leading-8 text-[#4c503f] lg:text-lg">
              {config.description}
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="mt-10 md:mt-16 grid gap-10 md:gap-12 xl:grid-cols-[1.7fr_1fr] xl:gap-12">
          <div className="space-y-8">
            {/* Resources Section */}
            <section>
              <div className="mb-6 md:mb-8">
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#5c6c57]">
                  {config.sectionLabel}
                </p>
                <h2 className="mt-3 max-w-[700px] text-2xl md:text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-[#27312b]">
                  {config.sectionHeading}
                </h2>
                <CategoryFilterButtons
                  filters={config.featFilters}
                  heroBorder={config.heroBorder}
                />
              </div>
              <ResourceList />
            </section>

            {/* Related Articles Section */}
            <section>
              <div className="mb-4 md:mb-5">
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#5c6c57]">Related Articles</p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-[#27312b]">
                  {config.articleSectionHeading}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articleCards.map((a) => (
                  <BlogCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="pt-0 md:pt-1">
            <div className="rounded-[36px] border border-[#e6e0d0] bg-white p-5 shadow-sm">
              <PreventSidebar />
            </div>
          </aside>
        </div>

        {/* Email Signup */}
        <div className="mt-10 md:mt-12">
          <EmailSignupSection />
        </div>
      </div>
    </main>
  );
}

// --- Sub-components ---

function Breadcrumb({ config }: { config: CategoryConfig }) {
  return (
    <div className="text-sm text-[#5c6c57]">
      <Link href="/" className="font-medium text-[#5c6c57] hover:text-[#3b4b36]">
        Home
      </Link>
      <span className="mx-2">→</span>
      <span className="font-semibold text-[#34432b]">{config.breadcrumbLabel}</span>
    </div>
  );
}

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
};

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
