interface OgCardProps {
  favicon: string;
  primary: string;
  secondary: string;
  tool: {
    categories: string[];
    name: string;
    officialUrl: string;
    shortDescription: string;
    stats: { comments: number; upvotes: number };
  };
}

export function OgCard({ favicon, primary, secondary, tool }: OgCardProps) {
  return (
    <div className="relative flex size-full overflow-hidden bg-zinc-950 text-white">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at top left, ${primary}55, transparent 40%),
            radial-gradient(circle at bottom right, ${secondary}55, transparent 40%),
            linear-gradient(to bottom right, #0a0a0a, #111827)
          `,
        }}
      />
      {/* Noise */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[24px_24px] opacity-10" />
      {/* Content */}
      <div className="relative flex size-full flex-col justify-between p-14">
        {/* Header */}
        <div className="flex items-center gap-6">
          <img
            alt={tool.name}
            className="size-20 rounded-2xl bg-white p-3"
            src={favicon}
          />
          <div className="flex flex-col gap-1">
            <div className="text-6xl font-extrabold">{tool.name}</div>
            <div className="text-2xl text-white/70">{tool.officialUrl}</div>
          </div>
        </div>
        {/* Body */}
        <div className="flex max-w-225 flex-col gap-6">
          <div className="text-[34px] leading-snug text-white/90">
            {tool.shortDescription}
          </div>
          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {tool.categories.map((item) => (
              <div
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xl"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-2xl text-white/70">
            <span>▲ {tool.stats.upvotes}</span>
            <span>💬 {tool.stats.comments}</span>
          </div>
          <div
            className="bg-clip-text text-3xl font-bold text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})`,
            }}
          >
            Grepedia
          </div>
        </div>
      </div>
    </div>
  );
}
