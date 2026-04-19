document.addEventListener("DOMContentLoaded", function () {
  const IDLE_DELAY = 7000;
  const TICK_RATE = 200;

  const charMap = {
    two: "2",
    free: "3",
    for: "4",
    to: "2",
    a: "4",
    e: "3",
    i: "1",
    o: "0",
    s: "5",
    b: "8",
    z: "2",
    g: "9",
  };

  const mapPattern = new RegExp(
    Object.keys(charMap)
      .sort((a, b) => b.length - a.length)
      .join("|"),
    "gi",
  );

  function findOpportunities(text) {
    const result = [];
    mapPattern.lastIndex = 0;
    let m;
    while ((m = mapPattern.exec(text)) !== null) {
      result.push({
        start: m.index,
        end: m.index + m[0].length,
        replacement: charMap[m[0].toLowerCase()],
      });
    }
    return result;
  }

  function shouldSkip(node) {
    let el = node.parentElement;
    while (el) {
      if (el.tagName === "BUTTON" || el.classList.contains("footnote"))
        return true;
      el = el.parentElement;
    }
    return false;
  }

  const UPDATE_DELAY = 300; // ms after last event before restoring

  let originals = null;
  let opportunities = [];
  let tickInterval = null;
  let idleTimer = null;
  let activityTimer = null;

  function storeOriginals() {
    originals = new Map();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() === "") continue;
      if (shouldSkip(node)) continue;
      originals.set(node, node.textContent);
    }
  }

  function buildOpportunities() {
    opportunities = [];
    for (const [node, text] of originals) {
      for (const opp of findOpportunities(text)) {
        opportunities.push({ node, ...opp });
      }
    }
  }

  function applyRandom() {
    if (opportunities.length === 0) {
      stopTicking();
      return;
    }
    const idx = Math.floor(Math.random() * opportunities.length);
    const { node, start, end, replacement } = opportunities[idx];

    node.textContent =
      node.textContent.slice(0, start) +
      replacement +
      node.textContent.slice(end);

    const delta = replacement.length - (end - start);
    opportunities.splice(idx, 1);
    for (const opp of opportunities) {
      if (opp.node === node && opp.start >= end) {
        opp.start += delta;
        opp.end += delta;
      }
    }
  }

  function startTicking() {
    if (tickInterval) return;
    if (!originals) storeOriginals();
    buildOpportunities();
    if (opportunities.length === 0) return;
    tickInterval = setInterval(applyRandom, TICK_RATE);
  }

  function stopTicking() {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  function onActivity() {
    stopTicking();
    clearTimeout(activityTimer);
    clearTimeout(idleTimer);
    activityTimer = setTimeout(function () {
      if (originals)
        for (const [node, text] of originals) node.textContent = text;
      idleTimer = setTimeout(startTicking, IDLE_DELAY);
    }, UPDATE_DELAY);
  }

  const scrollTarget = document.querySelector(".page-wrapper") || document;
  scrollTarget.addEventListener("scroll", onActivity, { passive: true });
  ["mousemove", "keydown", "click", "touchend"].forEach(function (evt) {
    document.addEventListener(evt, onActivity, { passive: true });
  });

  idleTimer = setTimeout(startTicking, IDLE_DELAY);

const header = document.querySelector("header");
  if (header && scrollTarget) {
    header.addEventListener("click", function () {
      scrollTarget.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll("figure img").forEach(function (img) {
    var wrap = document.createElement("div");
    wrap.className = "img-wrap";
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    var overlay = document.createElement("div");
    overlay.className = "img-overlay";
    wrap.appendChild(overlay);
  });
});
