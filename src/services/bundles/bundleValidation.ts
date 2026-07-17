export interface BundleValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Validate bundle form data before saving. */
export function validateBundle(data: {
  title: string;
  price: string;
  purchaseUrl: string;
  status: string;
}): BundleValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Bundle title is required.';
  }

  if (data.price && data.price.trim()) {
    const priceNum = parseFloat(data.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Price must be a valid positive number.';
    }
  }

  if (data.purchaseUrl && data.purchaseUrl.trim()) {
    try {
      new URL(data.purchaseUrl);
    } catch {
      errors.purchaseUrl = 'Purchase URL must be a valid URL.';
    }
  }

  const validStatuses = ['Draft', 'Published', 'Inactive'];
  if (!validStatuses.includes(data.status)) {
    errors.status = 'Status must be Draft, Published, or Inactive.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
