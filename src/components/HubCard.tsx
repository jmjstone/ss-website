interface HubCardProps {
  title: string;
  description: string;
  href: string;
  bg?: string; // optional background color
}

export default function HubCard({ title, description, href, bg }: HubCardProps) {
  return (
    <a
      href={href}
      className={`justify-center text-center roboto-condensed-thinx2 group block p-6 transition transform hover:bg-white ${
        bg || 'bg-stone-700'
      }`}
    >
      <div className="">
        <h2 className=" group-hover:text-black hover uppercase roboto-condensed-thin text-5xl text-white font-bold mb-10">
          {title}
        </h2>
        <p className="group-hover:text-black text-xl uppercase italic text-stone-200">
          {description}
        </p>
      </div>
    </a>
  );
}
