export function resolveImagePath(img?: string | null): string {
  if (!img) return '';
  const s = img.trim();
  if (s.startsWith('http') || s.startsWith('data:')) return s;

  // If path already contains a known images directory, extract filename and encode it
  const filenameMatch = s.match(/([^\\/]+\\.(png|jpe?g|svg))$/i);
  const filename = filenameMatch ? filenameMatch[1] : null;
    if (filename) {
    const enc = encodeURIComponent(filename);
    if (s.includes('/public/images/') || s.includes('public\\images\\')) return `/images/${enc}`;
    if (s.includes('/scr/images/') || s.includes('scr\\images\\') ) return `/images/${enc}`;
    if (s.includes('/src/images/') || s.includes('src\\images\\') ) return `/images/${enc}`;
    if (s.includes('/images/') || s.includes('images\\')) return `/images/${enc}`;

    // If it's just a filename or other path, prefer /images (served from public)
    return `/images/${enc}`;
  }

  // Fallback: return original string
  return s;
}

// Map known product IDs to their intended public image names
const productIdToImage: Record<string, string> = {
  'p1': '/images/tiffin-plates-12inches.jpeg',
  'p2': '/images/buffet-leaf-plate-14.jpg',
  'p4': '/images/prasadam-round-cups.jpeg',
  'p8': '/images/organic-forest-honey.jpg'
};

export function resolveProductImage(img?: string | null, productId?: string): string {
  const resolved = resolveImagePath(img);
  // If the resolved path is the company logo (placeholder), try to pick by productId
  if (resolved.includes('deepthi-logo') || resolved === '' ) {
    if (productId && productIdToImage[productId]) return productIdToImage[productId];
    // fallback to generic placeholder
    return '/images/deepthi-logo.png';
  }
  return resolved;
}
