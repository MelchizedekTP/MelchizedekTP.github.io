/* ------------------------------------------------------------------ *
 *  melchizedek@iisc — portfolio shell
 * ------------------------------------------------------------------ */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("load", () =>
  setTimeout(() => document.getElementById("loader").classList.add("done"), reduced ? 0 : 500)
);
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Background: sparse node mesh ---------- */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let W, H, nodes = [];
const mouse = { x: -999, y: -999 };

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(90, Math.floor((W * H) / 18000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.4 + 0.5,
  }));
}
function draw(animate = true) {
  ctx.clearRect(0, 0, W, H);
  for (const n of nodes) {
    if (!animate) break;
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
    if (d < 110 && d > 0) { n.x += dx / d; n.y += dy / d; }
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(141,180,214,${(1 - d / 130) * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    ctx.fillStyle = "#8db4d6";
    ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2); ctx.fill();
  }
  if (animate) requestAnimationFrame(() => draw(true));
}
addEventListener("resize", () => { resize(); draw(false); });
addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize();
draw(!reduced);

/* ================================================================== *
 *  Terminal
 * ================================================================== */
const out = document.getElementById("termOut");
const body = document.getElementById("termBody");
const form = document.getElementById("termForm");
const input = document.getElementById("termIn");

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const scrollEnd = () => { body.scrollTop = body.scrollHeight; };

function print(html = "", cls = "") {
  const el = document.createElement("div");
  if (cls) el.className = cls;
  el.innerHTML = html || "&nbsp;";
  out.appendChild(el);
  scrollEnd();
  return el;
}

/* ---------- Content ---------- */
const FILES = {
  "about.md": "about",
  "skills.txt": "skills",
  "experience.log": "experience",
  "education.yaml": "education",
  "contact.sh": "contact",
  "projects/": "projects",
};

const PROJECTS = [
  { id: "1", name: "fret-engine", title: "Air-Gapped Formal Requirements Synthesis Engine",
    desc: "Self-hosted Qwen-32B on vLLM translating natural-language specs into FRETish formal requirements, grounded by a local ChromaDB retrieval engine over 20,000+ chunks.",
    tags: "genai vllm rag chromadb" },
  { id: "2", name: "semantic-recsys", title: "Semantic Movie Recommendation Engine",
    desc: "Fine-tuned Sentence-Transformer on 5,000+ TMDB profiles producing 384-d embeddings, with KNN cosine search for sub-millisecond top-k retrieval at 94.2% accuracy.",
    tags: "nlp embeddings knn" },
  { id: "3", name: "io-aware-attn", title: "Custom IO-Aware Attention Engine",
    desc: "Forward FlashAttention kernel in CUDA with 2D block tiling into SRAM and online softmax — the N×N attention matrix never touches global memory.",
    tags: "cuda flashattention hpc" },
];

const SKILLS = {
  languages: "python  c++  cuda  dart  javascript",
  "ml / genai": "vllm  chromadb  sentence-transformers  rag  flashattention",
  frontend: "react  tailwindcss  flutter  contentful",
  backend: "flask  postgresql  firebase",
  platform: "linux  azure  git",
};

const HELP = [
  ["about", "who I am"],
  ["projects", "what I've built  (open <n> for detail)"],
  ["experience", "where I've worked"],
  ["education", "degrees & certifications"],
  ["skills", "the toolbox"],
  ["contact", "how to reach me"],
  ["ls / cat <file>", "poke around the filesystem"],
  ["cd <section>", "scroll to a section"],
  ["theme <name>", "green | amber | blue"],
  ["clear", "wipe the screen"],
];

/* ---------- Command implementations ---------- */
function cmdHelp() {
  print('<span class="dimd">available commands:</span>');
  HELP.forEach(([c, d]) =>
    print(`  <span class="acc">${esc(c.padEnd(17))}</span><span class="muted">${esc(d)}</span>`)
  );
  print();
  print('<span class="dimd">↑/↓ history · tab completes · or just scroll the page</span>');
}

function cmdAbout() {
  print('<span class="muted">Software Engineer. M.Tech in Computer Science at the</span>');
  print('<span class="muted">Indian Institute of Science. Previously Senior Software</span>');
  print('<span class="muted">Engineer at LTIMindtree.</span>');
  print();
  print('<span class="dimd"># GenAI systems · GPU programming · semantic search</span>');
}

function cmdProjects() {
  print('<span class="dimd">total 3</span>');
  PROJECTS.forEach((p) =>
    print(`  <span class="key">[${p.id}]</span> <span class="acc">${p.name.padEnd(18)}</span><span class="muted">${p.title}</span>`)
  );
  print();
  print('<span class="dimd">run `open 1` for details, or `cd projects` to see the cards</span>');
}

function cmdOpen(arg) {
  const p = PROJECTS.find((x) => x.id === arg || x.name === arg);
  if (!p) return print(`<span class="warn">open: no such project: ${esc(arg || "")}</span>`);
  print(`<span class="acc">${p.title}</span>`);
  print(`<span class="muted">${p.desc}</span>`);
  print(`<span class="dimd">tags: ${p.tags.split(" ").map((t) => "#" + t).join("  ")}</span>`);
}

function cmdExperience() {
  print('<span class="warn">2022 — 2023 · Bangalore</span>');
  print('<span class="acc">Senior Software Engineer @ LTIMindtree</span>');
  print('  <span class="ok">▸</span> <span class="muted">Led a full-scale front-end migration to React with reusable</span>');
  print('    <span class="muted">components, Tailwind CSS and Contentful.</span>');
  print('  <span class="ok">▸</span> <span class="muted">Audited legacy code, defined architecture and ran testing</span>');
  print('    <span class="muted">cycles for zero-downtime delivery.</span>');
  print('  <span class="warn">[★] Team Player badge</span>');
}

function cmdEducation() {
  print('<span class="key">- degree:</span> <span class="muted">M.Tech, Computer Science</span>');
  print('  <span class="key">school:</span> <span class="muted">Indian Institute of Science</span>');
  print('  <span class="key">years:</span>  <span class="muted">present</span>');
  print('<span class="key">- degree:</span> <span class="muted">B.Tech, Engineering Physics</span>');
  print('  <span class="key">school:</span> <span class="muted">NIT Calicut</span>');
  print('  <span class="key">years:</span>  <span class="muted">2022</span>');
  print();
  ["Azure Fundamentals", "Power Platform Fundamentals", "Data Analysis with Python", "DSA with Python"]
    .forEach((c) => print(`<span class="ok">[✓]</span> <span class="muted">${c}</span>`));
}

function cmdSkills() {
  Object.entries(SKILLS).forEach(([k, v]) =>
    print(`  <span class="key">${(k + ":").padEnd(14)}</span><span class="muted">${v}</span>`)
  );
}

function cmdContact() {
  print('<span class="ok">→ running say-hello.sh …</span>');
  print('<span class="muted">Open to collaborations, research and engineering roles.</span>');
  print('<a href="https://github.com/MelchizedekTP/" target="_blank" rel="noopener">github.com/MelchizedekTP ↗</a>');
  print('<span class="dimd">exit code 0</span>');
}

function cmdLs(arg) {
  if (arg && arg.replace(/\/$/, "") === "projects") return cmdProjects();
  if (arg && arg.replace(/^~?\/?/, "") === "skills") return cmdSkills();
  print('<span class="dimd">total ' + Object.keys(FILES).length + "</span>");
  Object.keys(FILES).forEach((f) => {
    const dir = f.endsWith("/");
    print(`  <span class="${dir ? "acc" : "muted"}">${f}</span>`);
  });
}

function cmdCat(arg) {
  if (!arg) return print('<span class="warn">cat: missing operand</span>');
  const key = FILES[arg] || FILES[arg + "/"] || (Object.keys(FILES).includes(arg) ? arg : null);
  const map = { about: cmdAbout, skills: cmdSkills, experience: cmdExperience, education: cmdEducation, contact: cmdContact, projects: cmdProjects };
  if (key && map[key]) return map[key]();
  print(`<span class="warn">cat: ${esc(arg)}: No such file or directory</span>`);
}

function cmdCd(arg) {
  const id = (arg || "").replace(/[~/]/g, "").replace(/^\.\.$/, "home") || "home";
  const target = document.getElementById(id === "home" ? "home" : id);
  if (!target) return print(`<span class="warn">cd: ${esc(arg || "")}: No such section</span>`);
  print(`<span class="dimd">→ ~/${id}</span>`);
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

function cmdTheme(arg) {
  const themes = {
    green: { a1: "#4ade80", a2: "#86efac", g: "#4ade80" },
    amber: { a1: "#ffb000", a2: "#ffd079", g: "#ffb000" },
    blue: { a1: "#8db4d6", a2: "#c4d9ea", g: "#7fd1a8" },
  };
  const t = themes[arg];
  if (!t) return print('<span class="warn">usage: theme green | amber | blue</span>');
  const r = document.documentElement.style;
  r.setProperty("--a1", t.a1); r.setProperty("--a2", t.a2); r.setProperty("--g", t.g);
  r.setProperty("--grad", `linear-gradient(120deg, ${t.a1}, ${t.a2})`);
  r.setProperty("--glow", `0 0 6px ${t.a1}59`);
  print(`<span class="ok">phosphor set to ${arg}.</span>`);
}

function cmdNeofetch() {
  const art = [
    "  __  __ _____ ___  ",
    " |  \\/  |_   _| _ \\ ",
    " | |\\/| | | | |  _/ ",
    " |_|  |_| |_| |_|   ",
  ];
  const info = [
    ["user", "melchizedek t p"],
    ["role", "software engineer"],
    ["host", "indian institute of science"],
    ["shell", "zsh 5.9"],
    ["focus", "genai · cuda · semantic search"],
    ["uptime", "always building"],
  ];
  art.forEach((line, i) => {
    const kv = info[i] ? `<span class="key">${info[i][0]}</span><span class="dimd">: </span><span class="muted">${info[i][1]}</span>` : "";
    print(`<span class="acc">${esc(line)}</span>  ${kv}`);
  });
  info.slice(art.length).forEach(([k, v]) =>
    print(`${" ".repeat(22)}<span class="key">${k}</span><span class="dimd">: </span><span class="muted">${v}</span>`)
  );
}

/* ---------- Dispatcher ---------- */
const history = [];
let hIdx = -1;

const COMMANDS = {
  help: cmdHelp, "?": cmdHelp, man: cmdHelp,
  about: cmdAbout, bio: cmdAbout,
  whoami: () => { print('<span class="acc">melchizedek t p</span>'); print('<span class="muted">software engineer · iisc</span>'); },
  projects: cmdProjects, work: cmdProjects,
  open: cmdOpen,
  experience: cmdExperience,
  education: cmdEducation,
  skills: cmdSkills, stack: cmdSkills,
  contact: cmdContact, email: cmdContact, hire: cmdContact,
  github: () => { print('<span class="dimd">opening github.com/MelchizedekTP …</span>'); window.open("https://github.com/MelchizedekTP/", "_blank", "noopener"); },
  ls: cmdLs, dir: cmdLs,
  cat: cmdCat,
  cd: cmdCd, goto: cmdCd,
  theme: cmdTheme,
  neofetch: cmdNeofetch,
  clear: () => { out.innerHTML = ""; },
  pwd: () => print('<span class="muted">/home/melchizedek/portfolio</span>'),
  date: () => print(`<span class="muted">${new Date().toString()}</span>`),
  uname: () => print('<span class="muted">Portfolio 1.0 · built with vanilla html/css/js · no frameworks harmed</span>'),
  echo: (_arg, raw) => print(`<span class="muted">${esc(raw.slice(5))}</span>`),
  history: () => history.forEach((h, i) => print(`  <span class="dimd">${String(i + 1).padStart(3)}</span>  <span class="muted">${esc(h)}</span>`)),
  sudo: () => print('<span class="warn">melchizedek is not in the sudoers file. This incident has been reported.</span>'),
  exit: () => print('<span class="dimd">nice try — you can just close the tab.</span>'),
  rm: () => print('<span class="warn">rm: permission denied (this portfolio took a while)</span>'),
  vim: () => print('<span class="dimd">you are now trapped. (press any key, it is fine, this is a website)</span>'),
};

const PROMPT =
  '<span class="ok">melchizedek@iisc</span><span class="dimd">:</span><span class="acc">~</span><span class="muted">$</span>';

function run(raw) {
  const line = raw.trim();
  print(`${PROMPT} ${esc(line)}`, "echo");
  if (!line) return;
  history.push(line);
  hIdx = history.length;
  const [cmd, ...args] = line.split(/\s+/);
  const fn = COMMANDS[cmd.toLowerCase()];
  if (fn) fn(args[0], line, args);
  else print(`<span class="warn">zsh: command not found: ${esc(cmd)}</span><span class="dimd">  — try \`help\`</span>`);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  run(input.value);
  input.value = "";
  scrollEnd();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (hIdx > 0) input.value = history[--hIdx];
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (hIdx < history.length - 1) input.value = history[++hIdx];
    else { hIdx = history.length; input.value = ""; }
  } else if (e.key === "Tab") {
    e.preventDefault();
    const v = input.value.toLowerCase();
    if (!v) return;
    const m = Object.keys(COMMANDS).filter((c) => c.startsWith(v));
    if (m.length === 1) input.value = m[0] + " ";
    else if (m.length > 1) print(`<span class="dimd">${m.join("  ")}</span>`);
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    out.innerHTML = "";
  }
});

