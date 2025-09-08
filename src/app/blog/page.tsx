import BlogCard from '@/components/BlogCard';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function BlogIndexPage() {
  const supabase = supabaseServer;

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, summary, slug, date, image, author') // <-- added image field
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error.message);
    return <p className="p-6 text-red-600">Failed to load posts.</p>;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white justify-center h-screen block max-w-full">
        <div className="bg-white p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl roboto-condensed-logo text-black font-bold mb-2 uppercase">
            Articles
          </h1>
          <p className="text-stone-600 mb-10 uppercase roboto-condensed-thin">
            Bringing you new blogs about Hypertrophy, strength, and nutrition
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
          <p className="uppercase roboto-condensed-thin black text-stone-400">No posts found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white justify-center block max-w-full">
      <div className="bg-white p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl roboto-condensed-logo text-black font-bold mb-2 uppercase">
          Articles
        </h1>
        <p className="text-stone-600 mb-10 uppercase roboto-condensed-thin">
          Bringing you new blogs about Hypertrophy, strength, and nutrition
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              summary={post.summary}
              url={`/blog/${post.slug}`}
              date={post.date}
              image={post.image}
              author={post.author}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
