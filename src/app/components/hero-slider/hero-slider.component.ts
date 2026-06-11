import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SLIDES, SOCIAL_LINKS, Slide } from '../../data/site-data';

@Component({
  selector: 'app-hero-slider',
  imports: [RouterLink],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.css',
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  slides: Slide[] = SLIDES;
  social = SOCIAL_LINKS;
  current = 0;

  private timer: ReturnType<typeof setInterval> | null = null;
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
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
