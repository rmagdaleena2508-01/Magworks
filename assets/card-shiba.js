/* Card Shiba — a still pixel pet anchored in the name card.
   No cursor-follow, no wandering.
   - On load it greets: looks at the avatar/name (left), turns, sits facing you.
   - Each click shows a DIFFERENT pose from the character sheet.                */
(function () {
  "use strict";
  var pet = document.getElementById("cardPet");
  if (!pet) return;
  var BASE = "./assets/shiba/";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  var LOOK = "08";   // side pose, faces LEFT toward the avatar/name
  var TURN = "01";   // turning (tongue out)
  var SIT  = "16";   // front sit, faces the user  (resting pose)

  // poses cycled on click — the variety from the sheet
  var POSES = ["16","17","00","01","02","38","39","29","37","35","27","36","33","31","25","03","24","18","04","08"];
  var preload = POSES.concat([LOOK, TURN, SIT]);
  preload.forEach(function (n) { var i = new Image(); i.src = BASE + n + ".png"; });

  var timers = [], idleTimer = 0, last = SIT, clicked = false;
  function clearAll() { timers.forEach(clearTimeout); timers = []; }
  function set(n) { last = n; pet.src = BASE + n + ".png"; }
  function at(ms, n) { timers.push(setTimeout(function () { set(n); }, ms)); }

  // greet: look at avatar -> turn -> sit facing user
  function greet() {
    clearAll();
    if (reduce) { set(SIT); return; }
    set(LOOK);
    at(1000, TURN);
    at(1350, SIT);
    timers.push(setTimeout(idleLoop, 1800));
  }

  // soft resting blink while sitting (only before the first click)
  function idleLoop() {
    if (reduce || clicked) return;
    clearTimeout(idleTimer);
    var tick = function () {
      if (clicked) return;
      set("17"); // quick look
      timers.push(setTimeout(function () { if (!clicked) set(SIT); }, 190));
      idleTimer = setTimeout(tick, 3000 + Math.random() * 3500);
    };
    idleTimer = setTimeout(tick, 2600 + Math.random() * 2500);
  }

  // each click: a new random pose, never the same twice in a row
  pet.addEventListener("click", function () {
    clicked = true; clearAll(); clearTimeout(idleTimer);
    var n = last;
    while (n === last && POSES.length > 1) n = POSES[(Math.random() * POSES.length) | 0];
    set(n);
  });

  if (document.readyState === "complete") greet();
  else addEventListener("load", greet);
})();
