import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz Results | Admin | SEL Teacher Tools',
};

export default function QuizPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#3b3b3b]">Quiz Results</h1>
        <p className="text-[#a8b4a4]">View quiz responses and analytics</p>
      </div>

      <div className="bg-[#f4f0e5] rounded-2xl p-6 shadow-sm">
        <p className="text-[#a8b4a4]">Quiz results dashboard coming soon...</p>
      </div>
    </div>
  );
}
