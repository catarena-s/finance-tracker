import { apiClient } from "./client";
import type { Currency, ExchangeRate } from "@/types/api";

export const currenciesApi = {
  async getAll(): Promise<Currency[]> {
    const res = await apiClient.get<Currency[]>("/currencies/");
    return res.data;
  },

  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): Promise<ExchangeRate> {
    const res = await apiClient.get<ExchangeRate>(
      "/currencies/exchange-rate",
      {
        params: {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate_date: date,
        },
      }
    );
    return res.data;
  },
};
