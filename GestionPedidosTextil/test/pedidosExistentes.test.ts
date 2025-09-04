import { loadOrders } from "../src/utils/loadOrders";
import { render } from "@testing-library/react-native";
import React from "react";

describe("Visualización de Historial", () => {
  it("Poder visualizar los pedidos registrados", async () => {
    const { getByText } = render(<loadOrders />);
  });
});
