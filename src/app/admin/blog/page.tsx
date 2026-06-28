export default function BlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#3b3b3b]">Blog Posts</h1>
        <p className="text-[#a8b4a4]">Create and manage blog posts</p>
      </div>

      <button className="bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors">
        + Add New Post
      </button>

      <div className="bg-[#f4f0e5] rounded-2xl p-6 shadow-sm">
        <p className="text-[#a8b4a4]">Blog manager coming soon...</p>
      </div>
    </div>
  );
}
