// ============================================================================
// ============================== WIND IN GARDEN ==============================
// ============================================================================

var wind_s = null;
var wind_id = "gardenwind"
var wind_interval_min = 2;
var wind_interval_max = 7;
var wind_colors = ["#b3d9ff", "#99ccff", "#80bfff", "#66b3ff", "#4da6ff", 
                   "#3399ff", "#1a8cff", "#0080ff", "#0073e6", "#0066cc"];
var multi_wind_chance = 0.3;
var double_stroke_chance = 1;

// Authoring contract:
// - Wind container SVG has id "gardenwind"
// - To disable visual wind strokes but keep gust events, set
//     <svg id="gardenwind" data-wind-visual="off"> ... </svg>
//   Accepted disabling values: "off", "false", "0" (case-insensitive)
// - Visuals are also disabled when the user prefers reduced motion.

function wind_visuals_enabled() {
  try {
    var el = document.getElementById(wind_id);
    var attr = (el && el.getAttribute && el.getAttribute('data-wind-visual')) || 'on';
    var v = String(attr).toLowerCase();
    var disabledByAttr = (v === 'off' || v === 'false' || v === '0');
    var prefersReduced = false;
    try {
      prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) { /* noop */ }
    return !disabledByAttr && !prefersReduced;
  } catch (_) {
    return true;
  }
}

// This function calls itself every random second and makes a wind blow each time
function wind_loop(){
  var showVisual = wind_visuals_enabled();
  // Initialize Snap only when visuals are enabled
  if (wind_s == null && showVisual){
    wind_s = Snap("#" + wind_id);
    if (wind_s == null){
        console.log("wind_s is null!")
    }
  }
  // If we have a Snap instance, clear previous strokes regardless of toggle
  if (wind_s) {
    try { wind_s.clear(); } catch (_) { /* noop */ }
  }
  blow_a_wind();
  
  // call ourselve after random time
  var rand = wind_interval_min + Math.random() * (wind_interval_max - wind_interval_min);
  setTimeout(wind_loop, rand * 1000);
}

// blow a random wind, with a chance it can call itself to have more winds in a row
function blow_a_wind(){
  var w_cont = document.getElementById(wind_id).clientWidth;
  var h_cont = document.getElementById(wind_id).clientHeight;
  var x_r = 0.1 * w_cont + Math.random() * 0.7 * w_cont;
  var y_r = 0.15 * h_cont + Math.random() * 0.7 * h_cont;
  var speed = Math.random();
  var l_r = 30 + speed * 70;
  var c_r = 0.7 + speed;
  var showVisual = wind_visuals_enabled();
  
  // Dispatch a gust event with intensity mapped from speed (0..1); direction is right
  try {
    var gustIntensity = Math.max(0, Math.min(1, speed));
    var gustEvent;
    if (typeof CustomEvent === 'function') {
      gustEvent = new CustomEvent('garden:gust', { detail: { intensity: gustIntensity, direction: 'right' } });
    } else {
      gustEvent = document.createEvent('CustomEvent');
      gustEvent.initCustomEvent('garden:gust', false, false, { intensity: gustIntensity, direction: 'right' });
    }
    // Dispatch on both the wind element and window for broad compatibility
    var windEl = document.getElementById(wind_id);
    if (windEl) windEl.dispatchEvent(gustEvent);
    window.dispatchEvent(gustEvent);
  } catch (e) { /* silent */ }
  
  // Draw SVG strokes only if visuals are enabled and Snap surface exists
  if (showVisual && wind_s) {
    var svg_path = Snap.format("M {x} {y}, h {l_tail}, c {c1['dx1']} {c1['dy1']} {c1['dx2']} {c1['dy2']} {c1['dx']} {c1['dy']}, c {c2['dx1']} {c2['dy1']} {c2['dx2']} {c2['dy2']} {c2['dx']} {c2['dy']}", {
      x: x_r,
      y: y_r,
      l_tail: l_r,
      c1: {
        dx1: 10 * c_r,
        dy1: 0 * c_r,
        dx2: 13 * c_r,
        dy2: -9.2 * c_r,
        dx: 8.6 * c_r,
        dy: -13.6 * c_r,
      },
      c2: {
        dx1: -4 * c_r,
        dy1: -4.2 * c_r,
        dx2: -12.1 * c_r,
        dy2: -0.2 * c_r,
        dx: -8.6 * c_r,
        dy: 6.6 * c_r,
      }});
    var color = wind_colors[Math.floor(speed*wind_colors.length)]

    var p = wind_s.path(svg_path);
    var p_len = p.getTotalLength();
    p.attr({
      fill: "transparent",
      stroke: color,
      strokeWidth: 2,
      strokeDasharray: p_len,
      strokeDashoffset: p_len
    });

    p.animate({strokeDashoffset: -p_len}, 1500 - 200 * speed);

    // give a chance for double stroke
    var double_stroke = Math.random();
    if (double_stroke > 1-double_stroke_chance){
      var svg_path_d = Snap.format("M {x} {y}, h {l_tail}, c {c1['dx1']} {c1['dy1']} {c1['dx2']} {c1['dy2']} {c1['dx']} {c1['dy']}, c {c2['dx1']} {c2['dy1']} {c2['dx2']} {c2['dy2']} {c2['dx']} {c2['dy']}", {
        x: x_r + 20,
        y: y_r + 7,
        l_tail: l_r - 15,
        c1: {
          dx1: 10 * c_r * 0.7,
          dy1: -0 * c_r * 0.7,
          dx2: 13 * c_r * 0.7,
          dy2: 9.2 * c_r * 0.7,
          dx: 8.6 * c_r * 0.7,
          dy: 13.6 * c_r * 0.7,
        },
        c2: {
          dx1: -4 * c_r * 0.7,
          dy1: 4.2 * c_r * 0.7,
          dx2: -12.1 * c_r * 0.7,
          dy2: 0.2 * c_r * 0.7,
          dx: -8.6 * c_r * 0.7,
          dy: -6.6 * c_r * 0.7,
        }});

      var p_d = wind_s.path(svg_path_d);
      var p_len_d = p_d.getTotalLength();
      p_d.attr({
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
        strokeDasharray: p_len_d,
        strokeDashoffset: p_len_d
      });

      p_d.animate({strokeDashoffset: -p_len_d}, 1500 - 200 * speed);
    }
  }
  
  // give a chance for double (or triple or ...) wind
  var wind_again = Math.random();
  if (wind_again > 1-multi_wind_chance){
    setTimeout(blow_a_wind, 400 + Math.random() * 600);
  }
}