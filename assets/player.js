/* Floating lofi music player — glass, collapsible, draggable with corner-snap.
   Self-contained: injects its own styles + DOM and wires everything.
   Ported in spirit from VengeanceUI's music player, rebuilt in vanilla JS.
   Audio: a Pixabay "Worship" instrumental (Pixabay Content License — free for
   use, no attribution required). Add to any page with:
     <script src="./assets/player.js" defer></script>  */
(function () {
  if (document.getElementById('mplayer')) return;           // never inject twice
  var AUDIO = './assets/lofi.mp3';
  var ART   = './assets/player-art.webp';
  var TITLE = 'Worship Lofi';
  var SUB   = 'study · prayer · chill';

  /* ---------------- styles ---------------- */
  var css = [
    '@keyframes mp-eq{0%,100%{transform:scaleY(.28)}50%{transform:scaleY(1)}}',
    '.mplayer{position:fixed;left:18px;bottom:18px;z-index:96;width:min(322px,calc(100vw - 36px));',
      'transition:width .55s cubic-bezier(.5,1.25,.4,1);user-select:none;-webkit-user-select:none;touch-action:none}',
    '.mplayer[data-collapsed="true"]{width:150px}',
    '.mplayer.dragging .mp-bar{cursor:grabbing;box-shadow:0 22px 48px -16px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.08)}',
    '.mp-bar{position:relative;display:flex;align-items:center;gap:11px;height:64px;cursor:grab;padding-left:56px;padding-right:14px;',
      'border-radius:15px;overflow:hidden;border:1px solid var(--border-2);background:color-mix(in srgb,var(--card) 68%,transparent);',
      '-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);',
      'box-shadow:0 16px 36px -16px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.06)}',
    '.mp-art{position:absolute;left:-11px;top:50%;transform:translateY(-50%);z-index:2;width:54px;height:54px;border-radius:13px;',
      'object-fit:cover;border:1px solid var(--border-2);box-shadow:0 7px 18px rgba(0,0,0,.45);background:var(--card-2);',
      'pointer-events:none;-webkit-user-drag:none;user-select:none;-webkit-user-select:none}',
    '.mp-eq{display:flex;align-items:flex-end;gap:3px;height:20px;flex:none}',
    '.mp-eq span{width:3px;height:100%;border-radius:3px;background:var(--accent);transform-origin:bottom;transform:scaleY(.28)}',
    '.mplayer.playing .mp-eq span{animation:mp-eq var(--d) ease-in-out infinite}',
    '.mp-eq span:nth-child(1){--d:.9s}.mp-eq span:nth-child(2){--d:1.08s}.mp-eq span:nth-child(3){--d:1.26s}.mp-eq span:nth-child(4){--d:1.44s}',
    '.mp-info{min-width:0;flex:1;transition:opacity .3s ease;transition-delay:.32s}',
    '.mp-title{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mp-sub{font-family:var(--mono);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}',
    '.mp-play{width:36px;height:36px;flex:none;display:grid;place-items:center;border-radius:50%;color:var(--fg);transition:background .2s,transform .2s;border:none;background:none;cursor:pointer;padding:0}',
    '.mp-play:hover{background:var(--card)}.mp-play:active{transform:scale(.92)}',
    '.mp-play svg{width:18px;height:18px}',
    '.mp-prog{position:absolute;left:0;right:0;bottom:0;height:11px;display:flex;align-items:flex-end;cursor:pointer;transition:opacity .25s}',
    '.mp-prog i{display:block;height:3px;width:100%;background:var(--border)}',
    '.mp-prog b{position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--accent)}',
    '.mp-prog:hover i{height:4px}.mp-prog:hover b{height:4px}',
    '.mp-toggle{position:absolute;right:-9px;top:-9px;z-index:3;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;',
      'border:1px solid var(--border-2);background:color-mix(in srgb,var(--card) 88%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
      'color:var(--muted);transition:color .2s,transform .2s;cursor:pointer;padding:0}',
    '.mp-toggle:hover{color:var(--fg);transform:scale(1.08)}.mp-toggle svg{width:13px;height:13px}',
    '.mp-ic-plus{display:none}',
    '.mplayer[data-collapsed="true"] .mp-ic-min{display:none}',
    '.mplayer[data-collapsed="true"] .mp-ic-plus{display:block}',
    '.mplayer[data-collapsed="true"] .mp-info{opacity:0;pointer-events:none;transition-delay:0s}',
    '.mplayer[data-collapsed="true"] .mp-prog{opacity:0;pointer-events:none}',
    '@media(prefers-reduced-motion:reduce){.mplayer.playing .mp-eq span{animation:none}}',
    '@media(max-width:560px){.mplayer{left:12px;bottom:12px}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------------- DOM ---------------- */
  var PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
  var p = document.createElement('div');
  p.className = 'mplayer'; p.id = 'mplayer';
  p.setAttribute('data-collapsed', 'false'); p.setAttribute('aria-label', 'Lofi music player');
  p.innerHTML =
    '<button class="mp-toggle" id="mpToggle" aria-label="Collapse player" aria-expanded="true">' +
      '<svg class="mp-ic-min" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>' +
      '<svg class="mp-ic-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
    '</button>' +
    '<div class="mp-bar">' +
      '<img class="mp-art" src="' + ART + '" alt="" width="54" height="54" draggable="false" />' +
      '<div class="mp-eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>' +
      '<div class="mp-info"><div class="mp-title">' + TITLE + '</div><div class="mp-sub">' + SUB + '</div></div>' +
      '<button class="mp-play" id="mpPlay" aria-label="Play">' + PLAY + '</button>' +
      '<div class="mp-prog" id="mpProg" role="slider" aria-label="Seek" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i><b id="mpFill"></b></div>' +
    '</div>' +
    '<audio id="mpAudio" preload="metadata" loop src="' + AUDIO + '"></audio>';
  document.body.appendChild(p);

  var a = p.querySelector('#mpAudio'), playBtn = p.querySelector('#mpPlay'),
      toggle = p.querySelector('#mpToggle'), prog = p.querySelector('#mpProg'), fill = p.querySelector('#mpFill');

  /* ---------------- transport ---------------- */
  function setPlaying(on) { p.classList.toggle('playing', on); playBtn.innerHTML = on ? PAUSE : PLAY; playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play'); }
  playBtn.addEventListener('click', function () { a.paused ? a.play().catch(function () {}) : a.pause(); });
  a.addEventListener('play', function () { setPlaying(true); });
  a.addEventListener('pause', function () { setPlaying(false); });
  a.addEventListener('timeupdate', function () { if (a.duration) { var r = a.currentTime / a.duration; fill.style.width = (r * 100) + '%'; prog.setAttribute('aria-valuenow', Math.round(r * 100)); } });
  function seekAt(clientX) { if (!a.duration) return; var rect = prog.getBoundingClientRect(); a.currentTime = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * a.duration; }
  prog.addEventListener('click', function (e) { seekAt(e.clientX); });
  prog.addEventListener('keydown', function (e) {
    if (!a.duration) return;
    if (e.key === 'ArrowRight') { a.currentTime = Math.min(a.duration, a.currentTime + 10); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { a.currentTime = Math.max(0, a.currentTime - 10); e.preventDefault(); }
  });
  toggle.addEventListener('click', function () {
    var c = p.getAttribute('data-collapsed') === 'true';
    p.setAttribute('data-collapsed', String(!c));
    toggle.setAttribute('aria-expanded', String(c));
    toggle.setAttribute('aria-label', c ? 'Collapse player' : 'Expand player');
  });
  if (matchMedia('(max-width:560px)').matches) { p.setAttribute('data-collapsed', 'true'); toggle.setAttribute('aria-expanded', 'false'); }

  /* ---------------- drag anywhere + snap to nearest corner ---------------- */
  var M = 18;
  var SNAP = 'left .42s cubic-bezier(.4,1.15,.4,1),top .42s cubic-bezier(.4,1.15,.4,1),width .55s cubic-bezier(.5,1.25,.4,1)';
  var corner = (function () { try { return localStorage.getItem('mp-corner') || 'bl'; } catch (e) { return 'bl'; } })();
  function curW() { return p.getAttribute('data-collapsed') === 'true' ? 150 : Math.min(322, innerWidth - 36); }
  function cornerPos(c) {
    var w = curW(), h = p.offsetHeight || 64;
    return { left: c.indexOf('l') >= 0 ? M : innerWidth - w - M, top: c.indexOf('t') >= 0 ? M : innerHeight - h - M };
  }
  function place(c, animate) {
    corner = c; try { localStorage.setItem('mp-corner', c); } catch (e) {}
    var pos = cornerPos(c);
    p.style.transition = animate ? SNAP : 'none';
    p.style.right = 'auto'; p.style.bottom = 'auto';
    p.style.left = pos.left + 'px'; p.style.top = pos.top + 'px';
    if (!animate) requestAnimationFrame(function () { p.style.transition = ''; });
  }
  place(corner, false);

  var dragging = false, moved = false, sx = 0, sy = 0, ol = 0, ot = 0, pid = null;
  p.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('.mp-play,.mp-toggle,.mp-prog')) return;      // let controls work
    var r = p.getBoundingClientRect();
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY; ol = r.left; ot = r.top; pid = e.pointerId;
    p.style.transition = 'none'; p.style.right = 'auto'; p.style.bottom = 'auto'; p.style.left = ol + 'px'; p.style.top = ot + 'px';
    p.classList.add('dragging'); try { p.setPointerCapture(pid); } catch (e2) {}
  });
  addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    var w = curW(), h = p.offsetHeight || 64;
    p.style.left = Math.min(Math.max(ol + dx, 4), innerWidth - w - 4) + 'px';
    p.style.top  = Math.min(Math.max(ot + dy, 4), innerHeight - h - 4) + 'px';
  }, { passive: true });
  function up() {
    if (!dragging) return; dragging = false; p.classList.remove('dragging');
    try { p.releasePointerCapture(pid); } catch (e) {}
    if (!moved) return;
    var r = p.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    place((cy < innerHeight / 2 ? 't' : 'b') + (cx < innerWidth / 2 ? 'l' : 'r'), true);   // nearest corner
  }
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  p.addEventListener('dragstart', function (e) { e.preventDefault(); });
  toggle.addEventListener('click', function () { requestAnimationFrame(function () { place(corner, true); }); });  // re-pin on collapse
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { place(corner, false); }, 120); }, { passive: true });
})();
