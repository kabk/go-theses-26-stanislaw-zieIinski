document.addEventListener("DOMContentLoaded", function () {
  const pageWrapper = document.querySelector(".page-wrapper");

  // Build a footnote panel for every <sup fn-index="N"> in the document.
  // The panel's content comes from the matching <template id="fnN">.
  // If the template has data-see="M", a cross-reference line is appended.
  // Each panel is inserted into its own <section> or <header> so that
  // position:absolute placement is relative to that container.
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
    panel.setAttribute("data-index", id);

    const closeBtn = document.createElement("button");
    closeBtn.className = "footnote-close";
    closeBtn.setAttribute("aria-label", "Close footnote");
    closeBtn.textContent = "×";
    panel.appendChild(closeBtn);

    const clone = tmpl.content.cloneNode(true);
    const firstP = clone.querySelector("p");
    if (firstP) firstP.prepend(id + ". ");
    panel.appendChild(clone);

    const seeRef = tmpl.getAttribute("data-see");
    if (seeRef) {
      const seeSpan = document.createElement("span");
      seeSpan.className = "footnote-text-data-see";
      seeSpan.textContent = "(See footnote [" + seeRef + "])";
      panel.appendChild(seeSpan);
    }

    const section = sup.closest("section") || sup.closest("header");
    (section || document.body).appendChild(panel);
  });

  // Returns true when the viewport is at or below the mobile breakpoint.
  function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

  // Hides a panel and updates the aria state of its reference <sup>.
  // Removes footnote-open from the page wrapper once no panels remain visible.
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

  // Shows a panel. Closes any other open panel first.
  // On desktop: positions the panel next to its <sup> reference by calculating
  // the offset between the sup and the top of the containing section.
  // On mobile: slides the panel up from the bottom as a fixed overlay.
  function openPanel(panel, id) {
    document.querySelectorAll(".footnote.visible").forEach(closePanel);
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
    const sup = document.querySelector('sup[fn-index="' + id + '"]');
    if (sup) sup.setAttribute("aria-expanded", "true");
    if (isMobile() && pageWrapper) {
      panel.style.top = "";
      pageWrapper.classList.add("footnote-open");
    } else {
      const section = panel.parentElement;
      if (section && sup) {
        const supRect = sup.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        panel.style.top = supRect.top - sectionRect.top + "px";
      }
    }
    panel.focus();
  }

  // Toggles a panel open or closed by footnote index.
  function toggle(id) {
    const panel = document.getElementById("fn" + id + "-panel");
    if (!panel) return;
    if (panel.classList.contains("visible")) {
      closePanel(panel);
    } else {
      openPanel(panel, id);
    }
  }

  // Click: open/close on <sup>, close on the × button, close on outside click.
  document.addEventListener("click", function (e) {
    const closeBtn = e.target.closest(".footnote-close");
    if (closeBtn) {
      const panel = closeBtn.closest(".footnote");
      if (panel) closePanel(panel);
      return;
    }

    const sup = e.target.closest("sup[fn-index]");
    if (sup) {
      toggle(sup.getAttribute("fn-index"));
      return;
    }

    if (!e.target.closest(".footnote")) {
      document.querySelectorAll(".footnote.visible").forEach(closePanel);
    }
  });

  // Keyboard: Enter or Space on a focused <sup> toggles its panel.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const sup = e.target.closest("sup[fn-index]");
    if (!sup) return;
    e.preventDefault();
    toggle(sup.getAttribute("fn-index"));
  });

  // Close all open panels when the viewport crosses the mobile/desktop breakpoint.
  const mq = window.matchMedia("(max-width: 800px)");
  mq.addEventListener("change", function () {
    document.querySelectorAll(".footnote.visible").forEach(closePanel);
  });

  // Mobile: a tap outside the panel or its <sup> closes the panel.
  // Touch start/end are compared to filter out swipes (dx or dy > 10px).
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
