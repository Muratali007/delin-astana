// ===== Data =====
// Товары с фото из Instagram @delin.astana. price: null → «Цена в WhatsApp».
// cat: outer | suits | knit | dresses. isNew: показывать в фильтре «Новинки».
const PRODUCTS = [
  { img: "coat-grey", name: "Пальто прямого кроя", note: "Размер standard · серый", price: 32990, cat: "outer" },
  { img: "coat-black", name: "Пальто с поясом", note: "Размер standard", price: 46590, cat: "outer" },
  { img: "fur-black", name: "Шуба из эко-меха", note: "Новинка дня", price: null, cat: "outer", isNew: true },
  { img: "puffer", name: "Пуховик с поясом", note: "Новинка дня", price: null, cat: "outer", isNew: true },
  { img: "suit-red", name: "Костюм-двойка", note: "Жакет + юбка / брюки", price: 32590, cat: "suits" },
  { img: "blazer-leather", name: "Пиджак", note: "Коричневый · зелёный · бордовый", price: 23590, cat: "suits" },
  { img: "suit-brown", name: "Двойка", note: "Размер S", price: 25590, cat: "suits" },
  { img: "jacket-olive", name: "Вельветовый жакет", note: "Новинка дня", price: null, cat: "suits", isNew: true },
  { img: "jacket-beige", name: "Жакет приталенный", note: "Новинка дня", price: null, cat: "suits", isNew: true },
  { img: "sweater-pink", name: "Свитер", note: "Мягкая вязка", price: 18590, cat: "knit" },
  { img: "knit-set", name: "Трикотажный костюм", note: "Новинка дня", price: null, cat: "knit", isNew: true },
  { img: "zip-graphite", name: "Свитер на молнии", note: "Новинка дня", price: null, cat: "knit", isNew: true },
  { img: "jumper-lace", name: "Джемпер с кружевом", note: "Новинка дня", price: null, cat: "knit", isNew: true },
  { img: "top-halter", name: "Топ-американка", note: "Новинка дня", price: null, cat: "knit", isNew: true },
  { img: "dress-leather", name: "Платье мини", note: "Эффект кожи", price: 23590, cat: "dresses" },
  { img: "dress-black", name: "Трикотажное платье", note: "Новинка дня", price: null, cat: "dresses", isNew: true },
];
const WA = "https://wa.me/77779230119?text=";
const fmt = (n) => n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₸";

// ===== Loader: don't wait for every image, only for the first paint =====
const loader = document.getElementById("loader");
const hideLoader = () => loader && loader.classList.add("done");
setTimeout(hideLoader, 350);

