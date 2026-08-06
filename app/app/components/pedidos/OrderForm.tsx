"use client";

import { OrderFormData, OrderStatus } from "./types";

type OrderFormProps = {
  formData: OrderFormData;
  onChange: (field: keyof OrderFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const statusOptions: OrderStatus[] = [
  "Nuevo",
  "Confirmado",
  "Pedido al proveedor",
  "En tránsito",
  "Recibido",
  "Empacado",
  "Enviado",
  "Entregado",
  "Pagado",
  "Finalizado",
];

export function OrderForm({ formData, onChange, onSubmit, onCancel }: OrderFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/25 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.3)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
              Nuevo pedido
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Crear pedido</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span>Cliente</span>
            <input
              value={formData.customer}
              onChange={(e) => onChange("customer", e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0"
              placeholder="Nombre del cliente"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span>Producto</span>
            <input
              value={formData.product}
              onChange={(e) => onChange("product", e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0"
              placeholder="Producto"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span>Cantidad</span>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span>Precio de venta</span>
            <input
              type="number"
              min="0"
              value={formData.salePrice}
              onChange={(e) => onChange("salePrice", e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700 sm:col-span-2">
            <span>Estado del pedido</span>
            <select
              value={formData.status}
              onChange={(e) => onChange("status", e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Guardar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
