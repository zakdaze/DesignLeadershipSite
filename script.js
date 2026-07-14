const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const menuLinks = document.querySelectorAll(".primary-menu a");

function setMenu(open) {
  header.dataset.menuOpen = String(open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

menuButton.addEventListener("click", () => {
  setMenu(header.dataset.menuOpen !== "true");
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 981px)").matches) {
    setMenu(false);
  }
});

const ambientCanvas = document.querySelector(".ambient-canvas");

if (ambientCanvas) {
  const context = ambientCanvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000, active: false };
  let width = 0;
  let height = 0;
  let particles = [];
  let start = performance.now();

  const colors = [
    [17, 17, 17],
    [101, 94, 78],
    [126, 107, 143],
    [105, 162, 151],
  ];

  function makeParticles() {
    const count = window.innerWidth < 760 ? 680 : 1650;
    particles = Array.from({ length: count }, (_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random());
      const contour = 0.82 + Math.sin(angle * 3.1) * 0.15 + Math.cos(angle * 5.3) * 0.1;
      const color = colors[index % colors.length];

      return {
        x: Math.cos(angle) * radius * contour,
        y: Math.sin(angle) * radius * (0.58 + Math.cos(angle * 2.2) * 0.08) * contour,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        size: 0.32 + Math.random() * 0.82,
        drift: Math.random() * Math.PI * 2,
        alpha: 0.18 + Math.random() * 0.36,
        color,
      };
    });
  }

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    ambientCanvas.width = Math.floor(width * pixelRatio);
    ambientCanvas.height = Math.floor(height * pixelRatio);
    ambientCanvas.style.width = `${width}px`;
    ambientCanvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    makeParticles();
  }

  function draw(now) {
    const elapsed = (now - start) / 1000;
    context.clearRect(0, 0, width, height);

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    const scale = Math.min(width, height) * (width < 760 ? 0.82 : 0.72);
    const centerX = width * (0.24 + Math.sin(elapsed * 0.055) * 0.12 + Math.sin(elapsed * 0.018) * 0.08);
    const centerY = height * (0.34 + Math.cos(elapsed * 0.046) * 0.1 + Math.sin(elapsed * 0.02) * 0.04);
    const rotation = Math.sin(elapsed * 0.034) * 0.34 - 0.18;
    const morphA = Math.sin(elapsed * 0.08) * 0.055;
    const morphB = Math.cos(elapsed * 0.06) * 0.045;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const connectionCandidates = [];

    particles.forEach((particle) => {
      const pulse = Math.sin(elapsed * 0.32 + particle.drift) * 0.026;
      const localX = particle.x * (1 + pulse + morphA);
      const localY = particle.y * (1 - pulse + morphB);
      const baseX = centerX + (localX * cos - localY * sin) * scale;
      const baseY = centerY + (localX * sin + localY * cos) * scale;
      let targetX = 0;
      let targetY = 0;

      if (pointer.active && width > 760) {
        const dx = baseX + particle.ox - pointer.x;
        const dy = baseY + particle.oy - pointer.y;
        const distance = Math.hypot(dx, dy);
        const radius = 230;

        if (distance < radius && distance > 0.1) {
          const force = ((radius - distance) / radius) ** 2 * 86;
          targetX = (dx / distance) * force;
          targetY = (dy / distance) * force;
        }
      }

      particle.vx += (targetX - particle.ox) * 0.052;
      particle.vy += (targetY - particle.oy) * 0.052;
      particle.vx *= 0.86;
      particle.vy *= 0.86;
      particle.ox += particle.vx;
      particle.oy += particle.vy;

      const x = baseX + particle.ox;
      const y = baseY + particle.oy;
      particle.screenX = x;
      particle.screenY = y;

      if (pointer.active && width > 760) {
        const pointerDistance = Math.hypot(x - pointer.x, y - pointer.y);

        if (pointerDistance < 220) {
          connectionCandidates.push({ particle, pointerDistance });
        }
      }
    });

    if (connectionCandidates.length > 1) {
      connectionCandidates
        .sort((a, b) => a.pointerDistance - b.pointerDistance)
        .slice(0, 26)
        .forEach(({ particle }, index, nearby) => {
          for (let nextIndex = index + 1; nextIndex < nearby.length; nextIndex += 1) {
            const next = nearby[nextIndex].particle;
            const dx = particle.screenX - next.screenX;
            const dy = particle.screenY - next.screenY;
            const distance = Math.hypot(dx, dy);

            if (distance < 72) {
              const alpha = (1 - distance / 72) * 0.16;
              context.beginPath();
              context.strokeStyle = `rgba(17, 17, 17, ${alpha})`;
              context.lineWidth = 0.55;
              context.moveTo(particle.screenX, particle.screenY);
              context.lineTo(next.screenX, next.screenY);
              context.stroke();
            }
          }
        });
    }

    particles.forEach((particle) => {
      const [red, green, blue] = particle.color;
      context.beginPath();
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${particle.alpha})`;
      context.arc(particle.screenX, particle.screenY, particle.size, 0, Math.PI * 2);
      context.fill();
    });

    if (!reducedMotion.matches) {
      requestAnimationFrame(draw);
    }
  }

  window.addEventListener("pointermove", (event) => {
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    pointer.active = true;
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(draw);
}
