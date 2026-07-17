import type { Metadata } from 'next';
import ResourceCategoryPage from '@/components/category/ResourceCategoryPage';
import { categoryConfigs } from '@/components/category/categoryConfig';

export const metadata: Metadata = {
  title: categoryConfigs['teacher-support'].metadata.title,
  description: categoryConfigs['teacher-support'].metadata.description,
};

export default function TeacherSupportPage() {
  return <ResourceCategoryPage category="teacher-support" />;
}
