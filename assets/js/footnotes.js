const FOOTNOTES = {
  1: "This is the footnote text.",
};

document.addEventListener("DOMContentLoaded", function () {
  // build hidden footnote elements after each sup
  document.querySelectorAll("sup[fn-index]").forEach(function (sup) {
    let id = sup.getAttribute("fn-index");
    if (!FOOTNOTES[id]) return;

    let p = document.createElement("p");
    p.id = "fn" + id;
    p.className = "footnote";
    p.innerHTML = FOOTNOTES[id];
    sup.insertAdjacentElement("afterend", p);
  });

  // toggle on click
  document.addEventListener("click", function (e) {
    let a = e.target.closest("sup[fn-index] a");
    if (!a) return;
    e.preventDefault();
    let id = a.closest("sup[fn-index]").getAttribute("fn-index");
    let el = document.getElementById("fn" + id);
    if (el) el.classList.toggle("visible");
  });
});
