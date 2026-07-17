const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const menuLinks = document.querySelectorAll(".primary-menu a");
const pageParams = new URLSearchParams(window.location.search);
const unfurlModeParam = pageParams.get("unfurl");
const unfurlMode = unfurlModeParam === "all" || unfurlModeParam === "down";

if (unfurlMode) {
  document.body.dataset.unfurl = unfurlModeParam;
}

window.scrollTo(0, 0);

window.setTimeout(() => {
  window.scrollTo(0, 0);
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

const contactSection = document.querySelector(".contact");

if (contactSection && "IntersectionObserver" in window) {
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (document.body.dataset.introActive !== "true") {
        document.body.dataset.dotfieldTheme = entry.isIntersecting ? "inverse" : "default";
      }
    });
  }, {
    threshold: 0.28,
  });

  contactObserver.observe(contactSection);
}

const workFrame = document.querySelector(".work-frame");
const workImage = document.querySelector(".work-frame img");
const workLabel = document.querySelector(".work-label");
const workBars = document.querySelector(".slider-bars");
const workPlaceholderImage = "assets/additional-work.png";
const additionalWorkSlides = Array.from({ length: 15 }, (_, index) => ({
  image: workPlaceholderImage,
  alt: index === 1 ? "Washington Wizards homepage design" : `Additional work carousel slide ${index + 1}`,
  label: index === 1 ? "Washington Wizards" : `Additional Work ${String(index + 1).padStart(2, "0")}`,
}));
let activeWorkSlide = 0;
let workSlideTimer;
const preloadedWorkImages = new Set();

function formatWorkLabel(index) {
  const slide = additionalWorkSlides[index];
  const current = String(index + 1).padStart(2, "0");
  const total = String(additionalWorkSlides.length).padStart(2, "0");
  return `${current}/${total} – ${slide.label}`;
}

function preloadWorkSlide(index) {
  const slide = additionalWorkSlides[index];

  if (!slide || preloadedWorkImages.has(slide.image)) {
    return;
  }

  const image = new Image();
  image.src = slide.image;
  preloadedWorkImages.add(slide.image);
}

function renderWorkBars() {
  if (!workBars) {
    return;
  }

  workBars.innerHTML = "";
  const barGap = 6;
  const collapsedStep = 16 + barGap;
  const activeOffset = 64 - 16;
  const trackWidth = (additionalWorkSlides.length * 16) + ((additionalWorkSlides.length - 1) * barGap) + activeOffset;
  workBars.style.setProperty("--slider-track-width", `${trackWidth}px`);

  const indicator = document.createElement("span");
  indicator.className = "slider-active-indicator";
  indicator.setAttribute("aria-hidden", "true");
  workBars.appendChild(indicator);

  additionalWorkSlides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.className = "slider-bar";
    button.type = "button";
    button.setAttribute("aria-label", `Show slide ${index + 1}: ${slide.label}`);

    if (index === activeWorkSlide) {
      button.classList.add("active");
      button.setAttribute("aria-current", "true");
    }

    button.addEventListener("click", () => setWorkSlide(index));
    workBars.appendChild(button);
  });

  updateWorkBars();
}

function updateWorkSlideState(syncBars = true) {
  const slide = additionalWorkSlides[activeWorkSlide];

  if (!slide || !workImage || !workLabel || !workBars) {
    return;
  }

  workImage.src = slide.image;
  workImage.alt = slide.alt;
  workLabel.textContent = formatWorkLabel(activeWorkSlide);

  if (syncBars) {
    updateWorkBars();
  }

  preloadWorkSlide((activeWorkSlide + 1) % additionalWorkSlides.length);
  preloadWorkSlide((activeWorkSlide - 1 + additionalWorkSlides.length) % additionalWorkSlides.length);
}

