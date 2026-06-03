const GA_ID = document.documentElement.getAttribute("ga-id");
window.ga = window.ga || function() { if (!GA_ID) return; (ga.q = ga.q || []).push(arguments); };
ga.l = + new Date();
ga("create", GA_ID, { 'storage': 'none', 'storeGac': false, 'anonymizeIp': true, 'allowAdFeatures': false });
ga("set", "transport", "beacon");
var timeout = setTimeout(onload = function() { clearTimeout(timeout); ga("send", "pageview"); }, 1000);

let r = 255, g = 0, b = 0;

let m = location.hash.match(/^#([0-9a-f]{6})$/i);
if (m) {
    r = eps + (1-2*eps)*parseInt(m[1].substr(0,2),16);
    g = eps + (1-2*eps)*parseInt(m[1].substr(2,2),16);
    b = eps + (1-2*eps)*parseInt(m[1].substr(4,2),16);
}

// Workers disabled for local file compatibility – using synchronous rendering
function update_canvas(id, image) {
    let canvas = document.getElementById(id);
    if (!canvas) { console.warn('Canvas not found:', id); return; }
    let ctx = canvas.getContext('2d');
    ctx.putImageData(image, 0, 0);
}

function display_results(results) {
    update_canvas('okhsv_sv_canvas', results["okhsv_sv"]);
    update_canvas('oklch_lc_canvas', results["oklch_lc"]);
}

function display_results_okhsl(results) {
    update_canvas('okhsl_hs_canvas', results["okhsl_hs"]);
    update_canvas('okhsl_hl_canvas', results["okhsl_hl"]);
    update_canvas('okhsl_s_canvas', results["okhsl_s"]);
    update_canvas('okhsl_sl_canvas', results["okhsl_sl"]);
}

// Update all manipulators for OKHSL
function update_okhsl_manipulators() {
    let okhsl = srgb_to_okhsl(r,g,b);
    let h = okhsl[0], s = okhsl[1], l = okhsl[2];
    let hsl_a = 0.5 + 0.5*s*Math.cos(h*2*Math.PI);
    let hsl_b = 0.5 + 0.5*s*Math.sin(h*2*Math.PI);
    let hs_x = Math.max(0, Math.min(picker_size, picker_size*hsl_a));
    let hs_y = Math.max(0, Math.min(picker_size, picker_size*(1-hsl_b)));

    let hs_manip = document.getElementById('okhsl_hs_manipulator');
    if (hs_manip) hs_manip.transform.baseVal.getItem(0).setTranslate(hs_x, hs_y);

    let l_manip = document.getElementById('okhsl_l_manipulator');
    if (l_manip) l_manip.transform.baseVal.getItem(0).setTranslate(0, Math.max(0, Math.min(picker_size, picker_size*(1-l))));

    let hl_manip = document.getElementById('okhsl_hl_manipulator');
    if (hl_manip) hl_manip.transform.baseVal.getItem(0).setTranslate(
        Math.max(0, Math.min(picker_size, picker_size*h)),
        Math.max(0, Math.min(picker_size, picker_size*(1-l)))
    );

    let s_manip = document.getElementById('okhsl_s_manipulator');
    if (s_manip) s_manip.transform.baseVal.getItem(0).setTranslate(0, Math.max(0, Math.min(picker_size, picker_size*(1-s))));

    let sl_manip = document.getElementById('okhsl_sl_manipulator');
    if (sl_manip) sl_manip.transform.baseVal.getItem(0).setTranslate(
        Math.max(0, Math.min(picker_size, picker_size*s)),
        Math.max(0, Math.min(picker_size, picker_size*(1-l)))
    );

    let h_manip = document.getElementById('okhsl_h_manipulator');
    if (h_manip) h_manip.transform.baseVal.getItem(0).setTranslate(0, Math.max(0, Math.min(picker_size, picker_size*h)));
}

function update() {
    // OKHSV manipulator and inputs
    let okhsv = srgb_to_okhsv(r,g,b);
    let sv_manip = document.getElementById('okhsv_sv_manipulator');
    if (sv_manip) sv_manip.transform.baseVal.getItem(0).setTranslate(
        Math.max(0, Math.min(picker_size, picker_size*okhsv[1])),
        Math.max(0, Math.min(picker_size, picker_size*(1-okhsv[2])))
    );
    let h_manip = document.getElementById('okhsv_h_manipulator');
    if (h_manip) h_manip.transform.baseVal.getItem(0).setTranslate(0, Math.max(0, Math.min(picker_size, picker_size*okhsv[0])));
    document.getElementById('okhsv_h_input').value = Math.round(360*okhsv[0]);
    document.getElementById('okhsv_s_input').value = Math.round(100*okhsv[1]);
    document.getElementById('okhsv_v_input').value = Math.round(100*okhsv[2]);

    // OKLCH manipulator and inputs
    let lab = linear_srgb_to_oklab(srgb_transfer_function_inv(r/255), srgb_transfer_function_inv(g/255), srgb_transfer_function_inv(b/255));
    let L = toe(lab[0]);
    let h = 0.5 + 0.5*Math.atan2(-lab[2], -lab[1])/Math.PI;
    let C = Math.sqrt(lab[1]*lab[1] + lab[2]*lab[2]);

    let lc_manip = document.getElementById('oklch_lc_manipulator');
    if (lc_manip) lc_manip.transform.baseVal.getItem(0).setTranslate(
        Math.max(0, Math.min(picker_size, picker_size*C/oklab_C_scale)),
        Math.max(0, Math.min(picker_size, picker_size*(1-L)))
    );
    let h_manip2 = document.getElementById('oklch_h_manipulator');
    if (h_manip2) h_manip2.transform.baseVal.getItem(0).setTranslate(0, Math.max(0, Math.min(picker_size, picker_size*h)));
    document.getElementById('oklch_h_input').value = Math.round(360*h);
    document.getElementById('oklch_c_input').value = Math.round(100*C);
    document.getElementById('oklch_l_input').value = Math.round(100*L);

    // OKHSL manipulators and inputs
    update_okhsl_manipulators();
    let okhsl = srgb_to_okhsl(r,g,b);
    document.getElementById('okhsl_h_input').value = Math.round(360*okhsl[0]);
    document.getElementById('okhsl_s_input').value = Math.round(100*okhsl[1]);
    document.getElementById('okhsl_l_input').value = Math.round(100*okhsl[2]);

    // Synchronous rendering – updates the canvases directly
    display_results(render(r,g,b));
    display_results_okhsl(render_okhsl(r,g,b));

    document.getElementById('swatch').style.backgroundColor = `rgb(${r},${g},${b})`;
    document.getElementById('hex_input').value = rgb_to_hex(r,g,b);
}

function initialize() {
    let mouse_handler = null, touch_handler = null;

    function update_url() { history.replaceState(null, null, rgb_to_hex(r,g,b)); }

    function setup_input_handler(input, handler) {
        if (!input) return;
        input.addEventListener('change', e => {
            let v = Number(e.target.value);
            if (!isNaN(v)) { handler(v); update(); update_url(); }
        });
    }

    function setup_handler(canvas, handler) {
        if (!canvas) return;
        let outer = (clientX, clientY) => {
            let rect = canvas.getBoundingClientRect();
            let x = Math.max(0, Math.min(picker_size, clientX - rect.left));
            let y = Math.max(0, Math.min(picker_size, clientY - rect.top));
            handler(x, y);
            update();
        };
        canvas.addEventListener('mousedown', e => {
            e.preventDefault();
            mouse_handler = (x,y) => outer(x,y);
            outer(e.clientX, e.clientY);
        });
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            if (e.touches.length === 1) {
                let t = e.touches[0];
                touch_handler = (x,y) => outer(x,y);
                outer(t.clientX, t.clientY);
            } else touch_handler = null;
        });
    }

    document.addEventListener('mouseup', e => { if (mouse_handler) { mouse_handler(e.clientX, e.clientY); mouse_handler = null; update_url(); } });
    document.addEventListener('mousemove', e => { if (mouse_handler) mouse_handler(e.clientX, e.clientY); });
    document.addEventListener('touchend', e => { if (touch_handler && e.touches.length === 0) { touch_handler = null; update_url(); } });
    document.addEventListener('touchmove', e => { if (touch_handler && e.touches.length === 1) { let t = e.touches[0]; touch_handler(t.clientX, t.clientY); } });

    function clamp(x) { return x < eps ? eps : (x > 1-eps ? 1-eps : x); }

    // HSL-style handlers for OKHSL (reused for all three views)
    function setup_hsl_handlers(prefix, to_hsl, from_hsl) {
        setup_handler(document.getElementById(prefix + '_hs_canvas'), (x,y) => {
            let hsl = to_hsl(r,g,b);
            let a = 2*(y/picker_size)-1;
            let bb = 2*(1 - x/picker_size)-1;  // renamed from 'b' to avoid shadowing
            let rad = Math.sqrt(a*a + bb*bb);
            if (rad > 1) { a /= rad; bb /= rad; rad = 1; }
            let new_h = 0.5+0.5*Math.atan2(a,bb)/Math.PI;
            let new_s = rad;
            let rgb = from_hsl(new_h, new_s, hsl[2]);
            r = rgb[0]; g = rgb[1]; b = rgb[2];  // now 'b' refers to the global
        });

        setup_handler(document.getElementById(prefix + '_l_canvas'), (x,y) => {
            let l = clamp(1 - y/picker_size);
            let hsl = to_hsl(r,g,b);
            let rgb = from_hsl(hsl[0], hsl[1], l);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        });

        setup_handler(document.getElementById(prefix + '_hl_canvas'), (x,y) => {
            let hsl = to_hsl(r,g,b);
            let new_h = clamp(x/picker_size);
            let new_l = clamp(1 - y/picker_size);
            let rgb = from_hsl(new_h, hsl[1], new_l);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        });

        setup_handler(document.getElementById(prefix + '_s_canvas'), (x,y) => {
            let s = clamp(1 - y/picker_size);
            let hsl = to_hsl(r,g,b);
            let rgb = from_hsl(hsl[0], s, hsl[2]);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        });

        setup_handler(document.getElementById(prefix + '_sl_canvas'), (x,y) => {
            let hsl = to_hsl(r,g,b);
            let new_s = clamp(x/picker_size);
            let new_l = clamp(1 - y/picker_size);
            let rgb = from_hsl(hsl[0], new_s, new_l);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        });

        setup_handler(document.getElementById(prefix + '_h_canvas'), (x,y) => {
            let h = clamp(y/picker_size);
            let hsl = to_hsl(r,g,b);
            let rgb = from_hsl(h, hsl[1], hsl[2]);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        });
    }

    // OKHSV handlers
    setup_handler(document.getElementById('okhsv_sv_canvas'), (x,y) => {
        let hsv = srgb_to_okhsv(r,g,b);
        let s = Math.max(0, Math.min(1, x/picker_size));
        let v = Math.max(0, Math.min(1, 1 - y/picker_size));
        let rgb = okhsv_to_srgb(hsv[0], s, v);
        r = rgb[0]; g = rgb[1]; b = rgb[2];
    });
    setup_handler(document.getElementById('okhsv_h_canvas'), (x,y) => {
        let h = Math.max(0, Math.min(1, y/picker_size));
        let hsv = srgb_to_okhsv(r,g,b);
        let rgb = okhsv_to_srgb(h, hsv[1], hsv[2]);
        r = rgb[0]; g = rgb[1]; b = rgb[2];
    });

    // OKLCH handlers (your existing complex handler)
    setup_handler(document.getElementById('oklch_lc_canvas'), (x,y) => {
        let lab = linear_srgb_to_oklab(srgb_transfer_function_inv(r/255), srgb_transfer_function_inv(g/255), srgb_transfer_function_inv(b/255));
        let l = Math.sqrt(lab[1]*lab[1] + lab[2]*lab[2]);
        let a_ = lab[1]/l, b_ = lab[2]/l;
        let new_C = Math.max(x/picker_size, eps);
        let new_L = y < picker_size ? toe_inv((1 - y/picker_size)) : (1 - y/picker_size);
        new_L = Math.max(0, Math.min(1, new_L));
        let LC = find_cusp(a_, b_);
        let L0;
        if (new_L > LC[0]) {
            let L_d = LC[0] - 1;
            let C_d = LC[1]/oklab_C_scale;
            let l2 = L_d*L_d + C_d*C_d;
            let d = ((new_L-1)*L_d + new_C*C_d)/l2;
            d = clamp(d);
            let k = new_C/(new_C - C_d*d);
            L0 = (1-k)*new_L + k*(1 + L_d*d);
        } else {
            let L_d = LC[0];
            let C_d = LC[1]/oklab_C_scale;
            let l2 = L_d*L_d + C_d*C_d;
            let d = (new_L*L_d + new_C*C_d)/l2;
            d = clamp(d);
            let k = new_C/(new_C - C_d*d);
            L0 = (1-k)*new_L + k*(L_d*d);
        }
        new_C = oklab_C_scale*new_C;
        let t = find_gamut_intersection(a_, b_, new_L, new_C, L0);
        t = clamp(t);
        new_C = t*new_C;
        new_L = t*new_L + (1-t)*L0;
        if (new_L < eps) new_C = eps*new_L;
        let rgb = oklab_to_linear_srgb(new_L, new_C*a_, new_C*b_);
        r = 255*srgb_transfer_function(rgb[0]);
        g = 255*srgb_transfer_function(rgb[1]);
        b = 255*srgb_transfer_function(rgb[2]);
    });

    setup_handler(document.getElementById('oklch_h_canvas'), (x,y) => {
        let lab = linear_srgb_to_oklab(srgb_transfer_function_inv(r/255), srgb_transfer_function_inv(g/255), srgb_transfer_function_inv(b/255));
        let L = lab[0];
        let C = Math.sqrt(lab[1]*lab[1] + lab[2]*lab[2]);
        let h = Math.max(0, Math.min(1, y/picker_size));
        let a_ = Math.cos(2*Math.PI*h);
        let b_ = Math.sin(2*Math.PI*h);
        let t = find_gamut_intersection(a_, b_, L, C, L);
        t = Math.min(t,1);
        C = clamp(t*C);
        let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);
        r = 255*srgb_transfer_function(rgb[0]);
        g = 255*srgb_transfer_function(rgb[1]);
        b = 255*srgb_transfer_function(rgb[2]);
    });

    // Input handlers
    setup_input_handler(document.getElementById('okhsv_h_input'), h => { h = clamp(h/360); let hsl = srgb_to_okhsv(r,g,b); let rgb = okhsv_to_srgb(h, hsl[1], hsl[2]); r=rgb[0]; g=rgb[1]; b=rgb[2]; });
    setup_input_handler(document.getElementById('okhsv_s_input'), s => { s = clamp(s/100); let hsl = srgb_to_okhsv(r,g,b); let rgb = okhsv_to_srgb(hsl[0], s, hsl[2]); r=rgb[0]; g=rgb[1]; b=rgb[2]; });
    setup_input_handler(document.getElementById('okhsv_v_input'), v => { v = clamp(v/100); let hsl = srgb_to_okhsv(r,g,b); let rgb = okhsv_to_srgb(hsl[0], hsl[1], v); r=rgb[0]; g=rgb[1]; b=rgb[2]; });

    setup_input_handler(document.getElementById('oklch_h_input'), h => {
        let lab = linear_srgb_to_oklab(srgb_transfer_function_inv(r/255), srgb_transfer_function_inv(g/255), srgb_transfer_function_inv(b/255));
        let L = lab[0];
        h = clamp(h/360);
        let C = Math.sqrt(lab[1]*lab[1] + lab[2]*lab[2]);
        let a_ = Math.cos(2*Math.PI*h);
        let b_ = Math.sin(2*Math.PI*h);
        let t = find_gamut_intersection(a_, b_, L, C, L);
        t = Math.min(t,1);
        C = clamp(t*C);
        let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);
        r = 255*srgb_transfer_function(rgb[0]);
        g = 255*srgb_transfer_function(rgb[1]);
        b = 255*srgb_transfer_function(rgb[2]);
    });
    setup_input_handler(document.getElementById('oklch_c_input'), C => {
        let lab = linear_srgb_to_oklab(srgb_transfer_function_inv(r/255), srgb_transfer_function_inv(g/255), srgb_transfer_function_inv(b/255));
        let L = lab[0];
        let h = 0.5 + 0.5*Math.atan2(-lab[2], -lab[1])/Math.PI;
        C = clamp(C/100);
        let a_ = Math.cos(2*Math.PI*h);
        let b_ = Math.sin(2*Math.PI*h);
        let t = find_gamut_intersection(a_, b_, L, C, L);
        t = Math.min(t,1);
        C = clamp(t*C);
        let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);
        r = 255*srgb_transfer_function(rgb[0]);
        g = 255*srgb_transfer_function(rgb[1]);
        b = 255*srgb_transfer_function(rgb[2]);
    });
    setup_input_handler(document.getElementById('oklch_l_input'), L => {
        let lab = linear_srgb_to_oklab(srgb_transfer_function_inv(r/255), srgb_transfer_function_inv(g/255), srgb_transfer_function_inv(b/255));
        let h = 0.5 + 0.5*Math.atan2(-lab[2], -lab[1])/Math.PI;
        let C = Math.sqrt(lab[1]*lab[1] + lab[2]*lab[2]);
        L = toe_inv(clamp(L/100));
        let a_ = Math.cos(2*Math.PI*h);
        let b_ = Math.sin(2*Math.PI*h);
        let t = find_gamut_intersection(a_, b_, L, C, L);
        t = Math.min(t,1);
        C = clamp(t*C);
        let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);
        r = 255*srgb_transfer_function(rgb[0]);
        g = 255*srgb_transfer_function(rgb[1]);
        b = 255*srgb_transfer_function(rgb[2]);
    });

    // OKHSL handlers
    setup_hsl_handlers("okhsl", srgb_to_okhsl, okhsl_to_srgb);
    setup_input_handler(document.getElementById('okhsl_h_input'), h => { h = clamp(h/360); let hsl = srgb_to_okhsl(r,g,b); let rgb = okhsl_to_srgb(h, hsl[1], hsl[2]); r=rgb[0]; g=rgb[1]; b=rgb[2]; });
    setup_input_handler(document.getElementById('okhsl_s_input'), s => { s = clamp(s/100); let hsl = srgb_to_okhsl(r,g,b); let rgb = okhsl_to_srgb(hsl[0], s, hsl[2]); r=rgb[0]; g=rgb[1]; b=rgb[2]; });
    setup_input_handler(document.getElementById('okhsl_l_input'), l => { l = clamp(l/100); let hsl = srgb_to_okhsl(r,g,b); let rgb = okhsl_to_srgb(hsl[0], hsl[1], l); r=rgb[0]; g=rgb[1]; b=rgb[2]; });

    document.getElementById('hex_input').addEventListener('change', e => {
        let rgb = hex_to_rgb(e.target.value);
        if (rgb) { r = rgb[0]; g = rgb[1]; b = rgb[2]; update(); update_url(); }
    });

    // Static canvases
    let results = render_static();
    update_canvas('okhsv_h_canvas', results["okhsv_h"]);
    update_canvas('oklch_h_canvas', results["oklch_h"]);
    update_canvas('okhsl_l_canvas', results["okhsl_l"]);
    update_canvas('okhsl_h_canvas', results["okhsl_h"]);

    update(); // initial render
}