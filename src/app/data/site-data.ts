export interface MenuItem {
  label: string;
  link: string;
  children?: MenuItem[];
}

export interface Slide {
  image: string;
  alt: string;
  link: string;
  title: string;
  subtitle: string;
  text: string;
}

export interface CategoryBanner {
  image: string;
  alt: string;
  link: string;
  titleLines: string[];
  description: string;
}

export interface Product {
  id: number;
  name: string;
  /** Short name shown on product cards (truncated like the original) */
  cardName: string;
  image: string;
  largeImage: string;
  link: string;
  price: string;
  inStock: boolean;
  reference: string;
  /** Remaining stock, used by the "Dépêchez-vous!" countdown (max 20) */
  stock: number;
  shortDescription: string[];
  description: string[];
  /** URL slug from the API; absent for the legacy static seed data */
  slug?: string;
  /** Original price shown struck-through when a promo price is active */
  oldPrice?: string;
}

export const MENU: MenuItem[] = [
  {
    label: 'Visage',
    link: '/3-visage',
    children: [
      {
        label: 'Peaux',
        link: '/35-peaux',
        children: [
          { label: 'Primer/Fixateur', link: '/38-primerfixateur' },
          { label: 'Fond de teint', link: '/39-fond-de-teint' },
          { label: 'Concealer', link: '/40-concealer' },
          { label: 'Poudre/Bronzer', link: '/41-poudrebronzer' },
          { label: 'Blush/Highlighter', link: '/42-blushhighlighter' },
        ],
      },
      {
        label: 'Yeux',
        link: '/36-yeux',
        children: [
          { label: 'Eyeshadow', link: '/43-eyeshadow' },
          { label: 'Mascara/Eyeliner', link: '/44-mascaraeyeliner' },
        ],
      },
      {
        label: 'Lèvres',
        link: '/37-levres',
        children: [
          { label: 'Gloss / Lip Liner', link: '/45-gloss-lip-liner' },
          { label: 'Brushes', link: '/46-brushes' },
        ],
      },
    ],
  },
  {
    label: 'Corps',
    link: '/9-corps',
    children: [
      { label: 'Skin care', link: '/47-skin-care' },
      { label: 'Body care', link: '/48-body-care' },
      { label: 'Parfum', link: '/49-parfum' },
    ],
  },
  {
    label: 'Cheveux',
    link: '/50-cheveux',
    children: [
      { label: 'Soin cheveux', link: '/51-soin-cheveux' },
      { label: 'Outils pour cheveux', link: '/52-outils-pour-cheveux' },
    ],
  },
  {
    label: 'Accessoires',
    link: '/53-accessoires',
    children: [
      { label: 'Coliers', link: '/54-coliers' },
      { label: 'Bracelets', link: '/55-bracelets' },
      { label: "Boucle d'oreille", link: '/56-boucle-d-oreille' },
    ],
  },
  { label: 'Coffret', link: '/57-coffret' },
];

export const SLIDES: Slide[] = [
  {
    image: 'img/slider/coffret.png',
    alt: 'Coffret makeup',
    link: '/57-coffret',
    title: 'Coffret maquillage',
    subtitle: 'Tous les essentiels',
    text: 'Découvrez notre sélection de coffrets maquillage pour jeunes filles ou jeunes mariées',
  },
  {
    image: 'img/slider/skincare.png',
    alt: 'Skin care',
    link: '/3-visage',
    title: 'Soins visage',
    subtitle: 'Lutter contre vieillissement',
    text: 'Retrouvez tous les soins visage à labelle.tn à petit prix !',
  },
];

