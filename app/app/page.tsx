type StatCardProps = {
  label: string;
  value: string;
  description: string;
};

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.25)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </article>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Home() {
  const priorities = [
    "Confirmar pedidos pendientes.",
    "Pedir productos al proveedor.",
    "Cobrar pedidos entregados.",
    "Resolver cuellos de botella.",
    "Detectar oportunidades de crecimiento.",
  ];

  const stats = [
    { label: "Pedidos hoy", value: "24", description: "+8% vs ayer" },
    { label: "Ventas hoy", value: "$3.840", description: "Promedio estable" },
    { label: "Ganancia del día", value: "$1.120", description: "Margen saludable" },
    { label: "Pedidos pendientes", value: "11", description: "Requieren seguimiento" },
    { label: "Pedidos en tránsito", value: "7", description: "2 llegan hoy" },
    { label: "Tiempo promedio", value: "2.4h", description: "Respuesta a clientes" },
  ];

  const pipeline = [
    { stage: "Nuevos", value: "12" },
    { stage: "Confirmados", value: "9" },
    { stage: "Proveedor", value: "6" },
    { stage: "En tránsito", value: "4" },
    { stage: "Empacando", value: "3" },
    { stage: "Enviados", value: "2" },
    { stage: "Entregados", value: "18" },
  ];

  const alerts = [
    "Pedido detenido hace 2 días.",
    "Cliente esperando respuesta.",
    "Producto sin stock.",
    "Pedido entregado pendiente de pago.",
  ];

  const tasks = [
    "Revisar inventario de prendas destacadas",
    "Confirmar pagos de entregas del día",
    "Actualizar catálogo para Instagram",
    "Responder mensajes pendientes de WhatsApp",
  ];

  const growth = [
    { label: "Margen promedio", value: "63%" },
    { label: "Clientes nuevos", value: "18" },
    { label: "Tiempo promedio de respuesta", value: "1.8h" },
    { label: "Productos más vendidos", value: "Jean negro" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
              Centro de mando
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              JARVIS ERP
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Buenos días, Daniel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg">
              🔔
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              D
            </div>
          </div>
        </header>

        <SectionCard title="🎯 Prioridad del día">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
                  Asistente de IA
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
                  Hoy tu prioridad es cerrar operaciones con claridad y velocidad.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                  Estas son las acciones que merece la mayor atención para mantener el negocio en movimiento.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                Estado general: estable
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {priorities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-slate-950" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <SectionCard title="Estado de pedidos">
          <div className="flex flex-col gap-3 overflow-x-auto pb-2 md:flex-row md:items-center md:justify-between">
            {pipeline.map((step, index) => (
              <div key={step.stage} className="flex min-w-[120px] flex-col items-center text-center">
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                  {step.value}
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">{step.stage}</p>
                {index < pipeline.length - 1 ? (
                  <div className="mt-3 text-slate-400">↓</div>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Alertas">
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  • {alert}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Tareas pendientes">
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>

        <SectionCard title="Indicadores de crecimiento">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {growth.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
