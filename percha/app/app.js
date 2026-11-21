/* La Percha · Mi pedido — prototipo funcional (sin dependencias).
   Todo el estado vive en el dispositivo: la app es estática y se sirve
   desde CDN, así que soporta picos de tráfico sin servidores propios. */
(function () {
  "use strict";

  var KEY = "lapercha.pedido.v2";

  var STAGES = [
    { key: "confirmado", title: "Pedido confirmado", text: "Recibimos tu pago. Tu pedido entró a la fila de preparación." },
    { key: "preparando", title: "Preparando tus prendas", text: "Estamos revisando cada prenda en bodega. Aún puedes cambiar talla o dirección." },
    { key: "empacado", title: "Empacado", text: "Tu pedido está listo y revisado. Aquí tienes la foto real de tu paquete." },
    { key: "camino", title: "En camino", text: "Salió con la transportadora. Puedes seguirlo aquí sin preguntar a nadie." },
    { key: "hoy", title: "Llega hoy", text: "Tu repartidor está en ruta por tu zona." },
    { key: "entregado", title: "Entregado", text: "¡Ya lo tienes! Cuéntanos cómo te quedó." }
  ];

  var SIZES = ["26", "28", "30", "32", "XS", "S", "M", "L", "XL"];

  function fresh() {
    return {
      stage: 1,
      late: false,
      coupon: null,
      unread: 2,
      editsLeft: 1,
      callback: null,
      exchange: null,
      rating: null,
      fit: null,
      order: {
        id: "LP-48213",
        placed: "Sáb 22 nov · 9:14 a. m.",
        eta: "Jue 27 – vie 28 nov",
        etaLate: "Lun 1 dic",
        slot: "2:00 – 4:00 p. m.",
        courier: "Coordinadora · guía 7781 2290",
        address: "Cra. 43A #1-50, El Poblado, Medellín",
        items: [
          { id: "a", name: "Hoodie oversize", size: "L", color: "Negro", price: 249900 },
          { id: "b", name: "Camiseta boxy fit", size: "M", color: "Hueso", price: 129900 }
        ]
      },
      notes: [
        { ch: "WhatsApp", time: "9:15 a. m.", text: "Pedido LP-48213 confirmado. Llega jue 27 – vie 28 nov. Te avisamos en cada paso, no tienes que escribirnos." },
        { ch: "Push", time: "11:02 a. m.", text: "Temporada alta: hoy preparamos 1.240 pedidos. Tu fecha ya tiene en cuenta ese volumen." }
      ]
    };
  }

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* almacenamiento bloqueado: seguimos en memoria */ }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
  }

  function money(n) { return "$" + n.toLocaleString("es-CO"); }
  function now() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "p. m." : "a. m.";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }
  function notify(ch, text) {
    state.notes.unshift({ ch: ch, time: now(), text: text });
    state.unread += 1;
    toast(text);
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, 3600);
  }

  /* ---------- Vistas ---------- */

  function peakBanner() {
    return '<div class="peak"><span class="pulse" aria-hidden="true"></span><div><strong>Temporada alta, sin sorpresas.</strong> Hoy preparamos 1.240 pedidos. Las fechas que ves ya incluyen ese volumen.</div></div>';
  }

  function promiseCard() {
    if (state.coupon) {
      return '<div class="card promise late"><p class="eyebrow">Promesa Percha · cumplida</p><h3>Nos tardamos. Ya te compensamos.</h3><p>Tu nueva fecha es <strong>' + state.order.etaLate + '</strong>. Sin que lo pidieras, te dejamos un cupón de 15% para tu próxima compra.</p><div class="coupon"><span>' + state.coupon + '</span><button class="ghost sm" data-act="copy">Copiar</button></div></div>';
    }
    return '<div class="card promise"><p class="eyebrow">Promesa Percha</p><p>Si llegamos después de <strong>' + state.order.eta.split("– ")[1] + '</strong>, te damos un cupón de 15% automáticamente. Sin reclamos, sin formularios.</p></div>';
  }

  function timeline() {
    return '<ol class="timeline">' + STAGES.map(function (s, i) {
      var cls = i < state.stage ? "done" : i === state.stage ? "now" : "next";
      var extra = "";
      if (i === state.stage && s.key === "empacado") extra = packagePhoto();
      if (i === state.stage && s.key === "camino") extra = '<p class="meta">' + state.order.courier + '</p>';
      if (i === state.stage && s.key === "hoy") extra = '<p class="meta">Franja: <strong>' + state.order.slot + '</strong></p><button class="ghost sm" data-act="reschedule">No estaré, reprogramar</button>';
      return '<li class="' + cls + '"><span class="node" aria-hidden="true"></span><div><p class="t">' + s.title + '</p>' + (i === state.stage ? '<p class="d">' + s.text + '</p>' + extra : "") + "</div></li>";
    }).join("") + "</ol>";
  }

  function packagePhoto() {
    return '<figure class="photo"><svg viewBox="0 0 280 150" role="img" aria-label="Foto de tu paquete empacado"><rect width="280" height="150" fill="#e7e1d6"/><rect x="70" y="40" width="140" height="86" rx="6" fill="#c8a27a"/><rect x="70" y="40" width="140" height="22" fill="#b88f66"/><rect x="132" y="40" width="16" height="86" fill="#e9dcc7"/><rect x="152" y="82" width="46" height="30" rx="3" fill="#fbf8f2"/><path d="M160 92h30M160 100h22" stroke="#57534e" stroke-width="3"/><text x="140" y="142" text-anchor="middle" font-family="Syne,sans-serif" font-weight="800" font-size="10" letter-spacing="2" fill="#0a0a0a">LA PERCHA MED</text></svg><figcaption>Empacado por Valentina · revisado 2 veces</figcaption></figure>';
  }

  function viewHome() {
    var o = state.order, s = STAGES[state.stage];
    var pct = Math.round((state.stage / (STAGES.length - 1)) * 100);
    var eta = state.coupon ? o.etaLate : o.eta;
    return peakBanner() +
      '<h1 class="h">Hola, Daniela</h1>' +
      '<button class="card order" data-go="/pedido">' +
        '<div class="row"><span class="eyebrow">Pedido ' + o.id + '</span><span class="chip">' + s.title + '</span></div>' +
        '<p class="eta-label">' + (state.stage === 5 ? "Entregado" : "Llega") + '</p>' +
        '<p class="eta">' + (state.stage === 5 ? "Ya está contigo" : state.stage === 4 ? "Hoy, " + o.slot : eta) + '</p>' +
        '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct + '%"></span></div>' +
        '<p class="next-step">' + s.text + '</p>' +
        '<span class="link">Ver línea de vida →</span>' +
      "</button>" +
      promiseCard() +
      '<div class="grid2">' +
        '<button class="tile" data-go="/pedido"><strong>' + (state.stage < 2 ? "Cambiar talla o dirección" : "Seguir mi pedido") + '</strong><span>' + (state.stage < 2 ? "Abierto hasta que lo empaquemos" : "Cada paso, en vivo") + "</span></button>" +
        '<button class="tile" data-go="/ayuda"><strong>Resolver una duda</strong><span>Respuesta en segundos</span></button>' +
      "</div>";
  }

  function viewOrder() {
    var o = state.order;
    var canEdit = state.stage < 2;
    var items = o.items.map(function (it) {
      var sel = canEdit && state.editsLeft > 0
        ? '<label class="size">Talla <select data-size="' + it.id + '">' + SIZES.filter(function (z) {
            return isNaN(it.size) === isNaN(z);
          }).map(function (z) { return "<option" + (z === it.size ? " selected" : "") + ">" + z + "</option>"; }).join("") + "</select></label>"
        : '<span class="meta">Talla ' + it.size + "</span>";
      return '<li class="item"><span class="sw" style="background:' + (it.color === "Negro" ? "#0a0a0a" : "#ece7dc") + '"></span><div><p class="t">' + it.name + '</p><p class="meta">' + it.color + " · " + money(it.price) + "</p></div>" + sel + "</li>";
    }).join("");
    var total = o.items.reduce(function (a, b) { return a + b.price; }, 0);
    return '<button class="back" data-go="/">← Pedidos</button>' +
      '<h1 class="h">Pedido ' + o.id + "</h1>" +
      '<p class="sub">Hecho el ' + o.placed + "</p>" +
      '<section class="card">' + timeline() + "</section>" +
      (state.stage === 5 ? rateCard() : "") +
      '<section class="card"><div class="row"><h2 class="h2">Tus prendas</h2>' +
        (canEdit ? '<span class="chip ok">Editable</span>' : '<span class="chip">Cerrado</span>') + "</div>" +
        '<ul class="items">' + items + "</ul>" +
        '<p class="row total"><span>Total</span><strong>' + money(total) + "</strong></p>" +
        (canEdit ? '<p class="hint">Puedes ajustar talla o dirección hasta que empaquemos. Así evitamos un cambio después.</p>' : "") +
      "</section>" +
      '<section class="card"><h2 class="h2">Entrega</h2><p>' + o.address + "</p>" +
        (canEdit ? '<button class="ghost sm" data-act="address">Cambiar dirección</button>' : "") +
      "</section>";
  }

  function rateCard() {
    if (state.rating) {
      return '<section class="card thanks"><h2 class="h2">¡Gracias, Daniela!</h2><p>Tu opinión de talla ayuda a la próxima persona que compre esta prenda.</p><button class="primary" data-act="share">Compartir mi look · gana 10%</button></section>';
    }
    return '<section class="card"><h2 class="h2">¿Cómo te quedó?</h2>' +
      '<div class="fit">' + ["Pequeño", "Perfecto", "Grande"].map(function (f) {
        return '<button class="pill' + (state.fit === f ? " on" : "") + '" data-fit="' + f + '">' + f + "</button>";
      }).join("") + "</div>" +
      '<div class="stars" role="group" aria-label="Califica tu experiencia">' + [1, 2, 3, 4, 5].map(function (n) {
        return '<button data-rate="' + n + '" aria-label="' + n + ' estrellas">★</button>';
      }).join("") + "</div></section>";
  }

  var FAQ = [
    { q: "¿Dónde está mi pedido?", a: function () {
      var s = STAGES[state.stage];
      return "Tu pedido " + state.order.id + " está en <strong>" + s.title.toLowerCase() + "</strong>. " + (state.stage < 5 ? "Llega " + (state.stage === 4 ? "hoy entre " + state.order.slot : state.coupon ? state.order.etaLate : state.order.eta) + "." : "Se entregó en " + state.order.address + ".");
    } },
    { q: "¿Puedo cambiar la talla?", a: function () {
      return state.stage < 2
        ? "Sí, todavía no lo empacamos. Cámbiala ahora en la pantalla del pedido y no tendrás que hacer un cambio después."
        : state.stage < 5 ? "Ya está empacado. Cuando lo recibas, haz el cambio en 2 toques desde la pestaña Cambios: lo recogemos en tu casa." : "Sí. Ve a la pestaña Cambios: generas tu código y lo recogemos en tu casa.";
    } },
    { q: "¿Y si llega tarde?", a: function () {
      return "Aplica la Promesa Percha: si llegamos después de la fecha que te dimos, recibes un cupón del 15% automáticamente." + (state.coupon ? " Tu cupón ya está activo: <strong>" + state.coupon + "</strong>." : "");
    } },
    { q: "¿Cómo pago contraentrega?", a: function () { return "Tu pedido ya está pagado. El repartidor no te pedirá dinero."; } }
  ];

  function viewHelp() {
    var cb = state.callback
      ? '<div class="card callback"><p class="eyebrow">Fila virtual</p><h3>Te escribimos a las ' + state.callback + '</h3><p>Puedes cerrar la app. Una persona del equipo te contacta por WhatsApp con tu pedido ya abierto: no tendrás que repetir nada.</p><button class="ghost sm" data-act="cancelcb">Ya no lo necesito</button></div>'
      : '<div class="card"><h2 class="h2">¿Prefieres a una persona?</h2><p>No te dejamos esperando en un chat. Reserva un turno y te contactamos con todo tu pedido a la mano.</p><p class="meta">Hay 14 personas antes que tú · ~25 min</p><button class="primary" data-act="callback">Reservar mi turno</button></div>';
    return '<h1 class="h">Ayuda</h1><p class="sub">Respuestas con los datos de tu pedido, al instante.</p>' +
      '<div class="faq">' + FAQ.map(function (f, i) {
        return '<details class="card qa"' + (i === 0 ? " open" : "") + "><summary>" + f.q + '</summary><p>' + f.a() + "</p></details>";
      }).join("") + "</div>" + cb;
  }

  function qr(seed) {
    var h = 0, cells = "";
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    var n = 21;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      var on;
      if (finder) {
        var fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5);
      } else {
        h = (h * 1103515245 + 12345) >>> 0;
        on = (h >>> 16) & 1;
      }
      if (on) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg class="qr" viewBox="-1 -1 23 23" role="img" aria-label="Código del cambio"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#1c1917">' + cells + "</g></svg>";
  }

  function viewExchange() {
    if (state.stage < 5) {
      return '<h1 class="h">Cambios</h1><p class="sub">Cambia talla o color en 2 toques, sin llamadas.</p>' +
        '<div class="card"><p>Tu pedido aún no llega. ' + (state.stage < 2
          ? 'Todavía puedes <strong>cambiar la talla antes de que lo empaquemos</strong>: es más rápido que un cambio.</p><button class="primary" data-go="/pedido">Ajustar talla ahora</button>'
          : "Cuando lo recibas, aquí podrás pedir el cambio y lo recogemos en tu casa.</p>") + "</div>";
    }
    if (state.exchange) {
      var e = state.exchange;
      return '<h1 class="h">Cambio listo</h1><p class="sub">Mismo empaque, misma bolsa. Nosotros vamos.</p>' +
        '<div class="card center">' + qr(e.code) + '<p class="code">' + e.code + '</p><p>' + e.item + " · talla " + e.from + " → <strong>" + e.to + "</strong></p><p class=\"meta\">" + e.how + '</p></div>' +
        '<div class="card"><p>Te enviamos la talla nueva el mismo día que recogemos. Si no hay stock, te devolvemos el dinero en 48 h.</p></div>';
    }
    var o = state.order;
    return '<h1 class="h">Cambios</h1><p class="sub">Tienes 30 días. Elige la prenda y la talla nueva.</p>' +
      '<form class="card" id="exform">' +
        '<label class="field">Prenda<select name="item">' + o.items.map(function (it) { return '<option value="' + it.id + '">' + it.name + " (talla " + it.size + ")</option>"; }).join("") + "</select></label>" +
        '<label class="field">Talla nueva<select name="to">' + SIZES.map(function (z) { return "<option>" + z + "</option>"; }).join("") + "</select></label>" +
        '<fieldset class="field"><legend>¿Cómo lo devuelves?</legend>' +
          '<label class="radio"><input type="radio" name="how" value="Recogemos en tu casa mañana, 8 a. m. – 12 m." checked> Recogemos en tu casa</label>' +
          '<label class="radio"><input type="radio" name="how" value="Déjalo en un punto aliado cercano (Éxito El Poblado)"> Punto aliado cercano</label>' +
        "</fieldset>" +
        '<button class="primary" type="submit">Generar mi código</button>' +
      "</form>";
  }

  function viewNotes() {
    state.unread = 0;
    save();
    return '<h1 class="h">Avisos</h1><p class="sub">Te contamos antes de que tengas que preguntar.</p><ul class="notes">' +
      state.notes.map(function (n) {
        return '<li class="card note"><div class="row"><span class="chip ' + (n.ch === "WhatsApp" ? "wa" : "") + '">' + n.ch + '</span><span class="meta">' + n.time + "</span></div><p>" + n.text + "</p></li>";
      }).join("") + "</ul>";
  }

  var ROUTES = { "/": viewHome, "/pedido": viewOrder, "/ayuda": viewHelp, "/cambios": viewExchange, "/avisos": viewNotes };

  function route() { return (location.hash || "#/").slice(1); }

  function render() {
    var r = route();
    var fn = ROUTES[r] || viewHome;
    var view = document.getElementById("view");
    view.innerHTML = fn();
    var u = document.getElementById("unread");
    u.hidden = !state.unread;
    var tabs = document.querySelectorAll("[data-tab]");
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute("data-tab") === (r === "/pedido" ? "/" : r);
      tabs[i].classList.toggle("on", on);
      if (on) tabs[i].setAttribute("aria-current", "page"); else tabs[i].removeAttribute("aria-current");
    }
    var form = document.getElementById("exform");
    if (form) form.addEventListener("submit", onExchange);
  }

  function go(path) {
    if (route() === path) render(); else location.hash = path;
    window.scrollTo(0, 0);
  }

  /* ---------- Acciones ---------- */

  function advance() {
    if (state.stage >= 5) { toast("El pedido ya fue entregado. Usa Reiniciar para volver a empezar."); return; }
    state.stage += 1;
    var msgs = {
      2: ["Push", "Tu pedido está empacado. Mira la foto real de tu paquete."],
      3: ["WhatsApp", "Tu pedido salió con Coordinadora. Síguelo en vivo desde la app."],
      4: ["WhatsApp", "Llega hoy entre " + state.order.slot + ". ¿No estarás? Reprograma con un toque."],
      5: ["Push", "Entregado. ¿Cómo te quedó? Tu opinión de talla ayuda a otros."]
    };
    var m = msgs[state.stage];
    if (m) notify(m[0], m[1]);
    save(); render();
  }

  function late() {
    if (state.coupon) { toast("La compensación ya se aplicó."); return; }
    if (state.stage >= 5) { toast("El pedido ya se entregó a tiempo."); return; }
    state.late = true;
    state.coupon = "PERCHA15-" + state.order.id.slice(-4);
    notify("WhatsApp", "Nos tardamos más de lo prometido. Tu nueva fecha es " + state.order.etaLate + " y ya tienes un cupón de 15%: " + state.coupon + ".");
    save(); render();
  }

  function onExchange(ev) {
    ev.preventDefault();
    var f = ev.target;
    var it = state.order.items.filter(function (x) { return x.id === f.item.value; })[0];
    var how = f.querySelector("input[name=how]:checked").value;
    state.exchange = {
      code: "CMB-" + state.order.id.slice(-5) + "-" + it.id.toUpperCase(),
      item: it.name, from: it.size, to: f.to.value, how: how
    };
    notify("WhatsApp", "Cambio aprobado: " + it.name + " a talla " + f.to.value + ". " + how.replace(/\.$/, "") + ".");
    save(); render();
  }

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("button, [data-go]");
    if (!el) return;
    var to = el.getAttribute("data-go");
    if (to) { go(to); return; }

    var demo = el.getAttribute("data-demo");
    if (demo === "next") return advance();
    if (demo === "late") return late();
    if (demo === "reset") { state = fresh(); save(); go("/"); toast("Prototipo reiniciado."); return; }

    if (el.hasAttribute("data-rate")) {
      state.rating = Number(el.getAttribute("data-rate"));
      save(); render(); return;
    }
    if (el.hasAttribute("data-fit")) { state.fit = el.getAttribute("data-fit"); save(); render(); return; }

    switch (el.getAttribute("data-act")) {
      case "copy":
        try { navigator.clipboard.writeText(state.coupon); } catch (e) { /* ignorar */ }
        toast("Cupón copiado: " + state.coupon); break;
      case "callback":
        var d = new Date(Date.now() + 25 * 60000);
        var h = d.getHours(), m = d.getMinutes();
        state.callback = (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m + (h >= 12 ? " p. m." : " a. m.");
        notify("WhatsApp", "Reservaste tu turno. Te escribimos a las " + state.callback + " con tu pedido ya abierto.");
        save(); render(); break;
      case "cancelcb":
        state.callback = null; save(); render(); toast("Turno cancelado. ¡Qué bueno que lo resolviste!"); break;
      case "reschedule":
        state.order.slot = "mañana, 8:00 – 12:00 m.";
        notify("WhatsApp", "Listo, reprogramamos tu entrega para mañana entre 8:00 y 12:00 m.");
        save(); render(); break;
      case "address":
        var a = window.prompt("Nueva dirección de entrega", state.order.address);
        if (a && a.trim()) {
          state.order.address = a.trim();
          notify("Push", "Dirección actualizada. Tu fecha de entrega no cambia.");
          save(); render();
        }
        break;
      case "share":
        var text = "Mi look de La Percha Med llegó justo a tiempo 🖤";
        if (navigator.share) { navigator.share({ title: "La Percha", text: text }).catch(function () {}); }
        else toast("Comparte tu foto con #MiPercha y recibe 10% en tu próxima compra.");
        break;
    }
  });

  document.addEventListener("change", function (ev) {
    var id = ev.target.getAttribute && ev.target.getAttribute("data-size");
    if (!id) return;
    var it = state.order.items.filter(function (x) { return x.id === id; })[0];
    var prev = it.size;
    it.size = ev.target.value;
    state.editsLeft -= 1;
    notify("Push", "Cambiamos tu " + it.name.toLowerCase() + " de talla " + prev + " a " + it.size + " antes de empacar. Sin costo y sin trámite de cambio.");
    save(); render();
  });

  window.addEventListener("hashchange", render);
  render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