export const CATEGORY_BANNERS: CategoryBanner[] = [
  {
    image: 'img/banners/eyeshadow.png',
    alt: 'eyeshadow',
    link: '/43-eyeshadow',
    titleLines: ['Eyeshadow'],
    description: "Accentuez vos yeux en créant de l'ombre et de la profondeur avec nos palettes",
  },
  {
    image: 'img/banners/blush-highlighter.png',
    alt: 'blush highlighter',
    link: '/42-blushhighlighter',
    titleLines: ['Blush &', 'Highlighter'],
    description: 'Donner une bonne mine à votre visage et illuminer le tient en donnant un éclat',
  },
  {
    image: 'img/banners/brushes.png',
    alt: 'brushes',
    link: '/46-brushes',
    titleLines: ['Brushes'],
    description: 'Les outils indispensables pour mettre votre maquillage parfait',
  },
  {
    image: 'img/banners/gloss-lipliner.png',
    alt: 'gloss lipliner',
    link: '/45-gloss-lip-liner',
    titleLines: ['Gloss &', 'Lipliner'],
    description: 'Dessiner le contour des lèvres et accentuer votre lévre par nos choix de rouge à lèvres et gloss',
  },
  {
    image: 'img/banners/poudre-bronzer.png',
    alt: 'poudre bronzer',
    link: '/41-poudrebronzer',
    titleLines: ['Poudre &', 'Branzer'],
    description: "Afiner l'apparence de la peau pour un effet velours et chaleureux",
  },
  {
    image: 'img/banners/fond-de-teint.png',
    alt: 'fond de teint',
    link: '/39-fond-de-teint',
    titleLines: ['Fond de', 'Teint'],
    description: 'Corriger et unifier instantanément votre tient en utilisant notre large choix',
  },
  {
    image: 'img/banners/mascara-eyeliner.png',
    alt: 'mascara eyeliner',
    link: '/44-mascaraeyeliner',
    titleLines: ['Mascara &', 'Eyeliner'],
    description: "Surligner les yeux en colorant les cils et leur donnant plus de longueur ou d'épaisseur",
  },
  {
    image: 'img/banners/concealer.png',
    alt: 'concealer',
    link: '/40-concealer',
    titleLines: ['Concealer'],
    description: 'Utiliser notre large choix de concealer pour camoufler les imperfections et les cernes',
  },
  {
    image: 'img/banners/primer-fixateur.png',
    alt: 'primer fixateur',
    link: '/38-primerfixateur',
    titleLines: ['Primer &', 'Fixateur'],
    description: 'Les produits qui permettent de préparer la peau au maquillage et prolonger sa tenue',
  },
  {
    image: 'img/banners/parfum.png',
    alt: 'parfum',
    link: '/49-parfum',
    titleLines: ['Parfum'],
    description: 'Une variété de fragrances et senteurs pour les femmes et les hommes',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 66,
    name: 'LATTAFA EMAAN 100 ML - EAU DE PARFUM',
    cardName: 'LATTAFA EMAAN 100 ML -..',
    image: 'img/products/lattafa-emaan.jpg',
    largeImage: 'img/products/lattafa-emaan-large.jpg',
    link: '/accueil/66-lattafa-emaan',
    price: '85,000 TND',
    inStock: true,
    reference: '6291108738498',
    stock: 1,
    shortDescription: [
      'Parfum Floral',
      'Caractéristiques spéciales Longue durée',
      'Concentration du parfum Eau de Parfum',
      'Emaan de Lattafa Perfumes est un parfum floral chypré pour hommes et femmes',
    ],
    description: [
      'Marque: Lattafa',
      "Forme de l'article: Liquide",
      "Volume de l'article: 100 millilitres",
      "Notes de tête : bergamote, cassis et fleur d'oranger",
      'Notes de cœur : tubéreuse, jasmin et souci',
      'Notes de fond : vanille, musc, patchouli et bois de cèdre',
      'Convient à tous les temps',
    ],
  },
  {
    id: 67,
    name: 'Mayar Eau de Parfum Spray For Women',
    cardName: 'Mayar Eau de Parfum..',
    image: 'img/products/mayar.jpg',
    largeImage: 'img/products/mayar-large.jpg',
    link: '/accueil/67-mayar',
    price: '80,000 TND',
    inStock: true,
    reference: '6291108732496',
    stock: 4,
    shortDescription: [
      'Parfum Arabe Importé Longue Durée avec des notes de Framboise, de Litchi et de Feuille de Violette - 100ML',
    ],
    description: [
      "Forme de l'article: Liquide",
      "Volume de l'article: 100 millilitres",
      'Parfum: Musc',
      'Caractéristique spéciale: Longue durée',
      'Concentration du parfum: Eau de Parfum',
      '✔Notes de tête : Framboise, litchi et feuille de violette.',
      '✔Notes de cœur : Café, iris, patchouli.',
      '✔Notes de fond : Vanille et musc.',
      'Le parfum est parfait pour être porté en journée comme en soirée et convient à toutes les occasions.',
      'Le parfum est logé dans un flacon élégant et raffiné qui reflète la sophistication du parfum.',
    ],
  },
  {
    id: 68,
    name: 'Yara de Lattafa (100 ml)',
    cardName: 'Yara de Lattafa (100 ml)',
    image: 'img/products/yara.jpg',
    largeImage: 'img/products/yara-large.jpg',
    link: '/accueil/68-yara',
    price: '75,000 TND',
    inStock: true,
    reference: '6291108730515',
    stock: 5,
    shortDescription: ['Parfum Ambre Vanille', 'Parfum personnel Yara pour femme Lattafa (100 ml)'],
    description: [
      'Nom de marque: Lattafa',
      "Format de l'article: Liquidell",
      'Concentration de parfum: Eau de Parfum',
      'Marque : Lattafa',
      'Poids : 100 ml',
      'Rayon : femme',
      'Eau de Parfum Yara pour femme Lattafa 100 ml',
    ],
  },
  {
    id: 69,
    name: 'Very sexy pour femme Eau De Parfum 100ML',
    cardName: 'Very sexy pour femme..',
    image: 'img/products/very-sexy.jpg',
    largeImage: 'img/products/very-sexy-large.jpg',
    link: '/accueil/69-very-sexy',
    price: '45,000 TND',
    inStock: true,
    reference: '6295051048840',
    stock: 6,
    shortDescription: [
      'Ce vaporisateur possède une formule puissante qui vous fera sentir irrésistible, tandis que le format 100 ml assure un plaisir longue durée. Élevez votre féminité avec ce parfum sensuel',
    ],
    description: [
      'Marque: générique',
      "Forme de l'article: Liquide",
      "Volume de l'article: 100 millilitres",
      'Concentration de parfum: Eau de Parfum',
      "Forme de l'article : Liquide",
    ],
  },
  {
    id: 70,
    name: 'Ameerat Al Arab de LATTAFA 100ml',
    cardName: 'Ameerat Al Arab de..',
    image: 'img/products/ameerat-al-arab.jpg',
    largeImage: 'img/products/ameerat-al-arab-large.jpg',
    link: '/accueil/70-ameerat-al-arab',
    price: '65,000 TND',
    inStock: false,
    reference: '6291107456355',
    stock: 0,
    shortDescription: [
      'Eau de Parfum Arabe, Attar Femme, Musc Halal, NOTES : Raisins Secs, Orange, Rose, Jasmin, Ambre',
    ],
    description: [
      'Marque: Lattafa',
      "Forme de l'article: Liquide",
      "Volume de l'article: 100 Millilitres",
      'Parfum: Jasmin, Rose, Musc',
      'Caractéristique spéciale: Longue Durée',
      "Tranche d'âge: Adulte",
      'Marque : Lattafa',
    ],
  },
  {
    id: 71,
    name: 'Lattafa Ajwad Eau De Parfum Spray for Unisex',
    cardName: 'Lattafa Ajwad Eau De..',
    image: 'img/products/lattafa-ajwad.jpg',
    largeImage: 'img/products/lattafa-ajwad-large.jpg',
    link: '/accueil/71-lattafa-ajwad',
    price: '0,000 TND',
    inStock: false,
    reference: '6291108732489',
    stock: 0,
    shortDescription: [
      'Parfum floral, fruité et musqué',
      'Caractéristiques spéciales : portable, format voyage, longue durée',
    ],
    description: [
      'Marque : Lattafa',
      'Entretien : 60ml',
      'Type : Homme, Unisexe, Femme',
      'Composition : Ambre, bergamote, bois de cèdre, cannelle, jasmin, musc, rose, bois de santal, vanille',
      'Famille olfactive : Floral, Oriental, Vanillé',
    ],
  },
  {
    id: 72,
    name: 'Parfum Spécial Nuit Very Sexy 100ML',
    cardName: 'Parfum Spécial Nuit..',
    image: 'img/products/special-nuit.jpg',
    largeImage: 'img/products/special-nuit-large.jpg',
    link: '/accueil/72-special-nuit',
    price: '50,000 TND',
    inStock: true,
    reference: '6290515010548',
    stock: 1,
    shortDescription: [
      'Parfum Spécial Nuit Very Sexy aux senteurs de fleurs blanches et de jasmin sensuel',
      'Le milieu du parfum contient une touche de vanille avec du musc, ce qui le rend plus excitant.',
      "Les principaux composants du parfum sont l'ylang-ylang et la tubéreuse",
      'Un parfum très doux, adapté aux soirées spéciales',
      'Raconter une autre histoire',
    ],
    description: [
      "Forme de l'article: Liquide",
      "Volume de l'article: 100 millilitres",
      'Parfum Frais',
      'Caractéristiques spéciales: Longue durée',
      'Concentration de parfum: Extrait de Parfum',
      'Parfum Spécial Nuit Very Sexy aux senteurs de fleurs blanches et de jasmin sensuel',
      'Le milieu du parfum contient une touche de vanille avec du musc, ce qui le rend plus excitant.',
      "Les principaux composants du parfum sont l'ylang-ylang et la tubéreuse",
      'Un parfum très doux, adapté aux soirées spéciales',
      'Raconter une autre histoire',
    ],
  },
  {
    id: 73,
    name: 'CeraVe SA Smoothing Cleanser with Salicylic Acid',
    cardName: 'CeraVe SA Smoothing..',
    image: 'img/products/cerave.jpg',
    largeImage: 'img/products/cerave-large.jpg',
    link: '/accueil/73-cerave',
    price: '25,000 TND',
    inStock: true,
    reference: '3337875684118',
    stock: 5,
    shortDescription: [
      'Type de peau Sèche',
      'Contient 3 céramides essentiels pour respecter la barrière naturelle de la peau.',
      "Avec de l'acide salicylique, la formule nettoie et exfolie le visage et le corps.",
      "Formulé avec la technologie MVE pour retenir l'humidité, offrant une hydratation 24 heures sur 24.",
      'Convient aux peaux sujettes à la kératose pilaire et au psoriasis.',
      "L'emballage peut varier",
    ],
    description: [
      'Parfum: Sans parfum',
      "Tranche d'âge: Adulte",
      'Type de peau: Sèche',
      'Contient 3 céramides essentiels pour respecter la barrière naturelle de la peau.',
      "Avec de l'acide salicylique, la formule nettoie et exfolie le visage et le corps.",
      'Convient aux peaux sujettes à la kératose pilaire et au psoriasis.',
      "L'emballage peut varier",
    ],
  },
];

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/LaBelle.tn5/',
  instagram: 'https://www.instagram.com/labelle.tn5/?hl=en',
  tiktok: 'https://www.tiktok.com/@labelle.tn',
};
