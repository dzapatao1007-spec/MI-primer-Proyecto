# Reto ESIC · La Percha · Mi pedido

## 1. Qué pide ESIC (investigación)

No encontré publicadas las bases exactas de este reto. Esto es lo que sí aparece en fuentes públicas sobre los retos de ESIC:

- **Desafío Junior Empresarial (ESIC Colombia):** jóvenes de 16 a 21 años, en equipos, resuelven en un bootcamp de unas 6 horas un reto de innovación abierta que plantea una marca real.
- **Evaluación:** un jurado académico y, en algunas ediciones, también el impacto de la propuesta en redes sociales.
- **Premio:** normalmente una beca del 50% del primer año en ESIC.
- **Criterios que ESIC usa para valorar proyectos (becas de emprendimiento):** necesidad real del cliente, oportunidad, conocimiento de la competencia, viabilidad técnica, comercial y financiera, innovación e impacto.

**Confirma las bases de tu edición con ESIC.** Mientras tanto, la propuesta cubre cada criterio:

| Criterio probable | Cómo lo cubre la propuesta |
|---|---|
| Responde al enunciado | Una app móvil para clientes, después de comprar, pensada para el pico de fin de año |
| "Una sola solución y que funcione" | Una sola app (Mi pedido) con un prototipo que de verdad funciona |
| Necesidad del cliente | El cliente no se queja de esperar: se queja de no saber |
| Innovación | Promesa Percha, ventana de edición, foto del paquete, fila virtual |
| Viabilidad | PWA en 4 semanas, sin tiendas de apps, CDN para aguantar picos |
| Impacto medible | Metas: −50% mensajes "¿dónde está?", CSAT ≥ 4,5 |
| Redes sociales | #MiPercha: calificar y compartir el look a cambio de un 10% |

## 2. La solución en una frase

> **Mi pedido:** la app post-compra de La Percha que avisa antes de que el cliente pregunte, para que el equipo de operaciones atienda solo lo que necesita a una persona.

## 3. Guion del pitch (3 minutos)

1. **Gancho (20 s):** "¿Cuántas veces han escrito '¿dónde está mi pedido?' y nadie les respondió? En diciembre La Percha recibe esa pregunta miles de veces."
2. **Problema (30 s):** los pedidos crecen de forma exponencial, el equipo es el mismo y cada pedido sin noticias se convierte en un mensaje. El cliente se siente ignorado.
3. **Solución (30 s):** una sola app con un solo trabajo: que nadie tenga que preguntar.
4. **Demo en vivo (60 s):** abrir la app, ajustar la talla antes de empacar, pulsar "Demo → Avanzar pedido" (foto del paquete), "Simular retraso" (cupón automático) y mostrar la fila virtual.
5. **Por qué aguanta (20 s):** es una app instalable que se sirve desde una CDN y los avisos salen de una cola. Mil o cien mil clientes a la vez cuestan lo mismo.
6. **Impacto y cierre (20 s):** metas del piloto y la frase final: "En La Percha, tu pedido te avisa antes de que preguntes."

## 4. Archivos

- `percha/index.html`: web de la propuesta con el teléfono interactivo.
- `percha/app/`: prototipo funcional (PWA, funciona sin conexión).
- Para verla en local: `cd percha && python3 -m http.server 8000` y abrir http://localhost:8000.
- Para publicarla: subir la carpeta `percha/` a Vercel, Netlify o GitHub Pages. No necesita build.
