export type ResourceCategory = 'prevent' | 'respond' | 'recover' | 'teacher-support';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  thumbnail: string;
  pdf: string;
  featured: boolean;
  gradeLevel: string[];
  resourceFormat: string;
  selSkill: string;
  learnerNeed: string;
}

export const resources: Resource[] = [
  {
    id: '1',
    title: 'Breathing Techniques for Calm',
    description: 'A comprehensive guide to teach students various breathing techniques to manage stress and anxiety in the classroom.',
    category: 'prevent',
    thumbnail: '/resources/breathing-thumbnail.jpg',
    pdf: '/resources/breathing-techniques.pdf',
    featured: true,
    gradeLevel: ['K-2', '3-5', '6-8'],
    resourceFormat: 'Lesson Plan',
    selSkill: 'Self-Awareness',
    learnerNeed: 'Stress Management',
  },
  {
    id: '2',
    title: 'Mindfulness Activities',
    description: 'Interactive mindfulness activities designed to help students develop focus, awareness, and emotional regulation skills.',
    category: 'prevent',
    thumbnail: '/resources/mindfulness-thumbnail.jpg',
    pdf: '/resources/mindfulness-activities.pdf',
    featured: true,
    gradeLevel: ['3-5', '6-8', '9-10'],
    resourceFormat: 'Activity',
    selSkill: 'Self-Management',
    learnerNeed: 'Emotional Regulation',
  },
  {
    id: '3',
    title: 'Building Empathy in Students',
    description: 'Strategies and activities to cultivate empathy and social awareness among students through engaging discussions and role-play.',
    category: 'prevent',
    thumbnail: '/resources/empathy-thumbnail.jpg',
    pdf: '/resources/building-empathy.pdf',
    featured: false,
    gradeLevel: ['3-5', '6-8'],
    resourceFormat: 'Guide',
    selSkill: 'Social Awareness',
    learnerNeed: 'Empathy Development',
  },
  {
    id: '4',
    title: 'Gratitude Journal Templates',
    description: 'Printable and digital gratitude journal templates to help students practice positive thinking and appreciation daily.',
    category: 'prevent',
    thumbnail: '/resources/gratitude-thumbnail.jpg',
    pdf: '/resources/gratitude-journals.pdf',
    featured: false,
    gradeLevel: ['K-2', '3-5'],
    resourceFormat: 'Template',
    selSkill: 'Positive Thinking',
    learnerNeed: 'Resilience Building',
  },
  {
    id: '5',
    title: 'Classroom Community Builders',
    description: 'A collection of ice-breaker and team-building activities to create a positive, inclusive classroom community.',
    category: 'prevent',
    thumbnail: '/resources/community-thumbnail.jpg',
    pdf: '/resources/community-builders.pdf',
    featured: true,
    gradeLevel: ['K-2', '3-5', '6-8', '9-10', '11-12'],
    resourceFormat: 'Activity',
    selSkill: 'Relationship Skills',
    learnerNeed: 'Community Connection',
  },
];
