document.addEventListener("DOMContentLoaded", function () {
  const pageWrapper = document.querySelector(".page-wrapper");

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

  function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

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
    if (isMobile() && pageWrapper) {
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

  function toggle(id) {
    const panel = document.getElementById("fn" + id + "-panel");
    if (!panel) return;
    if (panel.classList.contains("visible")) {
      closePanel(panel);
    } else {
      openPanel(panel, id);
    }
  }

  // Click handler
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

  // Keyboard handler
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const sup = e.target.closest("sup[fn-index]");
    if (!sup) return;
    e.preventDefault();
    toggle(sup.getAttribute("fn-index"));
  });

  // Close all panels when crossing the mobile/desktop breakpoint
  const mq = window.matchMedia("(max-width: 800px)");
  mq.addEventListener("change", function () {
    document.querySelectorAll(".footnote.visible").forEach(closePanel);
  });

  // Mobile: tap outside closes
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
