"use client";

import { useMemo, useState } from "react";
import { OrderForm } from "../components/pedidos/OrderForm";
import { OrdersTable } from "../components/pedidos/OrdersTable";
import { Order, OrderFormData } from "../components/pedidos/types";

const initialFormData: OrderFormData = {
  customer: "",
  product: "",
  quantity: "1",
  salePrice: "",
  status: "Nuevo",
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);

  const totalSales = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.salePrice * order.quantity, 0);
  }, [orders]);

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.customer || !formData.product || !formData.salePrice) {
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customer: formData.customer,
      product: formData.product,
      quantity: Number(formData.quantity || 1),
      salePrice: Number(formData.salePrice),
      status: formData.status,
      createdAt: new Date().toLocaleDateString("es-ES"),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setFormData(initialFormData);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
                Módulo
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Pedidos
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Gestión de ventas y seguimiento operativo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Total: ${totalSales.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              >
                Nuevo Pedido
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.25)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Listado de pedidos</h2>
              <p className="mt-1 text-sm text-slate-600">
                Vista inicial con datos temporales en memoria.
              </p>
            </div>
          </div>

          <OrdersTable orders={orders} />
        </section>
      </main>

      {isOpen ? (
        <OrderForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormData(initialFormData);
            setIsOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
