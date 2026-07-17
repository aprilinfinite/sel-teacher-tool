import type { Metadata } from 'next';
import ResourceCategoryPage from '@/components/category/ResourceCategoryPage';
import { categoryConfigs } from '@/components/category/categoryConfig';

export const metadata: Metadata = {
  title: categoryConfigs.prevent.metadata.title,
  description: categoryConfigs.prevent.metadata.description,
};

export default function PreventPage() {
  return <ResourceCategoryPage category="prevent" />;
}
