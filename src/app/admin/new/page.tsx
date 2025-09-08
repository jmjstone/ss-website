'use client';

import { useState, useRef, ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import 'easymde/dist/easymde.min.css';
import ProtectedRoute from '@/components/ProtectedRoute';
import BackButton from '@/components/BackButton';

const SimpleMDEImport = dynamic(
  () => import('react-simplemde-editor').then((mod) => mod.default as ComponentType<any>),
  { ssr: false },
);

const SimpleMDE = SimpleMDEImport as unknown as ComponentType<{
  options?: any;
  getMdeInstance?: (editor: any) => void;
}>;

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef<any>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/uploadImage', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    try {
      const url = await handleImageUpload(file);
      setThumbnail(url);
    } catch (err) {
      alert('Error uploading thumbnail');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const content = editorRef.current?.value() || '';
      if (!content.trim()) {
        alert('Post content cannot be empty.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/createPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, slug, content, image: thumbnail }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Unknown error');

      router.push(`/blog/${slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert('Error creating post: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-6 max-w-4xl mx-auto roboto-condensed-thin">
        <BackButton className="text-white" label="Dashboard" backUrl="/dashboard"></BackButton>
        <h1 className="text-3xl font-bold uppercase mb-8 text-white roboto-condensed-logo">
          Create New Blog Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-stone-900 p-6 rounded-none shadow-lg">
          {/* Title */}
          <div>
            <label className="block text-white text-sm uppercase mb-2">Title</label>
            <input
              type="text"
              placeholder="Enter post title"
              className="w-full p-3 rounded-none bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-white text-sm uppercase mb-2">Summary</label>
            <input
              type="text"
              placeholder="Short summary of the post"
              className="w-full p-3 rounded-none bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-white text-sm uppercase mb-2">Slug</label>
            <input
              type="text"
              placeholder="Unique slug (e.g. my-first-post)"
              className="w-full p-3 rounded-none bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-white text-sm uppercase mb-2">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-white text-sm file:mr-4 file:py-2 file:px-4
                file:rounded-none file:border-0
                file:text-sm file:font-semibold
                file:bg-slate-600 file:text-white
                hover:file:bg-white hover:file:text-black"
            />
            {thumbnail && (
              <div className="mt-4">
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="max-h-48 object-contain border border-stone-700"
                />
              </div>
            )}
          </div>

          {/* Editor */}
          <div>
            <label className="block text-white text-sm uppercase mb-2">Content</label>
            <SimpleMDE
              options={{
                spellChecker: false,
                placeholder: 'Write your post here...',
                toolbar: [
                  'bold',
                  'italic',
                  'heading',
                  '|',
                  {
                    name: 'image',
                    action: async function (editor: any) {
                      const cm = editor.codemirror;
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async () => {
                        if (!input.files) return;
                        const url = await handleImageUpload(input.files[0]);
                        const doc = cm.getDoc();
                        const cursor = doc.getCursor();
                        doc.replaceRange(`![alt text](${url})`, cursor);
                      };
                      input.click();
                    },
                    className: 'fa fa-image',
                    title: 'Insert Image',
                  },
                  'link',
                  'quote',
                  'code',
                  'unordered-list',
                  'ordered-list',
                ],
              }}
              getMdeInstance={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-slate-600 roboto-condensed-logo uppercase text-lg hover:bg-white hover:text-black text-white font-semibold px-6 py-3 rounded-none transition-colors duration-300 w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
