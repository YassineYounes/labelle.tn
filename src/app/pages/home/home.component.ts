import { Component } from '@angular/core';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { CategoryBannersComponent } from '../../components/category-banners/category-banners.component';
import { ProductSliderComponent } from '../../components/product-slider/product-slider.component';
import { CoffretShowcaseComponent } from '../../components/coffret-showcase/coffret-showcase.component';
import { ReassuranceBarComponent } from '../../components/reassurance-bar/reassurance-bar.component';
import { BrandScrollerComponent } from '../../components/brand-scroller/brand-scroller.component';
import { InfoSectionComponent } from '../../components/info-section/info-section.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroSliderComponent,
    CategoryBannersComponent,
    ProductSliderComponent,
    CoffretShowcaseComponent,
    ReassuranceBarComponent,
    BrandScrollerComponent,
    InfoSectionComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
