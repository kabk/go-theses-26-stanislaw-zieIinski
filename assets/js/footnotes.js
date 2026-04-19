document.addEventListener("DOMContentLoaded", function () {
  const pageWrapper = document.querySelector(".page-wrapper");

  const footnoteContainer = document.createElement("div");
  footnoteContainer.id = "footnote-container";
  document.body.appendChild(footnoteContainer);

  document.querySelectorAll("sup[fn-index]").forEach(function (sup) {
    const id = sup.getAttribute("fn-index");

    sup.setAttribute("aria-expanded", "false");
    sup.setAttribute("aria-controls", "fn" + id + "-panel");

    const tmpl = document.getElementById("fn" + id);
    if (!tmpl) return;

    const panel = document.createElement("div");
    panel.id = "fn" + id + "-panel";
    panel.className = "footnote";
    panel.setAttribute("role", "note");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("tabindex", "-1");

    const closeBtn = document.createElement("button");
    closeBtn.className = "footnote-close";
    closeBtn.setAttribute("aria-label", "Close footnote");
    closeBtn.textContent = "×";
    panel.appendChild(closeBtn);

    panel.appendChild(tmpl.content.cloneNode(true));
    footnoteContainer.appendChild(panel);
  });

  function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

  // Recalculate each panel's top so it aligns with its ref,
  // cascading downward when panels would overlap.
  const PANEL_GAP = 8;

  function positionPanels() {
    if (isMobile()) return;

    const sups = Array.from(document.querySelectorAll("sup[fn-index]")).sort(
      (a, b) => Number(a.getAttribute("fn-index")) - Number(b.getAttribute("fn-index")),
    );

    let nextMinTop = -Infinity;

    sups.forEach(function (sup) {
      const id = sup.getAttribute("fn-index");
      const panel = document.getElementById("fn" + id + "-panel");
      if (!panel) return;

      const desiredTop = sup.getBoundingClientRect().top;
      const top = Math.max(desiredTop, nextMinTop);
      panel.style.top = top + "px";

      nextMinTop = top + panel.offsetHeight + PANEL_GAP;
    });
  }

  // ── Mobile: click to open/close a single popup ──────────────────────────

  function closePanel(panel) {
    panel.classList.remove("visible");
    panel.setAttribute("aria-hidden", "true");
    const id = panel.id.replace("fn", "").replace("-panel", "");
    const sup = document.querySelector('sup[fn-index="' + id + '"]');
    if (sup) sup.setAttribute("aria-expanded", "false");
    if (pageWrapper && !document.querySelector(".footnote.visible")) {
      pageWrapper.classList.remove("footnote-open");
    }
  }

  function openPanel(panel, id) {
    document.querySelectorAll(".footnote.visible").forEach(closePanel);
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
    const sup = document.querySelector('sup[fn-index="' + id + '"]');
    if (sup) sup.setAttribute("aria-expanded", "true");
    if (pageWrapper) pageWrapper.classList.add("footnote-open");
    panel.focus();
  }

  function toggle(id) {
    const panel = document.getElementById("fn" + id + "-panel");
    if (!panel) return;
    if (panel.classList.contains("visible")) {
      closePanel(panel);
    } else {
      openPanel(panel, id);
    }
  }

  document.addEventListener("click", function (e) {
    const closeBtn = e.target.closest(".footnote-close");
    if (closeBtn) {
      const panel = closeBtn.closest(".footnote");
      if (panel) closePanel(panel);
      return;
    }

    if (!isMobile()) return;

    const sup = e.target.closest("sup[fn-index]");
    if (!sup) return;
    toggle(sup.getAttribute("fn-index"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const sup = e.target.closest("sup[fn-index]");
    if (!sup) return;
    e.preventDefault();
    if (isMobile()) toggle(sup.getAttribute("fn-index"));
  });

  // ── Desktop: reposition on scroll and resize ────────────────────────────

  if (pageWrapper) {
    pageWrapper.addEventListener("scroll", positionPanels, { passive: true });
  }
  window.addEventListener("resize", positionPanels, { passive: true });
  requestAnimationFrame(positionPanels);

  // ── Mobile: tap outside closes the open panel ───────────────────────────

  var touchStartX, touchStartY;
  document.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    function (e) {
      if (!document.querySelector(".footnote.visible")) return;
      var dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dx > 10 || dy > 10) return;
      if (e.target.closest(".footnote") || e.target.closest("sup[fn-index]"))
        return;
      document.querySelectorAll(".footnote.visible").forEach(closePanel);
    },
    { passive: true },
  );
});
