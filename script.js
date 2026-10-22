const root = document.documentElement;
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];


// =================================
// DARK / LIGHT MODE
// =================================
function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
}
$("#themeBtn").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (document.startViewTransition) document.startViewTransition(() => setTheme(next));
    else setTheme(next);
});


// =================================
// ACCENT COLOUR PICKER
// =================================
const swatches = $$(".swatches button");
function setAccent(a) {
    root.dataset.accent = a;
    try { localStorage.setItem("accent", a); } catch (e) {}
    swatches.forEach(b => b.classList.toggle("on", b.dataset.accent === a));
}
swatches.forEach(b => b.addEventListener("click", () => setAccent(b.dataset.accent)));
setAccent(root.dataset.accent || "purple");


// =================================
// HERO TITLE: WORDS RISE IN (MASK REVEAL)
// =================================
let wordCount = 0;
function splitWords(node) {
    [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
            const parts = n.textContent.split(/\s+/).filter(Boolean);
            if (!parts.length) return;
            const f = document.createDocumentFragment();
            parts.forEach(word => {
                const wm = document.createElement("span");
                wm.className = "wm";
                const w = document.createElement("span");
                w.className = "w";
                w.textContent = word;
                w.style.setProperty("--i", wordCount++);
                wm.append(w);
                f.append(wm, " ");
            });
            n.replaceWith(f);
        } else if (n.nodeType === 1 && n.tagName !== "BR") splitWords(n);
    });
}
splitWords($(".hero h1"));
window.addEventListener("load", () => {
    setTimeout(() => $(".hero-content").classList.add("show"), 150);
});


// =================================
// REVEAL DESIGNS WHEN SCROLLING
// =================================

const designs = document.querySelectorAll(".design-card");

const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.08
    }
);


designs.forEach((design, index) => {

    // Small delay between cards
    design.style.setProperty("--d", `${index * 0.05}s`);

    revealObserver.observe(design);

});

$("#designCount").textContent = designs.length;


// =================================
// NAVBAR ON SCROLL + PROGRESS + BACK TO TOP
// =================================

const navbar = document.querySelector(".navbar");
const toTop = $("#toTop");

window.addEventListener("scroll", () => {

    navbar.classList.toggle("scrolled", window.scrollY > 50);

    navbar.style.setProperty("--p", root.scrollTop / (root.scrollHeight - root.clientHeight));

    toTop.classList.toggle("show", window.scrollY > 700);

}, { passive: true });

toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));


// =================================
// GALLERY VIEW: MASONRY / GRID
// =================================
const gallery = $(".gallery");
const viewBtns = $$(".gallery-tools button");
function setView(v) {
    gallery.classList.toggle("grid", v === "grid");
    viewBtns.forEach(b => b.classList.toggle("active", b.dataset.view === v));
    try { localStorage.setItem("view", v); } catch (e) {}
}
viewBtns.forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
try { setView(localStorage.getItem("view") || "masonry"); } catch (e) {}


// =================================
// MOUSE 3D: HERO STACK, SHAPES PARALLAX, CARD TILT, ABOUT CARD
// =================================
if (fine) {
    const hero = $(".hero"), stack = $(".stack");
    const layers = $$("[data-depth]");
    hero.addEventListener("mousemove", e => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        stack.style.setProperty("--tx", py * -14 + "deg");
        stack.style.setProperty("--ty", px * 34 + "deg");
        layers.forEach(l => l.style.translate = `${px * l.dataset.depth}px ${py * l.dataset.depth}px`);
    });
    hero.addEventListener("mouseleave", () => {
        stack.style.setProperty("--tx", "0deg");
        stack.style.setProperty("--ty", "0deg");
        layers.forEach(l => l.style.translate = "");
    });

    designs.forEach(card => {
        card.addEventListener("mousemove", e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 12}deg) translateZ(10px)`;
            card.style.setProperty("--gx", px * 100 + "%");
            card.style.setProperty("--gy", py * 100 + "%");
        });
        card.addEventListener("mouseleave", () => card.style.transform = "");
    });

    const about = $(".about-content");
    about.addEventListener("mousemove", e => {
        const r = about.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        about.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg)`;
    });
    about.addEventListener("mouseleave", () => about.style.transform = "");
}


// =================================
// LIGHTBOX VIEWER (click, arrows, keys, swipe, zoom, download)
// =================================
const cards = [...designs];
const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCount = $("#lbCount");
const lbOpen = $("#lbOpen"), lbDl = $("#lbDl");
let cur = 0;

function show(dir) {
    const src = cards[cur].getAttribute("href");
    lbImg.classList.remove("flip-next", "flip-prev", "zoom");
    void lbImg.offsetWidth;
    lbImg.src = src;
    lbImg.alt = cards[cur].querySelector("img").alt;
    if (dir) lbImg.classList.add(dir > 0 ? "flip-next" : "flip-prev");
    lbCount.textContent = String(cur + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
    lbOpen.href = src;
    lbDl.href = src;
    lbDl.setAttribute("download", src.split("/").pop());
}
function openLb(i) {
    cur = i; show(0);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-lock");
}
function closeLb() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-lock");
}
function step(d) { cur = (cur + d + cards.length) % cards.length; show(d); }

cards.forEach((c, i) => c.addEventListener("click", e => {
    // Ctrl / Cmd / middle click still opens the original image in a new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openLb(i);
}));
$(".lb-close").addEventListener("click", closeLb);
$(".lb-prev").addEventListener("click", () => step(-1));
$(".lb-next").addEventListener("click", () => step(1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
lbImg.addEventListener("click", e => {
    lbImg.style.transformOrigin = (e.offsetX / lbImg.clientWidth * 100) + "% " + (e.offsetY / lbImg.clientHeight * 100) + "%";
    lbImg.classList.toggle("zoom");
});
addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
});
let sx = 0;
lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 55) step(dx < 0 ? 1 : -1);
});
