import productService from './product.service';

class InventoryService {
  checkAvailability(sku: string): {
    sku: string;
    available: boolean;
    quantity: number;
    leadTime: string;
  } {
    const product = productService.getProductBySku(sku);

    if (!product) {
      throw new Error(`Product with SKU ${sku} not found`);
    }

    return {
      sku,
      available: product.stock > 0,
      quantity: product.stock,
      leadTime: product.stock > 0 ? 'In Stock - Ships within 1-2 business days' : 'Out of Stock - 4-6 weeks',
    };
  }

  checkMultiple(skus: string[]): Array<{
    sku: string;
    available: boolean;
    quantity: number;
    leadTime: string;
  }> {
    return skus.map((sku) => this.checkAvailability(sku));
  }

  reserveStock(items: Array<{ sku: string; quantity: number }>): boolean {
    // In a real system, this would actually reserve stock
    // For demo, we just verify availability
    for (const item of items) {
      const product = productService.getProductBySku(item.sku);
      if (!product || product.stock < item.quantity) {
        return false;
      }
    }
    return true;
  }

  getLowStockProducts(threshold: number = 5) {
    const { products } = productService.getAllProducts({}, { page: 1, limit: 1000 });
    return products.filter((p) => p.stock > 0 && p.stock <= threshold);
  }
}

export default new InventoryService();
