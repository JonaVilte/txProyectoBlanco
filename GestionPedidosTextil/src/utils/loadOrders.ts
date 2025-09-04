// src/utils/loadOrders.ts
import { databaseService } from "./database";

export const loadOrders = async ({
  setOrders,
  setLoading,
}: {
  setOrders: (orders: any[]) => void;
  setLoading: (loading: boolean) => void;
}) => {
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
