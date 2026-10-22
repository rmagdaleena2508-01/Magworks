/* Pixel-art Shiba desktop pet — oneko-inspired, vanilla JS.
   Uses the extracted sprite frames in assets/shiba/. Desktop (fine pointer) only.
   The overlay never blocks the page: pointer-events stays none; a "click" on the
   pet is detected by hit-testing the pointer against the pet's box.            */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (reduce || !fine) return;                    // no pet on touch / reduced-motion

  var BASE = "./assets/shiba/";
  var NAMES = ["front_a","front_tongue","front_happy","back","sit","sit2",
               "sleep","walk0","walk1","walk2","walk3","play"];
  var img = {}, loaded = 0;
  NAMES.forEach(function (n) {
    var im = new Image(); im.src = BASE + n + ".png";
    im.onload = function(){ loaded++; }; img[n] = im;
  });

  // sprite frame lists per state
  var WALK = ["walk0","walk1","walk2","walk3"];
  var el = document.createElement("img");
  el.alt = ""; el.setAttribute("aria-hidden", "true");
  el.decoding = "async";
  el.style.cssText =
    "position:fixed;left:0;top:0;height:60px;width:auto;z-index:60;" +
    "image-rendering:pixelated;pointer-events:none;will-change:transform;" +
    "transform:translate3d(0,0,0);filter:drop-shadow(0 4px 5px rgba(0,0,0,.28));" +
    "transition:none";
  el.src = BASE + "front_a.png";

  // ---- state ----
  var vw = innerWidth, vh = innerHeight;
  var W = 68, H = 60;                               // approx display box (set on load)
  var x = vw - 120, y = vh - 110;                   // start bottom-right
  var mx = x + W / 2, my = y + H / 2;               // cursor
  var facing = 1;                                   // 1 = sprite's native (faces left)
  var state = "idle", frame = 0, frameT = 0, stateT = 0, blinkT = 0;
  var lastMove = performance.now();
  var wanderTarget = null;
  var raf = 0, running = false;

  var STOP = 42;          // stop this close to cursor
  var RUNDIST = 280;      // beyond this, run
  var SIT_AFTER = 4000;   // ms idle -> sit
  var SLEEP_AFTER = 11000;// ms idle -> sleep
  var WANDER_AFTER = 6000;// ms idle -> maybe wander

  function setSprite(name) {
    if (el.getAttribute("src") !== BASE + name + ".png") el.src = BASE + name + ".png";
  }
  function place() {
    var sx = facing === 1 ? 1 : -1;
    el.style.transform = "translate3d(" + x + "px," + y + "px,0) scaleX(" + sx + ")";
  }

  function onMove(e) {
    mx = e.clientX; my = e.clientY; lastMove = performance.now(); wanderTarget = null;
  }
  function onResize() { vw = innerWidth; vh = innerHeight; }
  function onDown(e) {
    // hit-test the pet box; react without ever capturing the event
    var cx = e.clientX, cy = e.clientY;
    if (cx >= x && cx <= x + W && cy >= y && cy <= y + H) {
      state = "play"; stateT = 0; frame = 0;
    }
  }

  function clamp() {
    if (x < 2) x = 2; if (y < 2) y = 2;
    if (x > vw - W - 2) x = vw - W - 2;
    if (y > vh - H - 2) y = vh - H - 2;
  }

  function step(ts) {
    if (!running) return;
    var dt = Math.min(48, ts - (step._p || ts)); step._p = ts;
    frameT += dt; stateT += dt;

    var tx = wanderTarget ? wanderTarget.x : mx;
    var ty = wanderTarget ? wanderTarget.y : my;
    var dx = tx - (x + W / 2), dy = ty - (y + H / 2);
    var dist = Math.hypot(dx, dy);
    var idleFor = ts - lastMove;

    if (state === "play") {
      setSprite("play");
      if (stateT > 1100) { state = "idle"; stateT = 0; }
    } else if (dist > STOP && (wanderTarget || idleFor < 60000)) {
      // move toward target
      var run = dist > RUNDIST;
      state = run ? "run" : "walk";
      var sp = (run ? 3.1 : 1.7) * (dt / 16.67);
      x += (dx / dist) * sp; y += (dy / dist) * sp;
      if (Math.abs(dx) > 2) facing = dx < 0 ? 1 : -1;   // frames face left
      var fps = run ? 11 : 7, iv = 1000 / fps;
      if (frameT > iv) { frameT = 0; frame = (frame + 1) % WALK.length; }
      setSprite(WALK[frame]);
      if (wanderTarget && dist < STOP) wanderTarget = null;
    } else {
      // arrived / idle ladder: idle -> sit -> sleep, with blinks + maybe wander
      if (idleFor > SLEEP_AFTER) {
        state = "sleep"; setSprite("sleep");
      } else if (idleFor > SIT_AFTER) {
        state = "sit";
        if (stateT - blinkT > 2600) { blinkT = stateT; setSprite("sit2"); }
        else if (stateT - blinkT > 160) setSprite("sit");
      } else {
        state = "idle";
        // occasional blink / tongue
        if (stateT - blinkT > 3400) { blinkT = stateT; setSprite("front_happy"); }
        else if (stateT - blinkT > 2600) { setSprite("front_tongue"); }
        else if (stateT - blinkT > 160) setSprite("front_a");
      }
      // wander a little when idle but not asleep
      if (!wanderTarget && idleFor > WANDER_AFTER && idleFor < SLEEP_AFTER && Math.random() < 0.004) {
        wanderTarget = { x: 60 + Math.random() * (vw - 120), y: 60 + Math.random() * (vh - 120) };
      }
    }

    clamp(); place();
    raf = requestAnimationFrame(step);
  }

  function start() { if (!running) { running = true; step._p = 0; raf = requestAnimationFrame(step); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  function init() {
    document.body.appendChild(el);
    // size from the loaded sprite's aspect
    var probe = img.front_a;
    function sized() {
      if (probe.naturalWidth) { W = Math.round(60 * probe.naturalWidth / probe.naturalHeight); }
      clamp(); place();
    }
    if (probe.complete) sized(); else probe.onload = function(){ loaded++; sized(); };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else { step._p = 0; start(); }
    });
    start();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
