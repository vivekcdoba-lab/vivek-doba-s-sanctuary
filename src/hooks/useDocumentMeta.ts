import { useEffect } from "react";
import { SHARE_IMAGE, SITE_URL } from "@/components/public/PublicSeo";

interface DocumentMetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
}

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const useDocumentMeta = ({ title, description, canonicalPath }: DocumentMetaOptions) => {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", `${SITE_URL}${canonicalPath || "/"}`, "property");
    setMeta("og:image", SHARE_IMAGE, "property");
    setMeta("og:locale", "en_IN", "property");
    setMeta("og:site_name", "Vivek Doba Business Mastery", "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", SHARE_IMAGE);
    if (canonicalPath) {
      setCanonical(`${SITE_URL}${canonicalPath}`);
      let breadcrumb = document.head.querySelector<HTMLScriptElement>('script[data-page-breadcrumb]');
      if (!breadcrumb) {
        breadcrumb = document.createElement('script');
        breadcrumb.type = 'application/ld+json';
        breadcrumb.dataset.pageBreadcrumb = 'true';
        document.head.appendChild(breadcrumb);
      }
      const label = title.split('|')[0]?.trim() || 'Page';
      breadcrumb.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${canonicalPath}` }] });
    }
  }, [title, description, canonicalPath]);
};
