import formatDate from "../src/screens/OrdersScreen";

describe("El formato de la fecha", () => {
  it("devuelve la fecha formateada en español", () => {
    const result = formatDate("2024-05-15T14:30:00Z");
    expect(result).toBe("15 may 2024, 11:30");
  });
});
