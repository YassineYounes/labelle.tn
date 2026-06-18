import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Slide } from '../data/site-data';

interface SlideDto {
  id: number;
  image: string;
  alt: string | null;
  link: string | null;
  title: string | null;
  subtitle: string | null;
  text: string | null;
  position: number;
  isActive: boolean;
}

/** Storefront hero slides, configured from the back-office (/api/shop/slides). */
@Injectable({ providedIn: 'root' })
export class SliderService {
  private http = inject(HttpClient);
  private api = environment.apiBase;

  slides(): Observable<Slide[]> {
    return this.http.get<SlideDto[]>(`${this.api}/api/shop/slides`).pipe(
      map((dtos) =>
        dtos.map((dto) => ({
          image: this.asset(dto.image),
          alt: dto.alt ?? '',
          link: dto.link ?? '/',
          title: dto.title ?? '',
          subtitle: dto.subtitle ?? '',
          text: dto.text ?? '',
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
