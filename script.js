// Loader
window.addEventListener("load", () => setTimeout(() => document.getElementById("loader").classList.add("done"), 700));
document.getElementById("year").textContent = new Date().getFullYear();

// Neural-network particle background
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let W, H, nodes = [];
const mouse = { x: -999, y: -999 };

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(110, Math.floor((W * H) / 14000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.8 + 0.6,
  }));
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const n of nodes) {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
    if (d < 120) { n.x += dx / d; n.y += dy / d; } // gentle repel
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(201,164,106,${(1 - d / 130) * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    ctx.fillStyle = "#8fa9b8";
    ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2); ctx.fill();
  }
  requestAnimationFrame(draw);
}
addEventListener("resize", resize);
resize(); draw();

// Cursor glow
const glow = document.querySelector(".cursor-glow");
addEventListener("mousemove", (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px";
});

// Typewriter
const words = ["LLM pipelines.", "CUDA kernels.", "semantic search.", "React interfaces.", "things that scale."];
const typed = document.getElementById("typed");
let wi = 0, ci = 0, del = false;
(function type() {
  const w = words[wi];
  typed.textContent = w.slice(0, ci += del ? -1 : 1);
  let t = del ? 45 : 95;
  if (!del && ci === w.length) { del = true; t = 1600; }
  else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; t = 300; }
  setTimeout(type, t);
})();

// Scroll reveal + counters
function countUp(el) {
  const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || "";
  const start = performance.now(), dur = 1800;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = (end * e).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    en.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(en.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Nav: scrolled state, progress bar, active link
const nav = document.querySelector(".nav"), bar = document.querySelector(".progress");
const links = document.querySelectorAll(".nav-links a");
addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", scrollY > 40);
  bar.style.width = (scrollY / (document.body.scrollHeight - innerHeight)) * 100 + "%";
  let current = "";
  document.querySelectorAll("section").forEach((s) => { if (scrollY >= s.offsetTop - 200) current = s.id; });
  links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
});

// Mobile menu
const burger = document.querySelector(".burger"), menu = document.querySelector(".nav-links");
burger.addEventListener("click", () => { burger.classList.toggle("open"); menu.classList.toggle("open"); });
links.forEach((l) => l.addEventListener("click", () => { burger.classList.remove("open"); menu.classList.remove("open"); }));

// 3D tilt + spotlight on cards
document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.setProperty("--mx", x + "px"); card.style.setProperty("--my", y + "px");
    const rx = (y / r.height - 0.5) * -12, ry = (x / r.width - 0.5) * 12;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));
});

// Magnetic buttons
document.querySelectorAll(".magnetic").forEach((b) => {
  b.addEventListener("mousemove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  });
  b.addEventListener("mouseleave", () => (b.style.transform = ""));
});
