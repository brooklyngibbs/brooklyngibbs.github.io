export default function Blog() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 py-6 font-mono text-sm leading-relaxed">
      {/* Header with magic */}
      <div className="text-center mb-10 relative">
        <div className="inline-block bg-gradient-to-r from-[#5a7d00] via-[#ff69b4] to-[#ff3b3f] p-1 transform rotate-1 shadow-lg">
          <div className="bg-white border-4 border-dashed border-[#ff3b3f] p-4 transform -rotate-1">
            <h1 className="text-2xl text-[#ff3b3f] tracking-wide font-bold">
              📖*:･ﾟ✧ offline crush ✧ﾟ･:*🖋️
            </h1>
            <div className="text-lg mt-2 text-[#5a7d00] font-bold">
              🌐 where digital folklore meets cultural essays 🌐
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-black tracking-widest">💿 essays on nostalgia, technology, and the emotional archaeology of being online 💿</div>
      </div>

      {/* Offline Crush About */}
      <div className="bg-white border border-dashed border-[#5a7d00] p-6 transform rotate-1 shadow-md mb-10">
        <h2 className="text-xl text-[#ff3b3f] font-bold mb-2">💾 what is offline crush?</h2>
        <p className="text-[#5a7d00] text-sm leading-relaxed">
          Offline Crush is my blog of essays, internet ephemera, and digital rants where I overanalyze everything from nostalgia-core UI to the psychological impact of the Windows XP startup sound.
          It’s part digital diary, part cultural zine, with a hint of magical realism.
        </p>
        <p className="text-[#5a7d00] text-sm leading-relaxed mt-2">
          Think: Substack essays dressed like 2008 Tumblr, deep dives on algorithmic decay, and love letters to dead internet platforms. 
          If you've ever cried during a system reboot or romanticized your childhood desktop, you're in the right place.
        </p>
      </div>

      {/* Top Essays Section */}
      <div className="bg-white border border-[#ff69b4] border-dashed p-4 shadow rotate-1 mb-10">
        <h2 className="text-xl text-[#5a7d00] font-bold mb-2">🌟 top reads</h2>
        <ul className="list-disc pl-5 text-sm text-[#5a7d00]">
          <li>
            <a href="https://offlinecrush.substack.com/p/how-meet-the-robinsons-accidentally" className="text-[#ff3b3f] font-bold underline hover:text-[#ff69b4]" target="_blank" rel="noopener noreferrer">
              “How Meet the Robinsons Accidentally Predicted Internet Collapse”
            </a> — a retro-futurist masterpiece and an essay about invention with feeling
          </li>
          <li>
            <a href="https://offlinecrush.substack.com/p/in-defense-of-the-crock-pot" className="text-[#ff3b3f] font-bold underline hover:text-[#ff69b4]" target="_blank" rel="noopener noreferrer">
              “In Defense of the Crock-Pot”
            </a> — slow tech, soup, and digital gentleness
          </li>
          <li>
            <a href="https://offlinecrush.substack.com/p/the-muppets-are-fables-for-the-emotionally" className="text-[#ff3b3f] font-bold underline hover:text-[#ff69b4]" target="_blank" rel="noopener noreferrer">
              “The Muppets Are Fables for the Emotionally Literate”
            </a> — why kindness and chaos go hand in hand
          </li>
          <li>
            <a href="https://offlinecrush.substack.com/p/a-museum-of-forgotten-internet" className="text-[#ff3b3f] font-bold underline hover:text-[#ff69b4]" target="_blank" rel="noopener noreferrer">
              “A Museum of Forgotten Internet”
            </a> — an archive of vanished platforms and the ghosts they left behind
          </li>
          <li>
            <a href="https://offlinecrush.substack.com/p/when-did-the-internet-turn-into-chuck" className="text-[#ff3b3f] font-bold underline hover:text-[#ff69b4]" target="_blank" rel="noopener noreferrer">
              “When Did the Internet Turn Into Chuck E. Cheese?”
            </a> — skee-ball aesthetics, algorithmic noise, and the infantilization of fun
          </li>
        </ul>
        <p className="text-xs text-[#5a7d00] italic mt-2">~ more essays dropping soon ~</p>
      </div>

      {/* Subscribe Button */}
      <div className="text-center mt-4">
        <a
          href="https://offlinecrush.substack.com"
          className="inline-block bg-[#ff3b3f] text-white font-bold py-2 px-4 rounded shadow hover:bg-[#ff69b4] transition"
          target="_blank"
          rel="noopener noreferrer"
        >
          💌 Read more on Substack
        </a>
      </div>

      {/* Footer sparkles */}
      <div className="text-center text-xs text-[#5a7d00] mt-8 tracking-widest">
        ✧･ﾟ: *✧･ﾟ:* more essays brewing in the digital cauldron *:･ﾟ✧*:･ﾟ✧ 📖🍒
      </div>
    </div>
  );
} 