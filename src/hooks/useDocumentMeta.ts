import { useEffect } from "react";

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
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (canonicalPath) {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://vivekdoba.com";
      setCanonical(`${origin}${canonicalPath}`);
    }
  }, [title, description, canonicalPath]);
};
