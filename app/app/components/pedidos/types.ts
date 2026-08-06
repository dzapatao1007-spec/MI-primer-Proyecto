export type OrderStatus =
  | "Nuevo"
  | "Confirmado"
  | "Pedido al proveedor"
  | "En tránsito"
  | "Recibido"
  | "Empacado"
  | "Enviado"
  | "Entregado"
  | "Pagado"
  | "Finalizado";

export type Order = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  salePrice: number;
  status: OrderStatus;
  createdAt: string;
};

export type OrderFormData = {
  customer: string;
  product: string;
  quantity: string;
  salePrice: string;
  status: OrderStatus;
};
