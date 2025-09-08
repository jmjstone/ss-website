import { supabaseServer } from '@/lib/supabaseServer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const supabase = supabaseServer;

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    console.error(error);
    return <p className="p-6">Post not found.</p>;
  }

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  return (
    <div className="bg-white items-center flex-col justify-center">
      <article className="max-w-6xl mx-auto bg-white p-10">
        <Link
          href="/blog"
          className="text-black uppercase roboto-condensed-logo mb-6 inline-block hover:text-blue-700"
        >
          ← Back to Articles
        </Link>
        <div className="flex items-center pt-6 flex-col text-black roboto-condensed-logo mb-20">
          <h1 className="uppercase text-5xl font-bold mb-0 mt-4">{post.title}</h1>
          {post.author && (
            <p className="uppercase roboto-condensed-thin text-gray-500 mb-2 text-lg ">
              By {post.author}
            </p>
          )}
          {post.date && <p className="uppercase text-gray-500 text-sm mb-4">{formattedDate}</p>}
          {post.image ? <img className="h-100" src={post.image} alt={post.title}></img> : null}
        </div>

        <div className="prose max-w-none roboto-condensed-thin">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
