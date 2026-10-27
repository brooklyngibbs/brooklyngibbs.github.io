(() => {
  const audio = document.querySelector('audio');
  const play = document.querySelector('.play');
  const seek = document.querySelector('.seek');
  const elapsed = document.querySelector('.elapsed');
  const duration = document.querySelector('.duration');
  const error = document.querySelector('.player-error');
  const format = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const sync = () => {
    play.textContent = audio.paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', audio.paused ? 'Play preview' : 'Pause preview');
  };
  audio.volume = 0.8;
  play.addEventListener('click', async () => {
    if (!audio.paused) { audio.pause(); return; }
    try { await audio.play(); error.hidden = true; }
    catch { error.hidden = false; }
  });
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('ended', sync);
  audio.addEventListener('error', () => { error.hidden = false; });
  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration)) { seek.max = audio.duration; duration.textContent = format(audio.duration); }
  });
  audio.addEventListener('timeupdate', () => { seek.value = audio.currentTime; elapsed.textContent = format(audio.currentTime); });
  seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value); });
  document.querySelector('.volume input').addEventListener('input', event => { audio.volume = Number(event.target.value); });
})();
