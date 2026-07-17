import type { Metadata } from 'next';
import ResourceCategoryPage from '@/components/category/ResourceCategoryPage';
import { categoryConfigs } from '@/components/category/categoryConfig';

export const metadata: Metadata = {
  title: categoryConfigs.respond.metadata.title,
  description: categoryConfigs.respond.metadata.description,
};

export default function RespondPage() {
  return <ResourceCategoryPage category="respond" />;
}