body.addEventListener("click", (e) => {
  if (e.target.tagName !== "A" && !getSelection().toString()) input.focus();
});

/* ---------- Boot sequence ---------- */
const WORDS = ["LLM pipelines.", "CUDA kernels.", "semantic search.", "React interfaces.", "things that scale."];
let typing = true;

function typewriter(el) {
  let wi = 0, ci = 0, del = false;
  (function tick() {
    if (!typing) { el.textContent = WORDS[wi]; return; }
    const w = WORDS[wi];
    el.textContent = w.slice(0, (ci += del ? -1 : 1));
    let t = del ? 40 : 90;
    if (!del && ci === w.length) { del = true; t = 1700; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % WORDS.length; t = 280; }
    setTimeout(tick, t);
  })();
}

const BOOT = [
  { d: 120, h: '<span class="dimd">Last login: just now on ttys001</span>' },
  { d: 420, h: PROMPT + " whoami", c: "echo" },
  { d: 260, h: '<span class="big">Melchizedek T P</span>' },
  { d: 160, h: '<span class="muted">software engineer · m.tech @ indian institute of science</span>' },
  { d: 320, h: PROMPT + " ./build.sh", c: "echo" },
  { d: 240, h: '<span class="muted">I build <span class="acc" id="typed"></span><span class="blink">_</span></span>' },
  { d: 500, h: '<span class="dimd">type <span class="acc">help</span> for commands, or scroll for the full story.</span>' },
];

