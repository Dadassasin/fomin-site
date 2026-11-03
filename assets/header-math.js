/* Small, decorative mathematical rain. No layout animation or continuous JS loop. */
(() => {
  const field = document.querySelector('.hero-math');
  if (!field || !Element.prototype.animate) return;

  const symbols = [...field.querySelectorAll('.math-symbol')];
  const original = symbols.map(symbol => ({
    style: symbol.getAttribute('style'),
    text: symbol.textContent
  }));
  const alphabet = [...'∫∑λπ∞∂∇√Δθ≈αβ∈⊂⊗∀ℝφξ±'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 701px)');
  const active = new Map();
  let running = false;
  let generation = 0;
  let lastHeight = 0;
  const random = (min, max) => min + Math.random() * (max - min);

  function fall(symbol, initial, version) {
    if (!running || version !== generation) return;
    const duration = random(4500, 8000);
    const delay = random(200, 1400);
    const height = field.clientHeight;
    const distance = height + 64;
    const strength = random(.55, 1);
    symbol.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
    symbol.style.left = `${random(10, 95).toFixed(2)}%`;
    symbol.style.top = '0';
    symbol.style.fontSize = `${random(20, 28).toFixed(1)}px`;
    const at = fraction => `translateY(${(-32 + distance * fraction).toFixed(2)}px)`;
    const animation = symbol.animate([
      { transform: at(0), opacity: 0, offset: 0 },
      { transform: at(.12), opacity: strength, offset: .12 },
      { transform: at(.5), opacity: strength * .75, offset: .5 },
      { transform: at(.85), opacity: 0, offset: .85 },
      { transform: at(1), opacity: 0, offset: 1 }
    ], { duration, delay, easing: 'linear', fill: 'both' });
    active.set(symbol, animation);
    if (initial) animation.currentTime = delay + random(0, duration);
    animation.onfinish = () => {
      if (active.get(symbol) !== animation) return;
      active.delete(symbol);
      animation.cancel();
      fall(symbol, false, version);
    };
  }

  function stop() {
    running = false;
    generation += 1;
    active.forEach(animation => animation.cancel());
    active.clear();
    symbols.forEach((symbol, i) => {
      symbol.setAttribute('style', original[i].style);
      symbol.textContent = original[i].text;
    });
  }

  function sync() {
    const enabled = desktop.matches && !reduced.matches && !document.hidden;
    const height = field.clientHeight;
    if (!enabled) {
      if (running) stop();
      return;
    }
    if (running && height === lastHeight) return;
    stop();
    running = true;
    lastHeight = height;
    const version = generation;
    symbols.forEach(symbol => fall(symbol, true, version));
  }

  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(sync).observe(field);
  sync();
})();
