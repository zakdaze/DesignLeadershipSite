const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const menuLinks = document.querySelectorAll(".primary-menu a");

window.setTimeout(() => {
  document.body.dataset.introActive = "false";
}, 4300);

function setHeaderScrolled() {
  header.dataset.navScrolled = String(window.scrollY > 12);
}

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

window.addEventListener("scroll", setHeaderScrolled, { passive: true });
setHeaderScrolled();

const revealItems = document.querySelectorAll([
  ".section-intro",
  ".impact-card",
  ".process-card",
  ".experience-list article",
  ".case-card",
  ".work-frame",
  ".contact h2",
  ".contact-links",
].join(", "));
const revealMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (revealItems.length > 0 && !revealMotion.matches) {
  document.body.dataset.reveal = "true";

  revealItems.forEach((item) => {
    item.classList.add("reveal-item");

    if (item.matches(".impact-card, .process-card, .case-card")) {
      const siblings = Array.from(item.parentElement.children).filter((child) => child.matches(".impact-card, .process-card, .case-card"));
      item.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(item), 3) * 45}ms`);
    }
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const parallaxMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const parallaxItems = document.querySelectorAll(".case-card, .work-frame img");
let parallaxTicking = false;

function updateParallax() {
  const viewportCenter = window.innerHeight / 2;

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const progress = Math.max(-1, Math.min(1, (itemCenter - viewportCenter) / window.innerHeight));

    if (item.matches(".case-card")) {
      item.style.setProperty("--case-line-shift", `${(progress * -18).toFixed(2)}px`);
    } else {
      item.style.setProperty("--work-image-shift", `${(progress * -14).toFixed(2)}px`);
    }
  });

  parallaxTicking = false;
}

function requestParallaxUpdate() {
  if (!parallaxTicking) {
    requestAnimationFrame(updateParallax);
    parallaxTicking = true;
  }
}

if (parallaxItems.length > 0 && !parallaxMotion.matches && window.matchMedia("(min-width: 981px)").matches) {
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
  requestParallaxUpdate();
}

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
    const introActive = document.body.dataset.introActive === "true";
    context.clearRect(0, 0, width, height);

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    const scale = introActive ? Math.max(width, height) * 1.24 : Math.min(width, height) * (width < 760 ? 0.82 : 0.72);
    const centerX = introActive ? width * 0.5 : width * (0.24 + Math.sin(elapsed * 0.055) * 0.12 + Math.sin(elapsed * 0.018) * 0.08);
    const centerY = introActive ? height * 0.5 : height * (0.34 + Math.cos(elapsed * 0.046) * 0.1 + Math.sin(elapsed * 0.02) * 0.04);
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
              const alpha = (1 - distance / 72) * (introActive ? 0.34 : 0.16);
              context.beginPath();
              context.strokeStyle = introActive ? `rgba(248, 247, 243, ${alpha})` : `rgba(17, 17, 17, ${alpha})`;
              context.lineWidth = introActive ? 0.72 : 0.55;
              context.moveTo(particle.screenX, particle.screenY);
              context.lineTo(next.screenX, next.screenY);
              context.stroke();
            }
          }
        });
    }

    particles.forEach((particle) => {
      const [red, green, blue] = particle.color;
      const introAlpha = Math.min(0.9, particle.alpha * 1.9);
      const introSize = particle.size * 1.28;
      context.beginPath();
      context.fillStyle = introActive ? `rgba(248, 247, 243, ${introAlpha})` : `rgba(${red}, ${green}, ${blue}, ${particle.alpha})`;
      context.arc(particle.screenX, particle.screenY, introActive ? introSize : particle.size, 0, Math.PI * 2);
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

const cursorCanRun = window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (cursorCanRun) {
  const cursorDot = document.createElement("span");
  const cursorRing = document.createElement("span");
  const cursor = {
    dotX: window.innerWidth / 2,
    dotY: window.innerHeight / 2,
    ringX: window.innerWidth / 2,
    ringY: window.innerHeight / 2,
    visible: false,
  };

  cursorDot.className = "cursor-dot";
  cursorRing.className = "cursor-ring";
  cursorDot.setAttribute("aria-hidden", "true");
  cursorRing.setAttribute("aria-hidden", "true");
  document.body.append(cursorRing, cursorDot);
  document.body.dataset.customCursor = "true";

  function moveCursor() {
    cursor.ringX += (cursor.dotX - cursor.ringX) * 0.16;
    cursor.ringY += (cursor.dotY - cursor.ringY) * 0.16;
    cursorDot.style.transform = `translate3d(${cursor.dotX}px, ${cursor.dotY}px, 0) translate3d(-50%, -50%, 0)`;
    cursorRing.style.transform = `translate3d(${cursor.ringX}px, ${cursor.ringY}px, 0) translate3d(-50%, -50%, 0)`;
    requestAnimationFrame(moveCursor);
  }

  window.addEventListener("pointermove", (event) => {
    cursor.dotX = event.clientX;
    cursor.dotY = event.clientY;

    if (!cursor.visible) {
      cursor.ringX = cursor.dotX;
      cursor.ringY = cursor.dotY;
      cursor.visible = true;
    }
  });

  window.addEventListener("pointerleave", () => {
    document.body.dataset.customCursor = "false";
    cursor.visible = false;
  });

  window.addEventListener("pointerenter", () => {
    document.body.dataset.customCursor = "true";
  });

  document.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("pointerenter", () => {
      document.body.dataset.cursorHover = "true";
    });
    item.addEventListener("pointerleave", () => {
      document.body.dataset.cursorHover = "false";
    });
  });

  requestAnimationFrame(moveCursor);
}
