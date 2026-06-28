export type Resource = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  grade_level: string | null;
  topic_tag: string | null;
  time_needed: string | null;
  file_path: string | null;
  thumbnail_path: string | null;
  thumbnail_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  sel_skill: string | null;
  learner_need: string | null;
  situation: string | null;
  resource_format: string | null;
  featured: number;
  download_count: number;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category: string | null;
  tags: string | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  published: number;
  created_at: string;
  updated_at: string;
};

export type EmailSubscriber = {
  id: number;
  first_name: string | null;
  email: string;
  source: string | null;
  subscribed_at: string;
};

export type QuizSubmission = {
  id: number;
  quiz_id: string;
  first_name: string | null;
  email: string | null;
  result: string | null;
  submitted_at: string;
};

/** Generic subscriber context — UI-facing, provider-agnostic. */
export type SubscriberContext = {
  name: string;
  email: string;
  signupSource: string;
  landingPage: string;
  firstResource: string | null;
};