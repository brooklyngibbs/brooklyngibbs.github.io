export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 py-6 font-mono text-sm leading-relaxed">
      {/* Header with magic */}
      <div className="text-center mb-10 relative">
        <div className="inline-block bg-[#5a7d00] p-1 transform rotate-1 shadow-lg">
          <div className="bg-white border-4 border-dashed border-[#ff3b3f] p-4 transform -rotate-1">
            <h1 className="text-2xl text-[#ff3b3f] tracking-wide font-bold">
              💌*:･ﾟ✧ let's connect ✧ﾟ･:*📱
            </h1>
          </div>
        </div>
        <div className="mt-4 text-xs text-black tracking-widest">💿 best reached with iced coffee and existential app ideas 💿</div>
      </div>

      {/* Contact methods as trading cards */}
      <div className="space-y-4">
        
        <div className="grid gap-4">
          {/* Email card */}
          <div className="bg-[#ff69b4]/20 p-1 transform -rotate-1 shadow-md">
            <div className="bg-white border-2 border-dashed border-[#ff69b4] p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💌</span>
                <div>
                  <h4 className="font-bold text-[#ff3b3f]">Email</h4>
                  <div className="text-xs text-[#5a7d00]">my favorite form of digital correspondence</div>
                </div>
              </div>
              <p className="text-sm text-[#5a7d00] mb-2">
                For work inquiries, collaboration ideas, or just to share something that made you think of frogs.
              </p>
              <a 
                href="mailto:brooklyngibbs@hey.com" 
                className="text-xs text-[#ff69b4] underline hover:text-[#ff3b3f] font-semibold"
              >
                → brooklyngibbs22@gmail.com ←
              </a>
            </div>
          </div>

          {/* Substack card */}
          <div className="bg-[#5a7d00]/20 p-1 transform rotate-1 shadow-md">
            <div className="bg-white border-2 border-dashed border-[#5a7d00] p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📖</span>
                <div>
                  <h4 className="font-bold text-[#ff3b3f]">Offline Crush</h4>
                  <div className="text-xs text-[#5a7d00]">where I overshare about the internet</div>
                </div>
              </div>
              <p className="text-sm text-[#5a7d00] mb-2">
                Subscribe for essays on digital folklore, tech nostalgia, and the emotional archaeology of being online.
              </p>
              <a 
                href="https://offlinecrush.substack.com" 
                className="text-xs text-[#5a7d00] underline hover:text-[#ff69b4] font-semibold"
              >
                → read my digital diary ←
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Response time note */}
      <div className="bg-[#5a7d00]/15 p-4 border-2 border-[#5a7d00] rounded-lg text-center">
        <div className="text-xs text-[#ff3b3f] font-bold mb-2 tracking-widest">✧ RESPONSE EXPECTATIONS ✧</div>
        <p className="text-sm text-[#5a7d00]">
          I usually respond within 24-48 hours. If it's been longer, your email probably got lost in my 
          <span className="font-semibold"> extremely organized</span> inbox system (it's not organized at all).
        </p>
      </div>

      {/* Footer sparkles */}
      <div className="text-center text-xs text-[#5a7d00] mt-8 tracking-widest">
        ✧･ﾟ: *✧･ﾟ:* can't wait to hear from you *:･ﾟ✧*:･ﾟ✧ 💌🐸
      </div>
    </div>
  );
}