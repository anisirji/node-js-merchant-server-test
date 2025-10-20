import shippingRatesData from '../data/shipping-rates.json';
import { ShippingRate } from '../types';

class ShippingService {
  private rates: any = shippingRatesData;

  calculateRates(
    country: string,
    weight: number, // in grams
    value: number
  ): ShippingRate[] {
    const weightInKg = weight / 1000;
    const countryRates = this.rates[country] || this.rates['international'];

    const rates: ShippingRate[] = [];

    for (const [_service, config] of Object.entries(countryRates)) {
      const rateConfig = config as any;
      const cost = rateConfig.base + rateConfig.perKg * weightInKg;

      rates.push({
        carrier: rateConfig.carrier,
        service: rateConfig.service,
        cost: parseFloat(cost.toFixed(2)),
        estimatedDays: rateConfig.days,
      });
    }

    // Add insurance for high-value items
    const insuranceThreshold = 5000;
    if (value > insuranceThreshold) {
      const insuranceCost = (value - insuranceThreshold) * 0.01; // 1% of value above threshold
      rates.forEach((rate) => {
        rate.cost = parseFloat((rate.cost + insuranceCost).toFixed(2));
      });
    }

    return rates;
  }

  getShippingCost(
    country: string,
    weight: number,
    value: number,
    method: string
  ): number {
    const rates = this.calculateRates(country, weight, value);
    const selected = rates.find(
      (r) => r.service.toLowerCase().includes(method.toLowerCase())
    );

    if (!selected) {
      throw new Error(`Shipping method '${method}' not available for ${country}`);
    }

    return selected.cost;
  }

  validateShippingMethod(country: string, method: string): boolean {
    const countryRates = this.rates[country] || this.rates['international'];
    return Object.values(countryRates).some((config: any) =>
      config.service.toLowerCase().includes(method.toLowerCase())
    );
  }
}

export default new ShippingService();
