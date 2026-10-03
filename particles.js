/* ===================================
   DECORATIVE PARTICLE CANVAS
   A cursor-reactive particle trail that lives
   behind the real page content. Purely decorative:
   pointer-events are disabled on the canvas itself,
   so it never blocks clicks on real UI.
=================================== */

(function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  let particles = [];
  let hue = 140; // start near the green/blue brand hues
  const mouse = { x: null, y: null };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * (window.visualViewport ? 1 : 1);
    canvas.height = document.documentElement.scrollHeight
      ? window.innerHeight
      : window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    // Respect reduced-motion: no animated trail at all.
    return;
  }

  const maxParticles = isTouch ? 120 : 260;
  const spawnPerMove = isTouch ? 1 : 2;

  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    for (let i = 0; i < spawnPerMove; i++) {
      if (particles.length < maxParticles) particles.push(new Particle());
    }
  });

  window.addEventListener("pointerdown", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    for (let i = 0; i < 26; i++) {
      if (particles.length < maxParticles) particles.push(new Particle());
    }
  });

  function Particle() {
    this.x = mouse.x;
    this.y = mouse.y;
    this.size = Math.random() * 2.4 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = `hsl(${hue}, 85%, 60%)`;
  }
  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.15) this.size -= 0.03;
  };
  Particle.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(this.size, 0), 0, Math.PI * 2);
    ctx.fill();
  };

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = 1 - dist / 90;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // drop faded-out particles
    particles = particles.filter((p) => p.size > 0.3);

    hue += 0.15;
    if (hue > 360) hue -= 360;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
