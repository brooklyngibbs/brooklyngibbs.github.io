export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 py-6 font-mono text-sm leading-relaxed">
      {/* Header with magic */}
      <div className="text-center mb-10 relative">
        <div className="inline-block bg-gradient-to-r from-[#5a7d00] via-[#ff69b4] to-[#ff3b3f] p-1 transform rotate-1 shadow-lg">
          <div className="bg-white border-4 border-dashed border-[#ff3b3f] p-4 transform -rotate-1">
            <h1 className="text-2xl text-[#ff3b3f] tracking-wide font-bold">
            🍒*:･ﾟ✧ hi, i'm brooklyn ✧ﾟ･:*🎧
            </h1>
            <div className="text-lg mt-2 text-[#5a7d00] font-bold" aria-label="Welcome to my internet apothecary">
              🐸 welcome to the internet apothecary 🐸
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-black tracking-widest">💿 a portfolio of apps, essays, interfaces, and internet potions 💿</div>
      </div>

      {/* Intro polaroid style */}
      <div className="bg-white p-2 transform -rotate-1 shadow-lg border border-[#ff69b4] relative">
        <div className="border-4 border-dotted border-[#5a7d00] p-4 bg-gradient-to-br from-[#fff0f5] to-[#ffc1e3] bg-[url('/zebra-pattern.png')]">
          <div className="absolute top-2 right-2 text-xs text-black" aria-label="Paperclip emoji" role="img">📎</div>
          <p className="text-[#5a7d00] leading-relaxed">
            I'm a <span className="bg-[#5a7d00] px-1 border border-[#5a7d00] font-bold text-white">creative technologist</span>, which is a fancy way of saying I make weird, heartfelt things with code.  
            Whether it's an app that turns photos into playlists or a blog about tech-induced heartbreak, everything I build is designed to make you <em>feel</em> something.
          </p>
          <div className="mt-3 text-xs text-center text-[#5a7d00] italic">~ enchantments rendered in JSX ~</div>
        </div>
      </div>

      {/* Mission journal entry */}
      <div className="bg-[#ff69b4]/20 p-1 transform rotate-1 shadow-lg">
        <div className="bg-white border-l-4 border-[#ff3b3f] p-5 relative">
          <div className="absolute top-1 left-1 w-4 h-4 bg-[#ff69b4] rounded-full" aria-hidden="true"></div>
          <div className="absolute top-1 left-6 w-4 h-4 bg-[#5a7d00] rounded-full" aria-hidden="true"></div>
          <div className="absolute top-1 left-11 w-4 h-4 bg-black rounded-full border-2 border-white" aria-hidden="true"></div>
          
          <div className="ml-16 mt-2">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-[#5a7d00] to-[#ff69b4] p-2 rounded-full border-2 border-[#ff3b3f] mr-3"></div>
              <h3 className="text-lg font-bold text-[#ff3b3f] tracking-wide">my brewbook</h3>
            </div>

            {/* Section 1: Nostalgia as a Design Principle */}
            <div className="text-xs text-[#ff69b4] font-bold tracking-widest mb-1">✶ Nostalgia as a Design Principle</div>
            <p className="mb-3 text-[#445c00]">
            I still believe in the original spell of the internet—connection across worlds, across wires. Back when it felt like wandering into a webring and leaving with a penpal. Now, the feed is optimized, cold, and oddly corporate. I want to bring the magic back. The weird, warm, human parts. The kind of tech that remembers it was made by people—for people.
            </p>

            {/* Section 2: Emotional Infrastructure */}
            <div className="text-xs text-[#5a7d00] font-bold tracking-widest mb-1">✶ Emotional Infrastructure</div>
            <p className="mb-3 text-[#445c00]">
              I build software that feels like something. Every tool is crafted to carry emotion, not just utility—from playlists stitched to photos to interfaces designed to hold memory. Function is important, but feeling is the foundation.
            </p>

            {/* Section 3: Worldbuilding Over Branding */}
            <div className="text-xs text-[#ff3b3f] font-bold tracking-widest mb-1">✶ Worldbuilding Over Branding</div>
            <p className="mb-3 text-[#445c00]">
              Branding is for products. I build worlds. Potion shops, OS terminals, trading cards—every project is its own universe with logic, lore, and narrative UX. You're not just using a tool, you're entering a place.
            </p>

            {/* Section 4: Cross-Disciplinary Alchemy */}
            <div className="text-xs text-[#5a7d00] font-bold tracking-widest mb-1">✶ Cross-Disciplinary Alchemy</div>
            <p className="mb-3 text-[#445c00]">
              I treat code like poetry and research like UI. I write essays that inform prototypes, prototype ideas that become essays. My process is less about specialization and more about strange intersections—where data meets zines and Python meets feeling.
            </p>
          </div>
        </div>
      </div>

      {/* Projects as trading cards */}
      <div className="space-y-4">
        <h3 className="text-center text-lg text-[#ff69b4] mb-4">
          🧴⋆｡‧˚ʚ♡ remedies shelf ♡ɞ˚‧｡⋆💿
        </h3>
        
        <div className="grid gap-4">
          {/* Aurify card */}
          <div className="bg-gradient-to-br from-[#5a7d00]/30 via-[#ff69b4]/20 to-[#ff3b3f]/20 p-1 transform -rotate-1 shadow-md">
            <div className="bg-white border-2 border-dashed border-[#ff69b4] p-4 bg-gradient-to-br from-[#fff0f5] to-[#ffc1e3] bg-[url('/zebra-pattern.png')]">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2" aria-label="Headphones emoji" role="img">🎧</span>
                <div>
                  <h4 className="font-bold text-[#ff3b3f]">Aurify</h4>
                  <div className="text-xs text-[#5a7d00]">🧪 brewed with emotional resonance</div>
                </div>
              </div>
              <p className="text-sm text-[#5a7d00] mb-2">An app that brews a playlist from your photos.
              Because every picture holds a memory, and every memory deserves a soundtrack. Upload a vibe, get a mixtape. It's like synesthesia, but for your camera roll.</p>
              <a
                href="https://www.aurifyapp.com"
                className="text-xs text-[#ff69b4] underline hover:text-[#ff3b3f] focus:outline-none focus:ring focus:ring-[#ff69b4]/50"
              >
                → uncork the mixtape memory spell ←
              </a>
            </div>
          </div>

          {/* Offline Crush zine */}
          <div className="bg-gradient-to-br from-[#ff69b4]/20 via-white to-[#5a7d00]/20 p-1 transform rotate-1 shadow-md">
            <div className="bg-white border-2 border-dashed border-[#ff3b3f] p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2" aria-label="Love letter emoji" role="img">💌</span>
                <div>
                  <h4 className="font-bold text-[#ff3b3f]">Offline Crush</h4>
                  <div className="text-xs text-[#5a7d00]">where tech meets emotional intelligence 🍒</div>
                </div>
              </div>
              <p className="text-sm text-[#5a7d00] mb-2">My blog where I excavate the emotional archaeology of the internet. I write long, overthought, 
                strangely romantic essays about digital design, algorithm rot, childhood desktops, and the psychological residue of living online.
                It's part pop culture analysis, part memoir, part internet fairy tale.</p>
              <a
                href="https://offlinecrush.substack.com"
                className="text-xs text-[#5a7d00] underline hover:text-[#ff69b4] focus:outline-none focus:ring focus:ring-[#5a7d00]/50"
              >
                → get emotionally invested ←
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Magical Toolkit - Potion Shop Style */}
      <div className="border-4 border-double border-[#5a7d00] p-6 shadow-[0_0_10px_rgba(255,105,180,0.3)] transform -rotate-1">
        <h4 className="text-center text-2xl font-bold text-[#5a7d00] mb-2 tracking-wide">ingredients list</h4>
        <p className="text-center text-xs italic text-[#445c00] mb-5">~ my toolkit of digital tinctures and terminal spells ~</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#5a7d00]">
          <div>
            <p className="font-bold mb-1 text-[#ff69b4] flex items-center gap-1">✨ Frontend Development</p>
            <p>HTML/CSS, Tailwind CSS, React, Swift/SwiftUI, Interface Copywriting, Experimental UX</p>
          </div>
          <div>
            <p className="font-bold mb-1 text-[#ff69b4] flex items-center gap-1">👾 Backend Development</p>
            <p>Python, TypeScript, JavaScript, Node.js, Flask, FastAPI, Bash, SQL, Git/GitHub, Xcode, Postman</p>
          </div>
          <div>
            <p className="font-bold mb-1 text-[#ff69b4]">🎨 UI/UX Design</p>
            <p>Figma, Canva, Adobe Photoshop & Illustrator, Emotional Design, Nostalgic Interfaces</p>
          </div>
          <div>
            <p className="font-bold mb-1 text-[#ff69b4]">📚 Writing & Research</p>
            <p>Substack, Cultural Essays, Internet Nostalgia, Worldbuilding, Product Storytelling, Digital Folklore</p>
          </div>
          <div>
            <p className="font-bold mb-1 text-[#ff69b4]">🧠 Data & AI</p>
            <p>OpenAI API, TensorFlow, NumPy, Pandas, Matplotlib, Scikit-learn, OpenCV, Spark, YARN, Hadoop, Databricks, Jupyter</p>
          </div>
          <div>
            <p className="font-bold mb-1 text-[#ff69b4]">🎧 Audio & Music Tech</p>
            <p>Spotify Web API, Librosa, Ableton Live, Web Audio API</p>
          </div>
        </div>
      </div>

      {/* Footer sparkles */}
      <div className="text-center text-xs text-[#5a7d00] mt-8 tracking-widest" aria-label="Thanks for visiting my corner of the internet">
        ✧･ﾟ: *✧･ﾟ:* thanks for visiting my corner of the internet *:･ﾟ✧*:･ﾟ✧ 🍒🦓
      </div>
    </div>
  );
}