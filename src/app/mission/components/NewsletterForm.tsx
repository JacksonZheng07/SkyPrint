"use client";

export function NewsletterForm() {
  return (
    <form
      className="mt-3 flex overflow-hidden rounded-lg border border-white/10"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
      />
      <button
        type="submit"
        className="flex items-center justify-center bg-teal-500/80 px-3 transition hover:bg-teal-500"
      >
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </form>
  );
}
