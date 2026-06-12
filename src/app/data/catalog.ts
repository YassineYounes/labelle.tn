import { MENU, MenuItem, PRODUCTS, Product } from './site-data';
import { CATALOG_PRODUCTS, CATEGORY_PAGES } from './catalog-data';

export const ALL_PRODUCTS: Product[] = [...PRODUCTS, ...CATALOG_PRODUCTS];

export function findProductById(id: number): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export interface CategoryNode {
  id: number;
  name: string;
  link: string;
  parentId: number | null;
  children: { name: string; link: string }[];
}

function idFromLink(link: string): number {
  return parseInt(link.replace(/^\//, ''), 10);
}

function flatten(items: MenuItem[], parentId: number | null, out: Map<number, CategoryNode>): void {
  for (const item of items) {
    const id = idFromLink(item.link);
    if (!isNaN(id)) {
      out.set(id, {
        id,
        name: item.label,
        link: item.link,
        parentId,
        children: (item.children ?? []).map((c) => ({ name: c.label, link: c.link })),
      });
    }
    if (item.children) {
      flatten(item.children, isNaN(id) ? parentId : id, out);
    }
  }
}

const categoryNodes = new Map<number, CategoryNode>();
flatten(MENU, null, categoryNodes);

export function getCategoryNode(id: number): CategoryNode | undefined {
  return categoryNodes.get(id);
}

/** Breadcrumb chain from the root down to (and including) the category itself */
export function getCategoryChain(id: number): CategoryNode[] {
  const chain: CategoryNode[] = [];
  let node = categoryNodes.get(id);
  while (node) {
    chain.unshift(node);
    node = node.parentId !== null ? categoryNodes.get(node.parentId) : undefined;
  }
  return chain;
}

/** Products listed on a category page, in the original "Pertinence" order */
export function getCategoryProducts(id: number): Product[] {
  const page = CATEGORY_PAGES.find((c) => c.id === id);
  if (page) {
    return page.productIds
      .map((pid) => findProductById(pid))
      .filter((p): p is Product => p !== undefined);
  }
  // No scraped listing for this category: fall back to the homepage products as demo content
  return PRODUCTS;
}
