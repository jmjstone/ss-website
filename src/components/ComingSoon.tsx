export default function ComingSoon() {
  return (
    <div className="relative w-full h-screen">
      {/* Background Image */}
      <img
        src="https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg"
        alt="Background"
        className="w-full h-full object-cover"
      />

      {/* Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="shadow-[0_0_3px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]  rounded-3xl  p-3 text-white text-5xl sm:text-9xl md:text-9xl lg:text-9xl xl:text-9xl roboto-condensed-thinx2 uppercase text-shadow-lg">
          Coming Soon
        </h1>
      </div>
    </div>
  );
}
