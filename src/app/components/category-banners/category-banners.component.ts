import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CATEGORY_BANNERS, CategoryBanner } from '../../data/site-data';
import { BannerService } from '../../services/banner.service';

@Component({
  selector: 'app-category-banners',
  imports: [RouterLink],
  templateUrl: './category-banners.component.html',
  styleUrl: './category-banners.component.css',
})
export class CategoryBannersComponent implements OnInit {
  /** Seeded with the static banners; replaced by the back-office config on load. */
  banners: CategoryBanner[] = CATEGORY_BANNERS;

  private bannerService = inject(BannerService);

  ngOnInit(): void {
    this.bannerService
      .banners()
      .pipe(catchError(() => of([] as CategoryBanner[])))
      .subscribe((banners) => {
        if (banners.length > 0) {
          this.banners = banners;
        }
      });
  }
}
