// loadOrders.test.ts
import { loadOrders } from "../src/utils/loadOrders";

describe("loadOrders sin mocks", () => {
  it("ejecuta setLoading(true) al inicio y setLoading(false) al final", async () => {
    const estados: boolean[] = [];
    const pedidosGuardados: any[][] = [];

    const setOrders = (orders: any[]) => pedidosGuardados.push(orders);
    const setLoading = (loading: boolean) => estados.push(loading);

    await loadOrders(setOrders, setLoading);

    // Verifica que primero se puso en true y al final en false
    expect(estados[0]).toBe(true);
    expect(estados[estados.length - 1]).toBe(false);

    // Verifica que se guardaron los pedidos
    expect(pedidosGuardados[0]).toEqual([{ id: 1, detalle: "Pedido 1" }]);
  });
});
