import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../data/site-data';
import { CatalogService } from '../../services/catalog.service';

interface SitemapLink {
  label: string;
  link: string;
}

@Component({
  selector: 'app-sitemap',
  imports: [RouterLink],
  templateUrl: './sitemap.component.html',
  styleUrl: './sitemap.component.css',
})
export class SitemapComponent {
  menu: MenuItem[] = [];

  constructor(catalog: CatalogService) {
    catalog.menu().subscribe((menu) => (this.menu = menu));
  }

  offers: SitemapLink[] = [
    { label: 'Nouveaux produits', link: '/nouveaux-produits' },
    { label: 'Meilleures ventes', link: '/meilleures-ventes' },
    { label: 'Promotions', link: '/promotions' },
  ];

  account: SitemapLink[] = [
    { label: 'Se connecter', link: '/mon-compte' },
    { label: 'Créer un nouveau compte', link: '/mon-compte' },
  ];

  pages: SitemapLink[] = [
    { label: 'Livraison', link: '/content/1-livraison' },
    { label: "Termes et conditions d'utilisation", link: '/content/3-termes-et-conditions-d-utilisation' },
    { label: 'Contactez-nous', link: '/nous-contacter' },
    { label: 'Plan du site', link: '/plan-site' },
  ];
}
