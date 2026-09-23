import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageCircle, PackageCheck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts, type Product } from '@/hooks/usePublicContent';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';

const formatPrice = (value: number | null) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const orderUrl = (product: Product) => `https://wa.me/919607050111?text=${encodeURIComponent(`Namaste, I would like to order ${product.name}.`)}`;

export default function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  return <div className="bg-background">
    <PublicSeo title="Shop Books & Resources by Vivek Doba" description="Shop books, workbooks and practical resources by Vivek Doba, including the Life’s Golden Triangle Book + Workbook set." path="/shop" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }])]} />
    <section className="border-b border-border bg-course-ivory py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4"><p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><ShoppingBag className="h-4 w-4" /> Books and resources</p><h1 className="max-w-4xl text-4xl font-bold sm:text-5xl">Shop: Books and Resources by Vivek Doba</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Practical resources to help you understand and strengthen your Business, Health and Family.</p></div>
    </section>
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        {isLoading ? <p className="text-muted-foreground">Loading products…</p> : products.length === 0 ? <div className="border border-dashed border-border p-10 text-center"><BookOpen className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-3 text-xl font-bold">More resources coming soon</h2></div> : <>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => <article key={product.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <Link to={`/shop/${product.slug}`} className="block overflow-hidden bg-muted"><img src={product.image_url || product.gallery_images?.[0]} alt={product.name} width="800" height="800" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.03]" /></Link>
              <div className="flex flex-1 flex-col p-5"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">{product.is_preorder ? <PackageCheck className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}{product.is_preorder ? 'Pre-order' : product.stock_status.replace(/_/g, ' ')}</div><h2 className="text-xl font-bold"><Link to={`/shop/${product.slug}`}>{product.name}</Link></h2><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{product.short_description}</p><div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-2xl font-bold text-course-maroon">{formatPrice(product.price_inr)}</p><p className="text-xs text-muted-foreground">{product.gst_included ? 'Inclusive of all taxes' : '+ applicable taxes'}</p></div><Button asChild className="bg-course-saffron text-primary-foreground hover:bg-course-saffron/90"><a href={orderUrl(product)} target="_blank" rel="noopener noreferrer">{product.is_preorder ? 'Pre-book' : 'Buy'} <MessageCircle /></a></Button></div><Link to={`/shop/${product.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">View details <ArrowRight className="h-4 w-4" /></Link></div>
            </article>)}
          </div>
          {products.length === 1 && <p className="mt-8 text-center text-sm text-muted-foreground">More resources coming soon</p>}
        </>}
      </div>
    </section>
  </div>;
}