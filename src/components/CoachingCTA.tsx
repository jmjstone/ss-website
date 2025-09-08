export default function CoachingCTA() {
  return (
    <div className="bg-black block">
      <section className="w-full roboto-condensed-logo flex flex-col items-center justify-center bg-black text-white py-20 px-4">
        <h2 className="text-6xl font-bold mb-6 text-center italic">Carve out your potential.</h2>
        <p className="roboto-condensed-thin text-lg mb-8 text-center max-w-2xl">
          Take the first step towards your personalized fitness journey.
        </p>
        <a
          href="/coaching"
          className="justify-center bg-[#7fa9e4] w-full max-w-3xl text-center outline-0 text-shadow-2 text-shadow-black outline-slate-200 roboto-condensed-logo uppercase text-white px-auto py-4 rounded-4xl text-4xl shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] hover:bg-white hover:text-slate-500 transition hover:scale-102"
        >
          Get Coaching
        </a>
      </section>
    </div>
  );
}
