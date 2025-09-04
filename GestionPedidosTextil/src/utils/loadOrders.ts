import { databaseService } from "./database";
import { useState } from "react";
import type { PedidoCompleto } from "../types";

const [orders, setOrders] = useState<PedidoCompleto[]>([]);
const [loading, setLoading] = useState(true);

export const loadOrders = async ({}) => {
  try {
    setLoading(true);
    const result = await databaseService.getOrders();
    if (result.success && result.pedidos) {
      setOrders(result.pedidos);
    }
  } finally {
    setLoading(false);
  }
};
