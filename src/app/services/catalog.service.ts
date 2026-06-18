import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem, Product } from '../data/site-data';

/** Raw product-card shape returned by /api/shop/* endpoints. */
interface CardDto {
  id: number;
  slug: string;
  name: string;
  cardName: string;
  price: number;
  promoPrice: number | null;
  inStock: boolean;
  stock: number;
  image: string | null;
  brand: string | null;
}

interface ProductDto extends CardDto {
  reference: string;
  shortDescription: string | null;
  description: string | null;
  images: { path: string; alt: string | null; isCover: boolean }[];
  categories: { name: string; slug: string }[];
  breadcrumb: { name: string; slug: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
}

interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  children: CategoryDto[];
}

export interface CategoryPage {
  category: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    breadcrumb: { name: string; slug: string }[];
    children: { name: string; slug: string }[];
  };
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  pages: number;
}

const PLACEHOLDER_IMAGE = 'img/products/placeholder.png';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private api = environment.apiBase;

  // ---- Navigation ----

  /** Category tree mapped to the storefront's MenuItem shape (link = /{slug}). */
  menu(): Observable<MenuItem[]> {
    return this.http
      .get<CategoryDto[]>(`${this.api}/api/shop/categories`)
      .pipe(map((tree) => tree.map((node) => this.toMenuItem(node))));
  }

  // ---- Listings ----

  featured(limit = 8): Observable<Product[]> {
    return this.http
      .get<CardDto[]>(`${this.api}/api/shop/featured`, { params: { limit } })
      .pipe(map((cards) => cards.map((c) => this.toProduct(c))));
  }

  listing(kind: 'new' | 'best' | 'promo', page = 1, limit = 12): Observable<SearchResult> {
    return this.http
      .get<{ products: CardDto[]; total: number; pages: number }>(
        `${this.api}/api/shop/listing/${kind}`,
        { params: { page, limit } },
      )
      .pipe(map((res) => ({ products: res.products.map((c) => this.toProduct(c)), total: res.total, pages: res.pages })));
  }

  search(query: string, page = 1, limit = 12): Observable<SearchResult> {
    return this.http
      .get<{ products: CardDto[]; total: number; pages: number }>(`${this.api}/api/shop/search`, {
        params: { q: query, page, limit },
      })
      .pipe(map((res) => ({ products: res.products.map((c) => this.toProduct(c)), total: res.total, pages: res.pages })));
  }

  // ---- Category & product pages ----

  category(slug: string, page = 1, sort = 'newest'): Observable<CategoryPage> {
    return this.http
      .get<Omit<CategoryPage, 'products'> & { products: CardDto[] }>(
        `${this.api}/api/shop/category/${slug}`,
        { params: { page, sort } },
      )
      .pipe(map((res) => ({ ...res, products: res.products.map((c) => this.toProduct(c)) })));
  }

  product(slug: string): Observable<Product> {
    return this.http
      .get<ProductDto>(`${this.api}/api/shop/product/${slug}`)
      .pipe(map((dto) => this.toProduct(dto)));
  }

  // ---- Persistent wishlist (authenticated; token added by the interceptor) ----

  wishlist(): Observable<Product[]> {
    return this.http
      .get<CardDto[]>(`${this.api}/api/account/wishlist`)
      .pipe(map((cards) => cards.map((c) => this.toProduct(c))));
  }

  addToWishlist(productId: number): Observable<Product[]> {
    return this.http
      .post<CardDto[]>(`${this.api}/api/account/wishlist`, { productId })
      .pipe(map((cards) => cards.map((c) => this.toProduct(c))));
  }

  removeFromWishlist(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/api/account/wishlist/${productId}`);
  }

  mergeWishlist(ids: number[]): Observable<Product[]> {
    return this.http
      .post<CardDto[]>(`${this.api}/api/account/wishlist/merge`, { ids })
      .pipe(map((cards) => cards.map((c) => this.toProduct(c))));
  }

  // ---- Adapters ----

  private toMenuItem(node: CategoryDto): MenuItem {
    return {
      label: node.name,
      link: `/${node.slug}`,
      children: node.children.length ? node.children.map((c) => this.toMenuItem(c)) : undefined,
    };
  }

  private toProduct(dto: CardDto | ProductDto): Product {
    const detail = dto as Partial<ProductDto>;
    const effectivePrice = dto.promoPrice ?? dto.price;
    const cover = detail.images?.find((i) => i.isCover) ?? detail.images?.[0];

    return {
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      cardName: dto.cardName,
      image: this.asset(dto.image),
      largeImage: this.asset(cover?.path ?? dto.image),
      link: `/accueil/${dto.slug}`,
      price: this.formatPrice(effectivePrice),
      oldPrice: dto.promoPrice != null ? this.formatPrice(dto.price) : undefined,
      inStock: dto.inStock,
      reference: detail.reference ?? '',
      stock: dto.stock,
      shortDescription: this.toLines(detail.shortDescription),
      description: this.toLines(detail.description),
    };
  }

  private asset(path: string | null | undefined): string {
    if (!path) {
      return PLACEHOLDER_IMAGE;
    }
    if (/^https?:\/\//.test(path)) {
      return path;
    }
    return `${environment.assetBase}/${path.replace(/^\//, '')}`;
  }

  private formatPrice(value: number): string {
    return value.toFixed(3).replace('.', ',') + ' TND';
  }

  private toLines(text: string | null | undefined): string[] {
    if (!text) {
      return [];
    }
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
