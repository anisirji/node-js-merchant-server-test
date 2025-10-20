import productsData from '../data/products.json';
import brandsData from '../data/brands.json';
import { Product, ProductFilters, PaginationParams, PaginationMeta } from '../types';

class ProductService {
  private products: Product[] = productsData as Product[];

  getAllProducts(
    filters: ProductFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): { products: Product[]; meta: PaginationMeta } {
    let filtered = [...this.products];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const variants = new Set<string>([searchLower]);

      // Basic singularization to handle plural queries like "watches"
      if (searchLower.match(/([sxz]|[cs]h)es$/)) {
        variants.add(searchLower.replace(/es$/, ''));
      } else if (searchLower.endsWith('ies')) {
        variants.add(searchLower.replace(/ies$/, 'y'));
      } else if (searchLower.endsWith('s') && !searchLower.endsWith('ss')) {
        variants.add(searchLower.slice(0, -1));
      }

      filtered = filtered.filter((p) => {
        const haystacks = [
          p.name.toLowerCase(),
          p.brand.toLowerCase(),
          p.description.toLowerCase(),
        ];

        return haystacks.some((text) =>
          Array.from(variants).some((needle) => text.includes(needle))
        );
      });
    }

    if (filters.brand && filters.brand.length > 0) {
      const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
      filtered = filtered.filter((p) => brands.includes(p.brand));
    }

    if (filters.category && filters.category.length > 0) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      filtered = filtered.filter((p) =>
        p.categories.some((cat) => categories.includes(cat))
      );
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.priceMax!);
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter((p) => p.rating >= filters.minRating!);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      filtered = filtered.filter((p) => p.tags.some((tag) => tags.includes(tag)));
    }

    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    // Apply pagination
    const page = Math.max(1, pagination.page);
    const limit = Math.min(100, Math.max(1, pagination.limit));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const products = filtered.slice(start, end);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  getProductById(id: string): Product | null {
    return this.products.find((p) => p.id === id) || null;
  }

  getProductBySlug(slug: string): Product | null {
    return this.products.find((p) => p.slug === slug) || null;
  }

  getProductBySku(sku: string): Product | null {
    return this.products.find((p) => p.sku === sku) || null;
  }

  getProductsBySkus(skus: string[]): Product[] {
    return this.products.filter((p) => skus.includes(p.sku));
  }

  getAllBrands() {
    return brandsData;
  }

  getAllCategories() {
    const categoriesSet = new Set<string>();
    this.products.forEach((p) => {
      p.categories.forEach((cat) => categoriesSet.add(cat));
    });

    const categories = Array.from(categoriesSet).map((cat) => ({
      name: cat,
      slug: cat.toLowerCase().replace(/\s+/g, '-'),
      count: this.products.filter((p) => p.categories.includes(cat)).length,
    }));

    return categories;
  }

  getCollections() {
    return [
      {
        id: 'dive-watches',
        name: 'Dive Watches',
        slug: 'dive-watches',
        description: 'Professional dive watches with exceptional water resistance',
        productCount: this.products.filter((p) => p.categories.includes('Dive')).length,
      },
      {
        id: 'luxury-chronographs',
        name: 'Luxury Chronographs',
        slug: 'luxury-chronographs',
        description: 'Precision chronographs from top Swiss manufacturers',
        productCount: this.products.filter((p) => p.categories.includes('Chronograph')).length,
      },
      {
        id: 'dress-watches',
        name: 'Dress Watches',
        slug: 'dress-watches',
        description: 'Elegant timepieces for formal occasions',
        productCount: this.products.filter((p) => p.categories.includes('Dress')).length,
      },
      {
        id: 'bestsellers',
        name: 'Bestsellers',
        slug: 'bestsellers',
        description: 'Our most popular watches',
        productCount: this.products.filter((p) => p.tags.includes('bestseller')).length,
      },
    ];
  }
}

export default new ProductService();