function updateWorkBars() {
  if (!workBars) {
    return;
  }

  const barGap = 6;
  const collapsedStep = 16 + barGap;
  const activeOffset = 64 - 16;
  workBars.style.setProperty("--active-bar-x", `${activeWorkSlide * collapsedStep}px`);

  workBars.querySelectorAll(".slider-bar").forEach((button, index) => {
    const isActive = index === activeWorkSlide;
    const xPosition = (index * collapsedStep) + (index > activeWorkSlide ? activeOffset : 0);
    button.style.setProperty("--bar-x", `${xPosition}px`);
    button.classList.toggle("active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function setWorkSlide(index) {
  if (!workFrame || index === activeWorkSlide || !additionalWorkSlides[index]) {
    return;
  }

  window.clearTimeout(workSlideTimer);
  activeWorkSlide = index;
  updateWorkBars();

  workFrame.dataset.transitioning = "true";

  workSlideTimer = window.setTimeout(() => {
    updateWorkSlideState(false);
    workFrame.dataset.transitioning = "false";
  }, 180);
}

if (workFrame && workImage && workLabel && workBars && additionalWorkSlides.length > 0) {
  renderWorkBars();
  updateWorkSlideState();

  workFrame.addEventListener("click", () => {
    setWorkSlide((activeWorkSlide + 1) % additionalWorkSlides.length);
  });

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => preloadWorkSlide((activeWorkSlide + 1) % additionalWorkSlides.length));
  } else {
    window.setTimeout(() => preloadWorkSlide((activeWorkSlide + 1) % additionalWorkSlides.length), 600);
  }
}

const revealSelectors = unfurlMode ? [
  ".hero .eyebrow",
  ".hero h1",
  ".hero-aside p",
  ".hero-actions",
  ".section-intro .eyebrow",
  ".section-intro h2",
  ".section-copy",
  ".section-link",
  ".impact-grid article",
  ".closing-line",
  ".profile-image",
  ".about-copy > *",
  ".process-grid article",
  ".experience-list article",
  ".case-card",
  ".work-carousel",
  ".brand-section .eyebrow",
  ".logo-grid img",
  ".contact .eyebrow",
  ".contact h2",
  ".contact > p:not(.eyebrow)",
  ".contact-links",
] : [
  ".section-intro",
  ".impact-card",
  ".process-card",
  ".experience-list article",
  ".case-card",
  ".work-frame",
  ".contact h2",
  ".contact-links",
];
const revealItems = document.querySelectorAll(revealSelectors.join(", "));
const revealMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (revealItems.length > 0 && !revealMotion.matches) {
  document.body.dataset.reveal = "true";

  revealItems.forEach((item) => {
    item.classList.add("reveal-item");

    if (!unfurlMode && item.matches(".impact-card, .process-card, .case-card")) {
      const siblings = Array.from(item.parentElement.children).filter((child) => child.matches(".impact-card, .process-card, .case-card, .impact-grid article, .process-grid article, .logo-grid img, .hero-aside p"));
      item.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(item), 3) * 45}ms`);
    }
  });

  if (unfurlMode) {
    const revealContainers = document.querySelectorAll("main > section, .site-footer");

    revealContainers.forEach((container) => {
      const localItems = Array.from(container.querySelectorAll(".reveal-item")).sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aTop = Math.round((aRect.top + window.scrollY) / 24);
        const bTop = Math.round((bRect.top + window.scrollY) / 24);

        if (aTop !== bTop) {
          return aTop - bTop;
        }

        return aRect.left - bRect.left;
      });

      localItems.forEach((item, index) => {
        let revealDelay = Math.min(index, 5) * 55;

        if (item.matches(".section-link")) {
          revealDelay = 80;
        }

        item.style.setProperty("--reveal-delay", `${revealDelay}ms`);
      });
    });

    document.querySelectorAll(".logo-grid").forEach((grid) => {
      Array.from(grid.querySelectorAll(".reveal-item")).forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 32}ms`);
      });
    });

    let unfurlTicking = false;

    const revealVisibleUnfurlItems = () => {
      revealItems.forEach((item) => {
        const rect = item.getBoundingClientRect();

        if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
          item.classList.add("is-visible");
        }
      });

      unfurlTicking = false;
    };

    const requestUnfurlReveal = () => {
      if (!unfurlTicking) {
        unfurlTicking = true;
        window.requestAnimationFrame(revealVisibleUnfurlItems);
      }
    };

    window.setTimeout(requestUnfurlReveal, 4400);
    window.addEventListener("scroll", requestUnfurlReveal, { passive: true });
    window.addEventListener("resize", requestUnfurlReveal);
  } else if ("IntersectionObserver" in window) {
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
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000, active: false };
  let width = 0;
  let height = 0;
  let particles = [];
  let mobileClusters = [];
  let start = performance.now();

  const colors = [
    [17, 17, 17],
    [101, 94, 78],
    [126, 107, 143],
    [105, 162, 151],
  ];

  function makeParticles() {
    const count = window.innerWidth < 760 ? 680 : 2475;
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

  function makeMobileClusters() {
    const clusterMap = [
      { x: 0.18, y: 0.18, radius: 92, nodes: 9, phase: 0.2 },
      { x: 0.77, y: 0.28, radius: 118, nodes: 12, phase: 1.8 },
      { x: 0.33, y: 0.52, radius: 102, nodes: 10, phase: 3.1 },
      { x: 0.83, y: 0.66, radius: 86, nodes: 8, phase: 4.2 },
      { x: 0.24, y: 0.84, radius: 112, nodes: 11, phase: 5.4 },
    ];

    mobileClusters = clusterMap.map((cluster, clusterIndex) => ({
      ...cluster,
      drift: cluster.phase + clusterIndex * 0.6,
      nodes: Array.from({ length: cluster.nodes }, (_, nodeIndex) => {
        const angle = (nodeIndex / cluster.nodes) * Math.PI * 2 + cluster.phase;
        const radius = cluster.radius * (0.24 + ((nodeIndex * 37) % 61) / 100);

        return {
          x: Math.cos(angle) * radius * (0.82 + ((nodeIndex * 13) % 17) / 100),
          y: Math.sin(angle) * radius * (0.62 + ((nodeIndex * 19) % 23) / 100),
          phase: cluster.phase + nodeIndex * 0.47,
          size: 0.7 + ((nodeIndex * 11) % 9) / 10,
        };
      }),
    }));
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
    makeMobileClusters();
  }

  function drawMobileLoop(elapsed, inverseActive) {
    const lineColor = inverseActive ? "248, 247, 243" : "17, 17, 17";
    const dotColor = inverseActive ? "248, 247, 243" : "17, 17, 17";
    const globalAlpha = inverseActive ? 1.16 : 1;

    mobileClusters.forEach((cluster) => {
      const driftX = Math.sin(elapsed * 0.08 + cluster.drift) * Math.min(width, 720) * 0.035;
      const driftY = Math.cos(elapsed * 0.065 + cluster.drift) * Math.min(height, 900) * 0.028;
      const centerX = width * cluster.x + driftX;
      const centerY = height * cluster.y + driftY;
      const rotation = Math.sin(elapsed * 0.05 + cluster.phase) * 0.16;
      const breathe = 1 + Math.sin(elapsed * 0.18 + cluster.phase) * 0.035;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const points = cluster.nodes.map((node) => {
        const wobble = Math.sin(elapsed * 0.16 + node.phase) * 4.5;
        const x = (node.x * breathe) + wobble;
        const y = (node.y * breathe) + Math.cos(elapsed * 0.13 + node.phase) * 4;

        return {
          x: centerX + (x * cos - y * sin),
          y: centerY + (x * sin + y * cos),
          size: node.size,
          phase: node.phase,
        };
      });

      points.forEach((point, index) => {
        for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
          const next = points[nextIndex];
          const distance = Math.hypot(point.x - next.x, point.y - next.y);
          const maxDistance = cluster.radius * 0.74;

          if (distance < maxDistance) {
            const pulse = 0.74 + Math.sin(elapsed * 0.28 + point.phase + next.phase) * 0.18;
            const alpha = (1 - distance / maxDistance) * pulse * (inverseActive ? 0.24 : 0.105) * globalAlpha;

            context.beginPath();
            context.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            context.lineWidth = inverseActive ? 0.58 : 0.46;
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }
        }
      });

      points.forEach((point) => {
        const alpha = (0.18 + Math.sin(elapsed * 0.22 + point.phase) * 0.045) * (inverseActive ? 1.42 : 1);

        context.beginPath();
        context.fillStyle = `rgba(${dotColor}, ${alpha})`;
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  function draw(now) {
    const elapsed = (now - start) / 1000;
    const introActive = document.body.dataset.introActive === "true";
    const mobileAmbient = coarsePointer.matches && !introActive;
    const introConstellation = introActive;
    const siteConstellation = !introActive;
    const constellationActive = introConstellation || siteConstellation;
    const inverseActive = introActive || document.body.dataset.dotfieldTheme === "inverse";
    context.clearRect(0, 0, width, height);

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    const normalScale = Math.min(width, height) * (width < 760 ? 0.82 : 0.72);
    const constellationScale = Math.max(width, height) * (introActive ? 1.24 : 0.92);
    const scale = constellationActive ? constellationScale : normalScale;
    const centerX = constellationActive ? width * (introActive ? 0.5 : 0.46 + Math.sin(elapsed * 0.035) * 0.035) : width * (0.24 + Math.sin(elapsed * 0.055) * 0.12 + Math.sin(elapsed * 0.018) * 0.08);
    const centerY = constellationActive ? height * (introActive ? 0.5 : 0.46 + Math.cos(elapsed * 0.032) * 0.03) : height * (0.34 + Math.cos(elapsed * 0.046) * 0.1 + Math.sin(elapsed * 0.02) * 0.04);
    const rotation = introActive ? Math.sin(elapsed * 0.034) * 0.34 - 0.18 : Math.sin(elapsed * 0.024) * 0.24 - 0.12;
    const morphA = Math.sin(elapsed * (introActive ? 0.08 : 0.055)) * (introActive ? 0.055 : 0.075);
    const morphB = Math.cos(elapsed * (introActive ? 0.06 : 0.045)) * (introActive ? 0.045 : 0.062);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const connectionCandidates = [];

    if (mobileAmbient) {
      drawMobileLoop(elapsed, inverseActive);

      if (!reducedMotion.matches) {
        requestAnimationFrame(draw);
      }

      return;
    }

    particles.forEach((particle) => {
      const pulse = Math.sin(elapsed * 0.32 + particle.drift) * 0.026;
      const localX = particle.x * (1 + pulse + morphA);
      const localY = particle.y * (1 - pulse + morphB);
      const baseX = centerX + (localX * cos - localY * sin) * scale;
      const baseY = centerY + (localX * sin + localY * cos) * scale;
      let targetX = 0;
      let targetY = 0;

      if (pointer.active && width > 760 && !mobileAmbient) {
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

            const connectionDistance = 72;

            if (distance < connectionDistance) {
              const alpha = (1 - distance / connectionDistance) * (introConstellation ? 0.34 : inverseActive ? 0.24 : 0.16);
              context.beginPath();
              context.strokeStyle = inverseActive ? `rgba(248, 247, 243, ${alpha})` : `rgba(17, 17, 17, ${alpha})`;
              context.lineWidth = constellationActive ? 0.72 : 0.55;
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
      const inverseAlpha = Math.min(0.58, particle.alpha * 1.28);
      const introSize = particle.size * 1.28;
      const siteConstellationAlphaD = Math.min(0.54, particle.alpha * 1.18);
      const inverseConstellationAlphaD = Math.min(0.64, particle.alpha * 1.34);
      const siteConstellationSize = particle.size * 1.08;
      context.beginPath();
      context.fillStyle = inverseActive ? `rgba(248, 247, 243, ${introConstellation ? introAlpha : siteConstellation ? inverseConstellationAlphaD : inverseAlpha})` : `rgba(${red}, ${green}, ${blue}, ${siteConstellation ? siteConstellationAlphaD : particle.alpha})`;
      context.arc(particle.screenX, particle.screenY, introConstellation ? introSize : siteConstellation ? siteConstellationSize : particle.size, 0, Math.PI * 2);
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
