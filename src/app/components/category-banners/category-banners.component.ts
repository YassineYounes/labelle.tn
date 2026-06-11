import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORY_BANNERS, CategoryBanner } from '../../data/site-data';

@Component({
  selector: 'app-category-banners',
  imports: [RouterLink],
  templateUrl: './category-banners.component.html',
  styleUrl: './category-banners.component.css',
})
export class CategoryBannersComponent {
  banners: CategoryBanner[] = CATEGORY_BANNERS;
}
