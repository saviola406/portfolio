// ---------- Utilitaires ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Année automatique dans le footer
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Menu mobile ----------
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

// ---------- Thème noir (par défaut) / clair ----------
const themeToggle = document.getElementById("theme-toggle");
let particleColor = "#748ffc";

function refreshParticleColor() {
  const color = getComputedStyle(document.body).getPropertyValue("--primary").trim();
  if (color) particleColor = color;
}

function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
  refreshParticleColor();
}

let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("portfolio-theme") || "dark";
} catch (e) {
  // stockage indisponible : on garde le thème noir
}
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(newTheme);
  try {
    localStorage.setItem("portfolio-theme", newTheme);
  } catch (e) {}
});

// ---------- Défilement : barre de progression, header, retour en haut ----------
const progressBar = document.getElementById("scroll-progress");
const header = document.querySelector(".header");
const toTop = document.getElementById("to-top");
let ticking = false;

function onScroll() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? (scrollTop / max) * 100 : 0) + "%";
  header.classList.toggle("scrolled", scrollTop > 10);
  toTop.classList.toggle("show", scrollTop > 600);
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true }
);
onScroll();

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

// ---------- Apparition au défilement ----------
const revealEls = document.querySelectorAll(".reveal, .stagger");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// ---------- Menu : section active ----------
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav a[href^='#']");

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

// ---------- Effet machine à écrire ----------
const typedEl = document.getElementById("typed");
const roles = [
  "Développeur mobile Flutter",
  "Data Analyst",
  "Développeur BI",
  "Développeur logiciel",
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const word = roles[roleIndex];
  typedEl.textContent = word.substring(0, charIndex);
  let delay = deleting ? 40 : 90;

  if (!deleting && charIndex === word.length) {
    deleting = true;
    delay = 1600;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  } else {
    charIndex += deleting ? -1 : 1;
  }

  setTimeout(typeLoop, delay);
}

if (reduceMotion) {
  typedEl.textContent = roles[0];
} else {
  typeLoop();
}

// ---------- Particules animées (fond de l'accueil) ----------
const canvas = document.getElementById("particles");

if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  const hero = document.getElementById("accueil");
  const mouse = { x: null, y: null };
  let particles = [];
  let width = 0;
  let height = 0;
  let running = true;
  let looping = false;

  function resizeCanvas() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    const count = Math.min(80, Math.floor((width * height) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    }));
  }

  function draw() {
    if (!running) {
      looping = false;
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = particleColor;
    ctx.strokeStyle = particleColor;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Lignes entre particules proches
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 120) {
          ctx.globalAlpha = (1 - dist / 120) * 0.35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // Lignes vers la souris
      if (mouse.x !== null) {
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dist < 150) {
          ctx.globalAlpha = (1 - dist / 150) * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  function startLoop() {
    if (!looping) {
      looping = true;
      requestAnimationFrame(draw);
    }
  }

  hero.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", resizeCanvas);

  // Pause quand l'accueil n'est plus visible
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
      if (running) startLoop();
    }).observe(hero);
  }

  resizeCanvas();
  startLoop();
}

// ---------- Copier l'email ----------
const copyBtn = document.getElementById("copy-email");

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("saviolaahn@gmail.com");
    copyBtn.textContent = "Copié ✓";
  } catch (e) {
    copyBtn.textContent = "Copie impossible";
  }
  setTimeout(() => {
    copyBtn.textContent = "Copier l'email";
  }, 2000);
});
