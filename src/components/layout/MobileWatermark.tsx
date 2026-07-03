export default function MobileWatermark() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden lg:hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-yellow via-brand-yellow to-brand-yellow-dark" />

      {/* Large concentric circles — Nomba-style watermark */}
      <div className="absolute -right-24 -top-16 h-80 w-80 rounded-full border-[40px] border-black/10" />
      <div className="absolute -right-8 -top-32 h-96 w-96 rounded-full border-[28px] border-black/8" />
      <div className="absolute -left-20 top-32 h-72 w-72 rounded-full border-[32px] border-black/10" />
      <div className="absolute -left-32 top-48 h-96 w-96 rounded-full border-[20px] border-black/6" />
      <div className="absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full border-[24px] border-black/8" />

      {/* Soft wave curves */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,160 C360,80 720,240 1080,160 C1260,120 1380,140 1440,160 L1440,320 L0,320 Z"
          fill="black"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full opacity-10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,200 C480,120 720,280 1200,200 C1320,180 1400,200 1440,220 L1440,320 L0,320 Z"
          fill="black"
        />
      </svg>

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  )
}