(function boot(i = 0) {
  if (i >= BOOT.length) return;
  const step = BOOT[i];
  const go = () => {
    print(step.h, step.c || "");
    if (step.h.includes('id="typed"')) typewriter(document.getElementById("typed"));
    boot(i + 1);
  };
  reduced ? go() : setTimeout(go, step.d);
})();

// Stop the rotating line on first real interaction so scrollback stays readable.
input.addEventListener("keydown", function once() {
  typing = false;
  input.removeEventListener("keydown", once);
});

if (!reduced && innerWidth > 760) setTimeout(() => input.focus({ preventScroll: true }), 2400);

/* ================================================================== *
 *  Page chrome
 * ================================================================== */
function countUp(el) {
  const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || "";
  if (reduced) { el.textContent = end.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suf; return; }
  const start = performance.now(), dur = 1500;
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

const nav = document.querySelector(".nav"), bar = document.querySelector(".progress");
const links = document.querySelectorAll(".nav-links a");
addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", scrollY > 40);
  bar.style.width = (scrollY / (document.body.scrollHeight - innerHeight)) * 100 + "%";
  let current = "";
  document.querySelectorAll("section[id]").forEach((s) => { if (scrollY >= s.offsetTop - 200) current = s.id; });
  links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
});

const burger = document.querySelector(".burger"), menu = document.querySelector(".nav-links");
burger.addEventListener("click", () => {
  const open = burger.classList.toggle("open");
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
});
links.forEach((l) => l.addEventListener("click", () => {
  burger.classList.remove("open"); menu.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}));

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  });
});
