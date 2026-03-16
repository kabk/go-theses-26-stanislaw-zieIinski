// we make sure the JavaScript file loads after our HTML by using a function test if the HTML is loaded

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(function () {
  const letters2numbers = {
    a: "4",
    e: "3",
    i: "1",
    o: "0",
    s: "5",
    b: "8",
    z: "2",
    g: "9",
  };

  const anchors = document.querySelectorAll("a");

  anchors.forEach(function (anchor) {
    anchor.addEventListener("mouseover", function () {
      const originalText = anchor.textContent;

      // store original text
      if (!anchor.dataset.original) {
        anchor.dataset.original = originalText;
      }

      let chars = originalText.split("");
      let replaceableLetters = [];

      chars.forEach(function (char, index) {
        if (letters2numbers[char.toLowerCase()]) {
          replaceableLetters.push(index);
        }
      });

      // if nothing can be replaced, stop
      if (replaceableLetters.length === 0) {
        return;
      }

      const maxSwaps = Math.min(10, replaceableLetters.length);

      for (let i = 0; i < maxSwaps; i++) {
        const randomPos = Math.floor(Math.random() * replaceableLetters.length);
        const charIndex = replaceableLetters.splice(randomPos, 1)[0];

        const letter = chars[charIndex].toLowerCase();
        chars[charIndex] = letters2numbers[letter];
      }

      anchor.textContent = chars.join("");
    });

    anchor.addEventListener("mouseout", function () {
      if (anchor.dataset.original) {
        anchor.textContent = anchor.dataset.original;
      }
    });
  });
});
