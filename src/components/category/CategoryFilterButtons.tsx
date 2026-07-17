'use client';

type FilterButton = {
  label: string;
  icon: string;
};

type Props = {
  filters: FilterButton[];
  heroBorder: string;
};

/**
 * Client component for the category filter buttons.
 * Handles hover interactions that can't be done in Server Components.
 */
export default function CategoryFilterButtons({ filters, heroBorder }: Props) {
  return (
    <div className="mt-5 md:mt-8 flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.label}
          type="button"
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3a3f3c] transition"
          style={{
            borderColor: heroBorder,
            backgroundColor: '#fff9f0',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = heroBorder;
            e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${heroBorder}, white 80%)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = heroBorder;
            e.currentTarget.style.backgroundColor = '#fff9f0';
          }}
        >
          <span>{f.icon}</span>
          {f.label}
        </button>
      ))}
    </div>
  );
}
