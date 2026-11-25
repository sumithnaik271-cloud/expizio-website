/**
 * EXPIXIO site behaviour.
 * 1) Set STUDIO.whatsapp to your number with country code, digits only (example: "919876543210").
 * 2) Optionally set STUDIO.phone to show a call number in the contact section.
 * Until a WhatsApp number is set, the form copies the enquiry instead of pretending it was sent.
 */
const STUDIO = { whatsapp: "919591657832", phone: "" };

const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const header = $("[data-header]");
const toggle = $("[data-nav-toggle]");
const nav = $("[data-nav]");
const form = $("[data-enquiry]");
const status = $("[data-status]");
const waNumber = STUDIO.whatsapp.replace(/\D/g, "");

function setNav(open) {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  toggle.textContent = open ? "Close" : "Menu";
  root.classList.toggle("nav-open", open);
}
toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const waLink = (text) => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
if (waNumber) {
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink("Hi EXPIXIO, I'd like to talk about marketing for my business.");
    a.target = "_blank";
    a.rel = "noopener";
  });
}
if (STUDIO.phone) {
  const box = $("[data-phone]");
  const a = box.querySelector("a");
  a.textContent = `Or call ${STUDIO.phone}`;
  a.href = `tel:${STUDIO.phone.replace(/\s+/g, "")}`;
  box.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.elements.company_website.value) return;
  const f = form.elements;
  const brief = [
    "Hi EXPIXIO, I'd like to start a project.",
    `Name: ${f.name.value.trim()}`,
    `Business: ${f.business.value.trim()}`,
    `Phone: ${f.phone.value.trim() || "-"}`,
    `Service: ${f.service.value}`,
    "",
    f.message.value.trim(),
  ].join("\n");

  let copied = true;
  try { await navigator.clipboard.writeText(brief); } catch { copied = false; }

  form.hidden = true;
  status.hidden = false;
  status.querySelector("[data-status-title]").textContent = waNumber ? "Opening WhatsApp" : "Enquiry copied, not yet sent";
  status.querySelector("[data-status-copy]").textContent = waNumber
    ? "Your message is ready in WhatsApp. If it did not open, copy the text below and send it to us."
    : (copied ? "Your enquiry is copied to your clipboard. " : "") + "WhatsApp is not connected on this site yet, so nothing was sent. Set STUDIO.whatsapp in main.js to turn this on.";
  status.querySelector("[data-status-brief]").textContent = brief;
  if (waNumber) window.open(waLink(brief), "_blank", "noopener");
});

status.querySelector("[data-reset]").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  status.hidden = true;
  form.elements.name.focus();
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

// Reveal elements as they scroll into view, staggering siblings slightly.
const reveals = document.querySelectorAll(".reveal, .reveal-lines");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const sibs = [...en.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
      en.target.style.setProperty("--d", `${Math.min(sibs.indexOf(en.target), 6) * 0.07}s`);
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

// Showreel: stays hidden until showreel.mp4 exists and can play.
const reel = $("[data-reel]");
if (reel) {
  const video = reel.querySelector("video");
  const show = () => reel.classList.add("is-ready");
  if (video.readyState >= 2) show();
  else video.addEventListener("loadeddata", show, { once: true });
}

// Highlight the nav link for the section currently in view.
const links = [...nav.querySelectorAll('a[href^="#"]:not(.nav-cta)')];
// The hero is observed too, so scrolling back to the top clears the highlight.
const sections = ["#top", "#results", "#faq", "#contact", ...links.map((a) => a.getAttribute("href"))].map((s) => document.querySelector(s)).filter(Boolean);
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));
}
