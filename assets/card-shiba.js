/* Card Shiba — an animated pixel pet that lives in one spot inside the name card.
   It does NOT roam or follow the cursor. It bobs gently in place (CSS) and keeps
   "looking around" by cycling through the sheet's sitting/front frames, so the
   flat PNGs feel alive instead of frozen. Each click shows a different pose.     */
(function () {
  "use strict";
  var pet = document.getElementById("cardPet");
  if (!pet) return;
  var BASE = "./assets/shiba/";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  // front-facing "looking at you" frames, cycled for a lively idle
  var IDLE = ["16", "00", "17", "38", "16", "02"];
  // the fuller variety shown on click
  var POSES = ["16","17","00","01","02","38","39","29","37","35","27","36","33","31","25","03","24","18","04","08"];
  POSES.concat(IDLE).forEach(function (n) { var i = new Image(); i.src = BASE + n + ".png"; });

  function set(n) { pet.src = BASE + n + ".png"; }
  set("16");                       // on load: sit up, look at the user
  pet.classList.add("petbob");     // gentle in-place bob (CSS)

  // ---- lightweight idle animation loop (time-based, no per-frame React work) ----
  var i = 0, acc = 0, last = 0, hold = 0, paused = false, mode = "idle";
  var IDLE_MS = 1600;              // ~0.6 fps look-around; the bob carries the motion
  function tick(ts) {
    if (!paused) {
      if (!last) last = ts;
      acc += ts - last; last = ts;
      if (mode === "idle" && acc > IDLE_MS) {
        acc = 0; i = (i + 1) % IDLE.length; set(IDLE[i]);
      } else if (mode === "pose") {
        hold -= 0; // clicked pose just holds until the next click or timeout
      }
    } else { last = 0; }
    requestAnimationFrame(tick);
  }
  if (!reduce) requestAnimationFrame(tick);

  // pause the loop when the tab is hidden (save CPU, avoid drift)
  document.addEventListener("visibilitychange", function () { paused = document.hidden; });

  // each click: a different pose from the sheet (never the same twice running),
  // then drift back to the look-around idle after a few seconds
  var backT = 0, lastPose = "16";
  pet.addEventListener("click", function () {
    mode = "pose"; acc = 0;
    var n = lastPose;
    while (n === lastPose && POSES.length > 1) n = POSES[(Math.random() * POSES.length) | 0];
    lastPose = n; set(n);
    clearTimeout(backT);
    backT = setTimeout(function () { mode = "idle"; i = 0; set("16"); }, 4000);
  });
})();
