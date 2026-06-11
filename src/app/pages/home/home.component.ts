import { Component } from '@angular/core';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { CategoryBannersComponent } from '../../components/category-banners/category-banners.component';
import { FeaturedProductsComponent } from '../../components/featured-products/featured-products.component';
import { InfoSectionComponent } from '../../components/info-section/info-section.component';

@Component({
  selector: 'app-home',
  imports: [HeroSliderComponent, CategoryBannersComponent, FeaturedProductsComponent, InfoSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
