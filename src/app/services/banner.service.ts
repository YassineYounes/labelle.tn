import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryBanner } from '../data/site-data';

interface BannerDto {
  id: number;
  image: string;
  alt: string | null;
  link: string | null;
  title: string | null;
  description: string | null;
  position: number;
  isActive: boolean;
}

/** Storefront category banners, configured from the back-office (/api/shop/banners). */
@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  private api = environment.apiBase;

  banners(): Observable<CategoryBanner[]> {
    return this.http.get<BannerDto[]>(`${this.api}/api/shop/banners`).pipe(
      map((dtos) =>
        dtos.map((dto) => ({
          image: this.asset(dto.image),
          alt: dto.alt ?? '',
          link: dto.link ?? '/',
          // Newlines in the stored title are the display line breaks.
          titleLines: (dto.title ?? '').split('\n').map((l) => l.trim()).filter(Boolean),
          description: dto.description ?? '',
        })),
      ),
    );
  }

  private asset(path: string): string {
    if (/^https?:\/\//.test(path)) {
      return path;
    }
    return `${environment.assetBase}/${path.replace(/^\//, '')}`;
  }
}
