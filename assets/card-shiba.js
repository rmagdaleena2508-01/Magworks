/* Card Shiba — a still pixel pet anchored in the name card.
   No cursor-follow, no wandering. It plays a short sequence on load and on
   click: look toward the avatar/name (left), turn, sit, and face the user.   */
(function () {
  "use strict";
  var pet = document.getElementById("cardPet");
  if (!pet) return;
  var BASE = "./assets/shiba/";
  var LOOK = "walk0";      // side pose, faces LEFT toward the avatar/name
  var TURN = "front_tongue";
  var SIT = "sit";
  var BLINK = "sit2";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  // preload
  [LOOK, TURN, SIT, BLINK, "front_a"].forEach(function (n) { var i = new Image(); i.src = BASE + n + ".png"; });

  var timers = [], idleTimer = 0;
  function clearAll() { timers.forEach(clearTimeout); timers = []; }
  function at(ms, name) { timers.push(setTimeout(function () { pet.src = BASE + name + ".png"; }, ms)); }
  function set(name) { pet.src = BASE + name + ".png"; }

  // look at avatar (left) -> turn -> sit facing the user
  function sequence() {
    clearAll();
    if (reduce) { set(SIT); return; }
    set(LOOK);            // looking at the image/name
    at(1000, TURN);       // turning
    at(1350, SIT);        // sits straight, looks at the user
    timers.push(setTimeout(idleLoop, 1800));
  }

  // gentle resting idle: occasional blink/look, stays put
  function idleLoop() {
    if (reduce) return;
    clearTimeout(idleTimer);
    var tick = function () {
      // small chance to blink (sit2) briefly, else stay on sit
      set(BLINK);
      timers.push(setTimeout(function () { set(SIT); }, 180));
      idleTimer = setTimeout(tick, 3000 + Math.random() * 3500);
    };
    idleTimer = setTimeout(tick, 2600 + Math.random() * 2500);
  }

  pet.addEventListener("click", function () {
    clearTimeout(idleTimer);
    sequence();
  });

  if (document.readyState === "complete") sequence();
  else addEventListener("load", sequence);
})();
