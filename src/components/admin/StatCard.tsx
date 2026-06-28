type StatCardProps = {
  label: string;
  value: number;
  icon: string;
  color: string;
};

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-2xl p-6 text-[#f4f0e5] shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium opacity-90">{label}</p>
          <p className="text-3xl md:text-4xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-[#e8e5dc] animate-pulse shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-[#d8d4cb] rounded-full" />
          <div className="h-8 w-16 bg-[#d8d4cb] rounded-full mt-2" />
        </div>
        <div className="h-9 w-9 bg-[#d8d4cb] rounded-xl" />
      </div>
    </div>
  );
}
