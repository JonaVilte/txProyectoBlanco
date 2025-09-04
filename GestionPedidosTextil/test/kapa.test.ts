// test/loadOrders.test.ts
import { loadOrders } from "../src/utils/loadOrders"; // ajusta la ruta
import { databaseService } from "../src/utils/database";

describe("loadOrders", () => {
  const setOrdersMock = jest.fn();
  const setLoadingMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carga pedidos exitosamente y actualiza estados", async () => {
    const pedidosMock = [
      { id: "1", usuario_id: { nombre: "Juan" }, estado: "pendiente", fecha_emision: "2025-08-31T15:30:00Z", total: 100, observaciones: [] },
    ];

    (databaseService.getOrders as jest.Mock) = jest.fn().mockResolvedValue({
      success: true,
      pedidos: pedidosMock,
    });

    await loadOrders({ setOrders: setOrdersMock, setLoading: setLoadingMock });

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setOrdersMock).toHaveBeenCalledWith(pedidosMock);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });
});
