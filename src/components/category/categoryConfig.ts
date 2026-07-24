/**
 * Category configuration for the four SEL category pages.
 *
 * Each category has its own:
 * - Hero banner styling (border, background, shadow)
 * - Icon
 * - Title
 * - Description
 * - Breadcrumb label
 * - Metadata (SEO)
 * - Feature filter buttons
 * - Section heading text
 */

export type CategoryConfig = {
  slug: string;
  title: string;
  icon: string;
  description: string;
  breadcrumbLabel: string;
  heroBorder: string;
  heroBg: string;
  heroShadow: string;
  heroIconBg: string;
  sectionLabel: string;
  sectionHeading: string;
  articleSectionHeading: string;
  featFilters: Array<{ label: string; icon: string }>;
  metadata: {
    title: string;
    description: string;
  };
};

const preventFilters = [
  { label: 'Morning Check-Ins', icon: '☀️' },
  { label: 'Emotional Regulation', icon: '🌿' },
  { label: 'Community Building', icon: '🤝' },
  { label: 'Sensory Supports', icon: '🧩' },
  { label: 'Visual Supports', icon: '📘' },
];

const respondFilters = [
  { label: 'Morning Check-Ins', icon: '☀️' },
  { label: 'Emotional Regulation', icon: '🌿' },
  { label: 'Community Building', icon: '🤝' },
  { label: 'Sensory Supports', icon: '🧩' },
  { label: 'Visual Supports', icon: '📘' },
];

const recoverFilters = [
  { label: 'Morning Check-Ins', icon: '☀️' },
  { label: 'Emotional Regulation', icon: '🌿' },
  { label: 'Community Building', icon: '🤝' },
  { label: 'Sensory Supports', icon: '🧩' },
  { label: 'Visual Supports', icon: '📘' },
];

const teacherSupportFilters = [
  { label: 'Morning Check-Ins', icon: '☀️' },
  { label: 'Emotional Regulation', icon: '🌿' },
  { label: 'Community Building', icon: '🤝' },
  { label: 'Sensory Supports', icon: '🧩' },
  { label: 'Visual Supports', icon: '📘' },
];

export const categoryConfigs: Record<string, CategoryConfig> = {
  prevent: {
    slug: 'prevent',
    title: 'Prevent',
    icon: '🌱',
    description:
      'Proactive classroom supports: morning check-ins, routines, visuals, community builders, emotional vocabulary, and sensory-friendly structure.',
    breadcrumbLabel: 'Prevent',
    heroBorder: '#f0e4aa',
    heroBg: '#f7c948/10',
    heroShadow: '0 24px 60px -40px rgba(110,82,25,0.22)',
    heroIconBg: '#f7c948/20',
    sectionLabel: 'Prevent resources',
    sectionHeading: 'Tools to build calm before the moment becomes hard.',
    articleSectionHeading: 'Practical reads for supportive routines and calm classrooms.',
    featFilters: preventFilters,
    metadata: {
      title: 'Prevent | Proactive Classroom Supports',
      description:
        'Proactive SEL tools for teachers: morning check-ins, routines, visuals, community builders, emotional vocabulary, and sensory-friendly structure.',
    },
  },
  respond: {
    slug: 'respond',
    title: 'Respond',
    icon: '💬',
    description:
      'In-the-moment support: de-escalation scripts, calm-down tools, conflict support, anxiety support, and classroom reset strategies.',
    breadcrumbLabel: 'Respond',
    heroBorder: '#BFD7F2',
    heroBg: '#5DADE2/10',
    heroShadow: '0 24px 60px -40px rgba(93,173,226,0.22)',
    heroIconBg: '#5DADE2/20',
    sectionLabel: 'Respond resources',
    sectionHeading: 'Tools to de-escalate in the moment.',
    articleSectionHeading: 'Practical reads for supportive routines and calm classrooms.',
    featFilters: respondFilters,
    metadata: {
      title: 'Respond | De-escalate in the Moment',
      description:
        'In-the-moment support: de-escalation scripts, calm-down tools, conflict support, anxiety support, and classroom reset strategies.',
    },
  },
  recover: {
    slug: 'recover',
    title: 'Recover',
    icon: '✨',
    description:
      'Repair and re-entry: reflection sheets, restorative questions, re-entry plans, repair conversations, and processing tools for students.',
    breadcrumbLabel: 'Recover',
    heroBorder: '#CBB9E8',
    heroBg: '#8E7CC3/10',
    heroShadow: '0 24px 60px -40px rgba(142,124,195,0.22)',
    heroIconBg: '#8E7CC3/20',
    sectionLabel: 'Recover resources',
    sectionHeading: 'Tools to repair after a hard moment.',
    articleSectionHeading: 'Practical reads for supportive routines and calm classrooms.',
    featFilters: recoverFilters,
    metadata: {
      title: 'Recover | Repair After a Hard Moment',
      description:
        'Repair and re-entry: reflection sheets, restorative questions, re-entry plans, repair conversations, and processing tools for students.',
    },
  },
  'teacher-support': {
    slug: 'teacher-support',
    title: 'Teacher Support',
    icon: '☕',
    description:
      'Adult SEL and burnout prevention: emotional regulation tools for educators, stress supports, boundary scripts, reflection journals, and morning routines.',
    breadcrumbLabel: 'Teacher Support',
    heroBorder: '#FFD5C2',
    heroBg: '#FF9D6E/10',
    heroShadow: '0 24px 60px -40px rgba(255,157,110,0.22)',
    heroIconBg: '#FF9D6E/20',
    sectionLabel: 'Teacher Support resources',
    sectionHeading: 'Tools to take care of yourself, too.',
    articleSectionHeading: 'Practical reads for supportive routines and calm classrooms.',
    featFilters: teacherSupportFilters,
    metadata: {
      title: 'Teacher Support | Take Care of Yourself, Too',
      description:
        'Adult SEL and burnout prevention: emotional regulation tools for educators, stress supports, boundary scripts, reflection journals, and morning routines.',
    },
  },
};

/**
 * Get the category config for a given pathname.
 * Falls back to 'prevent' if no match is found.
 */
export function getCategoryConfig(pathname: string): CategoryConfig {
  if (pathname.includes('/respond')) return categoryConfigs.respond;
  if (pathname.includes('/recover')) return categoryConfigs.recover;
  if (pathname.includes('/teacher-support')) return categoryConfigs['teacher-support'];
  return categoryConfigs.prevent;
}
