import Link from 'next/link';

interface BlogCardProps {
  title: string;
  summary: string;
  url: string;
  date: string;
  image?: string; // optional in case some posts don't have one
  author?: string;
}

export default function BlogCard({ title, summary, url, date, image, author }: BlogCardProps) {
  return (
    <Link
      href={url}
      className="group block bg-stone-200 hover:bg-stone-100 transition transform p-6 roboto-condensed-thin"
    >
      {/* Image placeholder */}
      <div
        className="h-48 w-full mb-6 bg-stone-500 group-hover:opacity-90 transition"
        style={{
          backgroundImage: image ? `url(${image})` : 'url(/placeholder.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <h2 className="uppercase text-2xl font-bold mb-0 text-black group-hover:text-black">
        {title}
      </h2>
      <p className="text-sm mb-1">{author ? `${author}` : null}</p>
      <p className="text-xs text-stone-500 mb-4 group-hover:text-black">
        {new Date(date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        })}
      </p>
      <p className="text-stone-700 group-hover:text-black mb-4">{summary}</p>
    </Link>
  );
}
