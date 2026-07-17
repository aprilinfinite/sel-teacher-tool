import type { Metadata } from 'next';
import ResourceCategoryPage from '@/components/category/ResourceCategoryPage';
import { categoryConfigs } from '@/components/category/categoryConfig';

export const metadata: Metadata = {
  title: categoryConfigs.recover.metadata.title,
  description: categoryConfigs.recover.metadata.description,
};

export default function RecoverPage() {
  return <ResourceCategoryPage category="recover" />;
}