// ===== Header on scroll =====
const header = document.getElementById("header");
let lastY = -1;
const onScroll = () => {
  const y = window.scrollY > 30;
  if (y !== lastY) header.classList.toggle("scrolled", y);
  lastY = y;
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Mobile menu =====
const burger = document.getElementById("burger");
const menu = document.getElementById("mobileMenu");
const setMenu = (open) => {
  burger.classList.toggle("open", open);
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// ===== Catalog =====
const grid = document.getElementById("catalogGrid");
grid.innerHTML = PRODUCTS.map((p) => {
  const msg = encodeURIComponent(`Здравствуйте! Интересует «${p.name}»${p.price ? ` за ${fmt(p.price)}` : ""} с сайта. Есть в наличии?`);
  return `
  <article class="card" data-cat="${p.cat}"${p.isNew ? " data-new" : ""}>
    <a class="card-media" href="${WA}${msg}" target="_blank" rel="noopener" aria-label="Заказать: ${p.name}">
      <img src="img/cat/${p.img}.webp" alt="${p.name} — DELIN" width="560" height="747" loading="lazy" decoding="async" />
      ${p.isNew ? '<span class="tag">New</span>' : ""}
      <span class="card-cta">Заказать в WhatsApp</span>
    </a>
    <div class="card-body">
      <h3>${p.name}</h3>
      <p class="card-note">${p.note}</p>
      <p class="price">${p.price ? fmt(p.price) : '<span>Цена в WhatsApp</span>'}</p>
    </div>
  </article>`;
}).join("");
grid.querySelectorAll("img").forEach((img) => {
  const done = () => img.classList.add("ready");
  img.complete ? done() : img.addEventListener("load", done, { once: true });
});

const chips = [...document.querySelectorAll(".chip")];
const cards = [...grid.children];
const applyFilter = (f) => {
  chips.forEach((c) => c.classList.toggle("active", c.dataset.filter === f));
  cards.forEach((card, i) => {
    const show = f === "all" || (f === "new" ? card.hasAttribute("data-new") : card.dataset.cat === f);
    card.hidden = !show;
    if (show) card.style.setProperty("--i", i % 8);
  });
  grid.classList.remove("anim");
  void grid.offsetWidth; // restart the fade-in
  grid.classList.add("anim");
};
chips.forEach((c) => c.addEventListener("click", () => applyFilter(c.dataset.filter)));
// Tiles in «Коллекции» open the catalog with a filter
document.querySelectorAll("[data-go]").forEach((t) => t.addEventListener("click", () => applyFilter(t.dataset.go)));

// ===== Lazy background photos (load just before they scroll into view) =====
const loadBg = (el) => {
  const src = el.dataset.img;
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    el.style.setProperty("--img", `url('${src}')`);
    el.classList.add("loaded");
  };
  img.src = src;
};
const lazy = [...document.querySelectorAll(".ph[data-img]")];
if ("IntersectionObserver" in window) {
  const bgIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      loadBg(e.target);
      bgIO.unobserve(e.target);
    }),
    { rootMargin: "600px 0px" }
  );
  lazy.forEach((el) => bgIO.observe(el));
} else lazy.forEach(loadBg);

// ===== Reveal on scroll (with stagger inside each group) =====
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
  }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  if (!el.style.getPropertyValue("--delay")) el.style.setProperty("--delay", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
  io.observe(el);
});

// ===== Parallax (desktop only, one rAF per frame) =====
const px = [...document.querySelectorAll(".parallax")];
if (!reduce && matchMedia("(min-width: 861px)").matches) {
  let ticking = false;
  const parallax = () => {
    const vh = window.innerHeight;
    px.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed)).toFixed(1)}px`;
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  parallax();
}

// ===== Count-up for stats =====
document.querySelectorAll("[data-count]").forEach((el) => {
  if (reduce) return;
  const target = +el.dataset.count;
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1600, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + "K";
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  obs.observe(el);
});

// ===== "Open now" status (Asia/Almaty). Mon 10–21, Tue–Sun 10–22 =====
(() => {
  const el = document.getElementById("openNow");
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Almaty" }));
  const day = now.getDay(); // 0 = Sun, 1 = Mon
  const h = now.getHours() + now.getMinutes() / 60;
  const close = day === 1 ? 21 : 22;
  const open = h >= 10 && h < close;
  el.textContent = open ? `Открыто до ${close}:00` : h < 10 ? "Сейчас закрыто · откроемся в 10:00" : "Сейчас закрыто · завтра с 10:00";
  el.style.setProperty("--c", open ? "#6aa86f" : "#c0694f");
})();

// ===== Map: 2GIS loads only when needed (keeps the page fast) =====
(() => {
  const box = document.getElementById("map");
  const cover = document.getElementById("mapCover");
  const opts = { pos: { lat: 51.11756, lon: 71.461996, zoom: 16 }, opt: { city: "astana" }, org: "70000001090243402" };
  const load = () => {
    if (box.querySelector("iframe")) return;
    const f = document.createElement("iframe");
    f.title = "DELIN на карте 2ГИС";
    f.loading = "lazy";
    f.src = "https://widgets.2gis.com/widget?type=firmsonmap&options=" + encodeURIComponent(JSON.stringify(opts));
    f.addEventListener("load", () => box.classList.add("map-ready"), { once: true });
    box.appendChild(f);
  };
  cover.addEventListener("click", load);
  const mio = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { mio.disconnect(); setTimeout(load, 300); }
  }, { rootMargin: "300px 0px" });
  mio.observe(box);
})();
