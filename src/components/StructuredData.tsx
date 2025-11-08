import { Helmet } from "react-helmet";
import type { Product } from "@/data/products";

interface ProductStructuredDataProps {
  product: Product;
}

export const ProductStructuredData = ({ product }: ProductStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "url": `https://morefitlyfe.com/programs/${product.sku}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": "M. Stefania Meraklis"
      }
    },
    "brand": {
      "@type": "Brand",
      "name": "MoreFitLyfe"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const OrganizationStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MoreFitLyfe",
    "url": "https://morefitlyfe.com",
    "logo": "https://morefitlyfe.com/assets/logo-icon.jpeg",
    "description": "Εξατομικευμένα προγράμματα προπόνησης δύναμης, powerlifting και διατροφής",
    "founder": {
      "@type": "Person",
      "name": "M. Stefania Meraklis"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "morefitlyfe@gmail.com",
      "contactType": "Customer Service"
    },
    "sameAs": [
      "https://www.instagram.com/mariastefaniameraklis",
      "https://www.tiktok.com/@maria.meraklis"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
