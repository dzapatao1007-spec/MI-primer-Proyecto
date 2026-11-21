/* La Percha · Mi pedido — prototipo funcional (sin dependencias).
   Todo el estado vive en el dispositivo: la app es estática y se sirve
   desde CDN, así que soporta picos de tráfico sin servidores propios. */
(function () {
  "use strict";

  var KEY = "lapercha.pedido.v4";

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
          { id: "a", name: "Conjunto Medallo (buzo + jogger)", size: "L", color: "Negro", price: 320000 },
          { id: "b", name: "Camiseta oversize Med", size: "M", color: "Hueso", price: 99000 }
        ]
      },
      notes: [
        { ch: "WhatsApp", auto: "Confirmación automática", time: "9:15 a. m.", text: "Pedido LP-48213 confirmado. Llega jue 27 – vie 28 nov. Te avisamos en cada paso, no tienes que escribirnos." },
        { ch: "Push", auto: "Detector de pico", time: "11:02 a. m.", text: "Temporada alta: hoy preparamos 1.240 pedidos. Tu fecha ya tiene en cuenta ese volumen." }
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
  function notify(ch, text, auto) {
    state.notes.unshift({ ch: ch, auto: auto || "", time: now(), text: text });
    state.unread += 1;
    if (ch === "WhatsApp") chat().push({ from: "bot", t: now(), html: text, quick: null });
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
      '<section class="card foryou"><div class="row"><h2 class="h2">Elegido para ti por IA</h2><button class="ghost sm" data-go="/whatsapp" style="margin:0">Ver en chat</button></div>' + productCards(recommend(3)) + "</section>" +
      '<div class="grid2">' +
        '<button class="tile" data-go="/pedido"><strong>' + (state.stage < 2 ? "Cambiar talla o dirección" : "Seguir mi pedido") + '</strong><span>' + (state.stage < 2 ? "Abierto hasta que lo empaquemos" : "Cada paso, en vivo") + "</span></button>" +
        '<button class="tile" data-go="/whatsapp"><strong>Escríbele a Percha</strong><span>Asistente de WhatsApp 24/7</span></button>' +
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
        return '<li class="card note"><div class="row"><span class="chip ' + (n.ch === "WhatsApp" ? "wa" : "") + '">' + n.ch + '</span><span class="meta">' + n.time + "</span></div><p>" + n.text + "</p>" + (n.auto ? '<p class="auto">⚡ Automatización: ' + n.auto + "</p>" : "") + "</li>";
      }).join("") + "</ul>";
  }

  /* ---------- Catálogo + motor de recomendaciones (IA simulada) ---------- */

  var CATALOG = [
    { id: "c-medallo", name: "Conjunto Medallo", desc: "Buzo + jogger", color: "Negro", hex: "#0a0a0a", type: "conjunto", price: 320000, tags: ["neutro", "básico"], hot: 3 },
    { id: "c-poblado", name: "Conjunto Poblado", desc: "Buzo + jogger", color: "Gris jaspe", hex: "#8a8a86", type: "conjunto", price: 320000, tags: ["neutro"], hot: 2 },
    { id: "c-laureles", name: "Conjunto Laureles", desc: "Buzo + jogger", color: "Hueso", hex: "#ece7dc", type: "conjunto", price: 320000, tags: ["claro"], hot: 2 },
    { id: "t-oversize", name: "Camiseta Oversize Med", desc: "100% algodón", color: "Negra", hex: "#1d1d1b", type: "camiseta", price: 99000, tags: ["neutro", "básico"], hot: 3 },
    { id: "t-boxy", name: "Camiseta Boxy", desc: "100% algodón", color: "Blanca", hex: "#ffffff", type: "camiseta", price: 99000, tags: ["claro", "básico"], hot: 2 },
    { id: "t-graphic", name: "Camiseta Graphic 0574", desc: "Estampado Medellín", color: "Naranja", hex: "#e2400a", type: "camiseta", price: 99000, tags: ["color", "nuevo"], hot: 4 }
  ];

  /* Puntúa cada prenda con señales del cliente: lo que ya compró, su talla
     confirmada, sus colores, lo que complementa su compra y la tendencia. */
  function recommend(n) {
    var bought = state.order.items.map(function (i) { return i.name; }).join(" ");
    var hasSet = /Conjunto/.test(bought);
    var likesNeutral = /Negro|Gris|Hueso/.test(state.order.items.map(function (i) { return i.color; }).join(" "));
    return CATALOG.map(function (p) {
      var score = p.hot, why = [];
      if (bought.indexOf(p.name) !== -1) score -= 10;
      if (hasSet && p.type === "camiseta") { score += 3; why.push("combina con tu " + state.order.items[0].name.split(" (")[0]); }
      if (!hasSet && p.type === "conjunto") { score += 3; why.push("completa tu look"); }
      if (likesNeutral && p.tags.indexOf("neutro") !== -1) { score += 2; why.push("en los tonos que más usas"); }
      if (p.tags.indexOf("nuevo") !== -1) { score += 1; why.push("nuevo esta semana"); }
      if (p.hot >= 3) why.push("lo más pedido en Medellín");
      return { p: p, score: score, why: why.slice(0, 2).join(" · ") };
    }).sort(function (a, b) { return b.score - a.score; }).slice(0, n || 3);
  }

  function sizeFor(h, w, fit) {
    var order = ["XS", "S", "M", "L", "XL"];
    var i = w < 55 ? 1 : w < 68 ? 2 : w < 82 ? 3 : 4;
    if (h >= 185) i += 1;
    if (h < 160 && i > 1) i -= 1;
    if (fit === "ajustado") i -= 1;
    if (fit === "oversize") i += 1;
    i = Math.max(0, Math.min(order.length - 1, i));
    return order[i];
  }

  /* ---------- Bot de WhatsApp ---------- */

  var MENU = ["📦 Estado de mi pedido", "📏 ¿Qué talla soy?", "✨ Recomiéndame algo", "🔄 Cambiar talla", "👤 Hablar con un asesor"];

  function chat() {
    if (!state.chat) {
      state.chat = [{ from: "bot", t: "9:15 a. m.", html: "¡Hola, Daniela! 👋 Soy <strong>Percha</strong>, el asistente de La Percha Med. Estoy aquí 24/7 para tu pedido <strong>" + state.order.id + "</strong>: estado, tallas, cambios y recomendaciones. ¿En qué te ayudo?", quick: MENU }];
      state.profile = state.profile || {};
    }
    return state.chat;
  }

  function botSay(html, quick) { chat().push({ from: "bot", t: now(), html: html, quick: quick || null }); }

  function productCards(list) {
    return '<div class="wa-cards">' + list.map(function (r) {
      return '<div class="wa-card"><span class="wa-sw" style="background:' + r.p.hex + '"></span><div><strong>' + r.p.name + '</strong><span>' + r.p.color + " · " + money(r.p.price) + "</span>" + (r.why ? '<em>' + r.why + "</em>" : "") + '</div><button class="wa-buy" data-buy="' + r.p.id + '">Lo quiero</button></div>';
    }).join("") + "</div>";
  }

  function statusText() {
    var s = STAGES[state.stage];
    var eta = state.stage === 4 ? "hoy entre " + state.order.slot : state.coupon ? state.order.etaLate : state.order.eta;
    var txt = "Tu pedido <strong>" + state.order.id + "</strong> está en: <strong>" + s.title + "</strong> ✅<br>" + s.text;
    if (state.stage < 5) txt += "<br>📅 Llega: <strong>" + eta + "</strong>";
    if (state.stage === 3 || state.stage === 4) txt += "<br>🚚 " + state.order.courier;
    if (state.coupon) txt += "<br>🎁 Tienes activo tu cupón <strong>" + state.coupon + "</strong> por la demora.";
    return txt;
  }

  function reply(text) {
    var t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    var p = state.profile || (state.profile = {});

    if (state.botMode === "altura") {
      var h = parseInt(t, 10);
      if (!h || h < 130 || h > 220) return botSay("Escríbeme tu estatura en centímetros, por ejemplo <strong>172</strong>.");
      p.height = h; state.botMode = "peso";
      return botSay("Perfecto, " + h + " cm. ¿Y cuánto pesas aproximadamente, en kg?");
    }
    if (state.botMode === "peso") {
      var w = parseInt(t, 10);
      if (!w || w < 35 || w > 180) return botSay("Escríbeme tu peso en kg, por ejemplo <strong>68</strong>.");
      p.weight = w; state.botMode = "fit";
      return botSay("¿Cómo te gusta que te quede la ropa?", ["Ajustado", "Regular", "Oversize"]);
    }
    if (state.botMode === "fit") {
      var fit = /ajust/.test(t) ? "ajustado" : /over|ancho|grande/.test(t) ? "oversize" : "regular";
      p.fit = fit; p.size = sizeFor(p.height, p.weight, fit); state.botMode = null;
      var mine = state.order.items.map(function (i) { return i.name.split(" (")[0] + " en " + i.size; }).join(" y ");
      var warn = state.order.items.some(function (i) { return i.size !== p.size; });
      return botSay("📏 Según tus medidas (" + p.height + " cm, " + p.weight + " kg, fit " + fit + "), tu talla en La Percha Med es <strong>" + p.size + "</strong>.<br>El 92% de clientes con medidas parecidas se quedó con esa talla.<br><br>Tu pedido tiene: " + mine + "." +
        (warn ? (state.stage < 2 ? "<br>⚠️ Alguna prenda no coincide. Todavía no lo empacamos, ¿la cambio sin costo?" : "<br>Si alguna te queda mal, el cambio es gratis y lo recogemos en tu casa.") : "<br>✅ ¡Pediste bien!"),
        warn && state.stage < 2 ? ["Sí, cámbiala a " + p.size, "No, la dejo así"] : MENU);
    }

    if (/^si, cambiala a /.test(t)) {
      var to = text.split(" a ").pop();
      state.order.items.forEach(function (i) { if (i.size !== to && state.editsLeft > 0) { i.size = to; } });
      state.editsLeft = 0;
      notifyQuiet("Push", "Talla ajustada a " + to + " antes de empacar.", "Asesor de talla IA → bodega");
      return botSay("Listo ✅ Ajusté la talla a <strong>" + to + "</strong> antes de empacar. Sin costo y sin trámite.", MENU);
    }
    if (/no, la dejo/.test(t)) return botSay("Perfecto 👌 Cualquier cosa, aquí estoy.", MENU);
    if (/talla|medida|size|me queda|que talla/.test(t)) {
      state.botMode = "altura";
      return botSay("¡Te ayudo a acertar! 📏 Son 3 preguntas. ¿Cuánto mides, en cm?");
    }
    if (/pedido|donde|llega|estado|envio|rastre|guia|cuando/.test(t)) return botSay(statusText(), MENU);
    if (/recomien|que mas|nuevo|comprar|algo|para mi|outfit/.test(t)) {
      var recs = recommend(3);
      return botSay("✨ Elegí estas prendas para ti" + (p.size ? " en talla <strong>" + p.size + "</strong>" : "") + ", según tu compra y tu estilo:" + productCards(recs));
    }
    if (/cambi|devol/.test(t)) {
      if (state.stage < 2) return botSay("Todavía no empacamos tu pedido, así que el cambio de talla es inmediato y gratis. ¿Quieres que te ayude a elegir la talla correcta?", ["📏 ¿Qué talla soy?", "Ir a mi pedido"]);
      return botSay("Los cambios son gratis durante 30 días y recogemos en tu casa 🏠. Genera tu código en un toque:", ["Abrir cambios", "📏 ¿Qué talla soy?"]);
    }
    if (/asesor|persona|humano|agente/.test(t)) {
      if (!state.callback) {
        var d = new Date(Date.now() + 25 * 60000), hh = d.getHours(), mm = d.getMinutes();
        state.callback = (hh % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm + (hh >= 12 ? " p. m." : " a. m.");
        notifyQuiet("Push", "Turno reservado para las " + state.callback + ".", "Fila virtual → asignación de asesor");
      }
      return botSay("👤 Listo, Camila del equipo te escribe <strong>por este chat a las " + state.callback + "</strong>. Ya tiene tu pedido abierto, así que no tendrás que repetir nada. Mientras tanto sigo aquí.", MENU);
    }
    if (/precio|cuanto|vale|cuesta/.test(t)) return botSay("💰 Conjuntos (buzo + jogger): <strong>$320.000</strong><br>Camisetas: <strong>$99.000</strong><br>Envío gratis en Medellín por compras desde $300.000.", ["✨ Recomiéndame algo", "📏 ¿Qué talla soy?"]);
    if (/pago|pague|contraentrega|plata/.test(t)) return botSay("Tu pedido ya está pagado ✅ El repartidor no te pedirá dinero.", MENU);
    if (/abrir cambios/.test(t)) { go("/cambios"); return; }
    if (/ir a mi pedido/.test(t)) { go("/pedido"); return; }
    if (/gracias|listo|ok|perfecto|genial/.test(t)) return botSay("¡Con gusto! 🖤 Aquí estoy 24/7.", MENU);
    if (/hola|buenas|hey/.test(t)) return botSay("¡Hola! ¿En qué te ayudo hoy?", MENU);
    return botSay("Mmm, no te entendí del todo 🤔 Puedo ayudarte con esto:", MENU);
  }

  function notifyQuiet(ch, text, auto) {
    state.notes.unshift({ ch: ch, auto: auto || "", time: now(), text: text });
  }

  var typing = false;
  function userSays(text) {
    if (!text || typing) return;
    chat().push({ from: "me", t: now(), html: text.replace(/</g, "&lt;") });
    typing = true; save(); render();
    setTimeout(function () { typing = false; reply(text); save(); if (route() === "/whatsapp") render(); }, 700);
  }

  function viewChat() {
    var msgs = chat();
    var last = msgs[msgs.length - 1];
    return '<div class="wa">' +
      '<div class="wa-head"><span class="wa-av">LP</span><div><strong>La Percha Med</strong><span>' + (typing ? "escribiendo…" : "Asistente IA · responde al instante") + '</span></div></div>' +
      '<div class="wa-body" id="wabody">' + msgs.map(function (m) {
        return '<div class="wa-msg ' + m.from + '"><div class="wa-bub">' + m.html + '<span class="wa-t">' + m.t + (m.from === "me" ? " ✓✓" : "") + "</span></div></div>";
      }).join("") + (typing ? '<div class="wa-msg bot"><div class="wa-bub wa-typing"><i></i><i></i><i></i></div></div>' : "") + "</div>" +
      (last && last.from === "bot" && last.quick && !typing ? '<div class="wa-quick">' + last.quick.map(function (q) { return '<button data-quick="' + q + '">' + q + "</button>"; }).join("") + "</div>" : "") +
      '<form class="wa-input" id="waform"><input name="m" autocomplete="off" placeholder="Escribe un mensaje" aria-label="Mensaje"><button type="submit" aria-label="Enviar">➤</button></form>' +
      "</div>";
  }

  function loyalty() {
    var recs = recommend(3);
    state.loyaltySent = (state.loyaltySent || 0) + 1;
    botSay("Hola Daniela 🖤 Ya pasó un mes con tu " + state.order.items[0].name.split(" (")[0] + ". Nuestra IA eligió esto para ti" + (state.profile && state.profile.size ? " en talla <strong>" + state.profile.size + "</strong>" : "") + ":" + productCards(recs) + "🎁 Solo para ti: <strong>10% con VUELVE10</strong> durante 72 h.");
    state.notes.unshift({ ch: "Email", auto: "Recompra IA (día 30)", time: now(), text: "Asunto: “Daniela, esto combina con tu " + state.order.items[0].name.split(" (")[0] + "”. 3 prendas elegidas para ti + 10% por 72 h." });
    state.unread += 2;
    toast("Automatización de recompra: WhatsApp + email enviados con 3 recomendaciones.");
    save(); go("/whatsapp");
  }

  var ROUTES = { "/": viewHome, "/pedido": viewOrder, "/ayuda": viewChat, "/whatsapp": viewChat, "/cambios": viewExchange, "/avisos": viewNotes, "/soporte": viewHelp };

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
    var wf = document.getElementById("waform");
    if (wf) {
      wf.addEventListener("submit", function (e) { e.preventDefault(); var v = wf.m.value.trim(); if (v) userSays(v); });
      var b = document.getElementById("wabody"); b.scrollTop = b.scrollHeight;
      if (!typing) wf.m.focus({ preventScroll: true });
    }
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
      2: ["Push", "Tu pedido está empacado. Mira la foto real de tu paquete.", "Foto de empaque → cliente"],
      3: ["WhatsApp", "Tu pedido salió con Coordinadora. Síguelo en vivo desde la app.", "Estado ERP → WhatsApp"],
      4: ["WhatsApp", "Llega hoy entre " + state.order.slot + ". ¿No estarás? Reprograma con un toque.", "Aviso de última milla"],
      5: ["Push", "Entregado. ¿Cómo te quedó? Tu opinión de talla ayuda a otros.", "Encuesta post-entrega"]
    };
    var m = msgs[state.stage];
    if (m) notify(m[0], m[1], m[2]);
    save(); render();
  }

  function late() {
    if (state.coupon) { toast("La compensación ya se aplicó."); return; }
    if (state.stage >= 5) { toast("El pedido ya se entregó a tiempo."); return; }
    state.late = true;
    state.coupon = "PERCHA15-" + state.order.id.slice(-4);
    notify("WhatsApp", "Nos tardamos más de lo prometido. Tu nueva fecha es " + state.order.etaLate + " y ya tienes un cupón de 15%: " + state.coupon + ".", "Promesa Percha (retraso → cupón)");
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
    notify("WhatsApp", "Cambio aprobado: " + it.name + " a talla " + f.to.value + ". " + how.replace(/\.$/, "") + ".", "Cambio en 2 toques → logística inversa");
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
    if (demo === "loyal") return loyalty();
    if (el.hasAttribute("data-quick")) return userSays(el.getAttribute("data-quick"));
    if (el.hasAttribute("data-buy")) {
      var prod = CATALOG.filter(function (x) { return x.id === el.getAttribute("data-buy"); })[0];
      chat().push({ from: "me", t: now(), html: "Quiero " + prod.name });
      botSay("¡Buena elección! 🔥 Te separé <strong>" + prod.name + "</strong>" + (state.profile && state.profile.size ? " en talla " + state.profile.size : "") + " por " + money(prod.price) + ".<br>💳 Link de pago seguro: <u>pagos.lapercha.co/" + prod.id + "</u><br>Si pagas hoy, sale mañana mismo.", MENU);
      notifyQuiet("WhatsApp", "Carrito creado desde el chat: " + prod.name + ".", "Venta conversacional");
      save(); render(); return;
    }
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
        notify("WhatsApp", "Reservaste tu turno. Te escribimos a las " + state.callback + " con tu pedido ya abierto.", "Fila virtual → asignación de asesor");
        save(); render(); break;
      case "cancelcb":
        state.callback = null; save(); render(); toast("Turno cancelado. ¡Qué bueno que lo resolviste!"); break;
      case "reschedule":
        state.order.slot = "mañana, 8:00 – 12:00 m.";
        notify("WhatsApp", "Listo, reprogramamos tu entrega para mañana entre 8:00 y 12:00 m.", "Reprogramación con transportadora");
        save(); render(); break;
      case "address":
        var a = window.prompt("Nueva dirección de entrega", state.order.address);
        if (a && a.trim()) {
          state.order.address = a.trim();
          notify("Push", "Dirección actualizada. Tu fecha de entrega no cambia.", "Sincronización ERP");
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
    notify("Push", "Cambiamos tu " + it.name.toLowerCase() + " de talla " + prev + " a " + it.size + " antes de empacar. Sin costo y sin trámite de cambio.", "Ventana de edición → bodega");
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
