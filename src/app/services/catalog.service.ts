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

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
}

export interface BrandPage {
  brand: { id: number; name: string; slug: string; logo: string | null };
  products: Product[];
  total: number;
  pages: number;
}

export interface Bundle {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  priceLabel: string;
  cover: string;
  photos: string[];
  itemCount: number;
  items?: { name: string; slug: string; image: string | null; quantity: number }[];
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

  // ---- Brands ----

  /** Active brands that have published products (for the home scroller). */
  brands(): Observable<Brand[]> {
    return this.http
      .get<Brand[]>(`${this.api}/api/shop/brands`)
      .pipe(map((brands) => brands.map((b) => ({ ...b, logo: b.logo ? this.asset(b.logo) : null }))));
  }

  brand(slug: string, page = 1, sort = 'newest'): Observable<BrandPage> {
    return this.http
      .get<Omit<BrandPage, 'products'> & { products: CardDto[] }>(
        `${this.api}/api/shop/brand/${slug}`,
        { params: { page, sort } },
      )
      .pipe(
        map((res) => ({
          ...res,
          brand: { ...res.brand, logo: res.brand.logo ? this.asset(res.brand.logo) : null },
          products: res.products.map((c) => this.toProduct(c)),
        })),
      );
  }

  // ---- Coffrets (bundles) ----

  bundles(): Observable<Bundle[]> {
    return this.http
      .get<any[]>(`${this.api}/api/shop/bundles`)
      .pipe(map((rows) => rows.map((b) => this.toBundle(b))));
  }

  bundle(slug: string): Observable<Bundle> {
    return this.http.get<any>(`${this.api}/api/shop/bundle/${slug}`).pipe(map((b) => this.toBundle(b)));
  }

  private toBundle(b: any): Bundle {
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description ?? null,
      price: b.price,
      priceLabel: this.formatPrice(b.price),
      cover: this.asset(b.cover),
      photos: (b.photos ?? []).map((p: string) => this.asset(p)),
      itemCount: b.itemCount ?? 0,
      items: (b.items ?? []).map((i: any) => ({
        name: i.name,
        slug: i.slug,
        image: i.image ? this.asset(i.image) : null,
        quantity: i.quantity,
      })),
    };
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
    // Gallery ordered with the cover first, then the rest by their API order.
    const gallery = [...(detail.images ?? [])].sort(
      (a, b) => Number(b.isCover) - Number(a.isCover),
    );
    const cover = gallery[0];
    const images = gallery.map((i) => this.asset(i.path));

    return {
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      cardName: dto.cardName,
      image: this.asset(dto.image),
      largeImage: this.asset(cover?.path ?? dto.image),
      images: images.length ? images : [this.asset(cover?.path ?? dto.image)],
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
