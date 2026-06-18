import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { SLIDES, SOCIAL_LINKS, Slide } from '../../data/site-data';
import { SliderService } from '../../services/slider.service';

@Component({
  selector: 'app-hero-slider',
  imports: [RouterLink],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.css',
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  /** Seeded with the static slides; replaced by the back-office config on load. */
  slides: Slide[] = SLIDES;
  social = SOCIAL_LINKS;
  current = 0;

  private timer: ReturnType<typeof setInterval> | null = null;
  private platformId = inject(PLATFORM_ID);
  private slider = inject(SliderService);

  ngOnInit(): void {
    // Load the configurable slides; keep the static set as a fallback if the
    // request fails or returns nothing.
    this.slider
      .slides()
      .pipe(catchError(() => of([] as Slide[])))
      .subscribe((slides) => {
        if (slides.length > 0) {
          this.slides = slides;
          this.current = 0;
        }
      });

    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  next(): void {
    this.current = (this.current + 1) % this.slides.length;
    this.restartAutoplay();
  }

  prev(): void {
    this.current = (this.current - 1 + this.slides.length) % this.slides.length;
    this.restartAutoplay();
  }

  private startAutoplay(): void {
    this.timer = setInterval(() => {
      this.current = (this.current + 1) % this.slides.length;
    }, 6000);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restartAutoplay(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }
}
