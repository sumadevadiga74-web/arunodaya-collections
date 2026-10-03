"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "./Header/Header";

/* =========================================================
   PRODUCTS
========================================================= */

const PRODUCTS_QUERY = gql`
  query Products($page: Int!, $limit: Int!) {
    products(page: $page, limit: $limit) {
      products {
        id
        name
        status
        subTitle
        description
        categories

        brand {
          id
          name
        }

        mainMedia {
          type
          url
          publicId
        }

        images {
          type
          url
          publicId
        }

        items {
          price
          stock
          size
          colour

          images {
            type
            url
            publicId
          }
        }
      }
    }
  }
`;

/* =========================================================
   WISHLIST
========================================================= */

const WISHLIST_QUERY = gql`
  query Wishlists {
    wishlists {
      id
      userId
      productId
      status
    }
  }
`;

const CREATE_WISHLIST = gql`
  mutation CreateWishlist(
    $userId: String!
    $productId: String!
  ) {
    createWishlist(
      userId: $userId
      productId: $productId
    ) {
      id
      userId
      productId
      status
    }
  }
`;

/* =========================================================
   TYPES
========================================================= */

type ProductMedia = {
  type?: string | null;
  url?: string | null;
  publicId?: string | null;
};

type ProductBrand = {
  id: string;
  name: string;
};

type ProductItem = {
  price?: number | null;
  stock?: number | null;
  size?: string | null;
  colour?: string | null;
  images?: ProductMedia[];
};

type Product = {
  id: string;
  name: string;
  status?: string | null;
  subTitle?: string | null;
  description?: string | null;

  categories?: string[];

  brand?: ProductBrand | null;

  mainMedia?: ProductMedia[];

  images?: ProductMedia[];

  items?: ProductItem[];
};

/* =========================================================
   HERO BANNERS
========================================================= */

const banners = [
  {
    title: "Party Wear Shirts",
    subtitle: "Prebooking Started Now",
    button: "Prebook Now",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=Men",
  },
  {
    title: "Coord Sets",
    subtitle: "Buy 1 Get 1 Offer",
    button: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=Women",
  },
  {
    title: "Trendy Crop Top Jacket Set",
    subtitle: "Stylish Crop Top Sets",
    button: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=Western%20Wear",
  },
  {
    title: "Men's Casual Wear",
    subtitle: "Comfort Meets Style",
    button: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=Men",
  },
  {
    title: "Western Wear",
    subtitle: "25% Discount for Subscribers",
    button: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=Western%20Wear",
  },
  {
    title: "Farzi Salwar Set",
    subtitle: "Premium Full Set",
    button: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=Women",
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    name: "Women",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Men",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Kids",
    image:
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Sarees",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Western Wear",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Ethnic Wear",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=85",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price: number) {
  return `&#8377;${Number(price || 0).toLocaleString("en-IN")}`;
}

function getProductImage(product: Product) {
  // 1. Product main media
  const mainImage = product.mainMedia?.find(
    (image) =>
      image.type !== "video" &&
      !!image.url
  );

  if (mainImage?.url) {
    return mainImage.url;
  }

  // 2. Product global images
  const globalImage = product.images?.find(
    (image) =>
      image.type !== "video" &&
      !!image.url
  );

  if (globalImage?.url) {
    return globalImage.url;
  }

  // 3. Variant images
  const variantImage = product.items
    ?.flatMap((item) => item.images || [])
    .find(
      (image) =>
        image.type !== "video" &&
        !!image.url
    );

  return variantImage?.url || "";
}

function getProductPrice(product: Product) {
  const firstItem = product.items?.[0];

  return Number(firstItem?.price ?? 0);
}

function getProductMrp(product: Product) {
  const firstItem = product.items?.[0];

  return Number(firstItem?.price ?? 0);
}

function getProductStock(product: Product) {
  return (
    product.items?.reduce(
      (total, item) =>
        total + Number(item.stock || 0),
      0
    ) ?? 0
  );
}

function getProductCategory(product: Product) {
  return (
    product.categories?.[0] ||
    "Clothing"
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CustomerHome() {
  const [createWishlist] =
    useMutation<any>(CREATE_WISHLIST);

  const [wishlistProducts, setWishlistProducts] =
    useState<string[]>([]);

  /* =======================================================
     WISHLIST QUERY
  ======================================================= */

  const { data: wishlistData } = useQuery<{
    wishlists: {
      productId: string;
      status?: string | null;
    }[];
  }>(WISHLIST_QUERY, {
    fetchPolicy: "network-only",
    skip:
      typeof window === "undefined" ||
      !localStorage.getItem("authUser"),
  });

  useEffect(() => {
    const ids =
      wishlistData?.wishlists
        ?.filter(
          (item) =>
            item.status !== "inactive"
        )
        .map(
          (item) => item.productId
        ) ?? [];

    setWishlistProducts(ids);
  }, [wishlistData]);

  /* =======================================================
     PRODUCT QUERY
  ======================================================= */

  const {
    data,
    loading,
    error: productsError,
  } = useQuery<{
    products: {
      products: Product[];
    };
  }>(PRODUCTS_QUERY, {
    variables: {
      page: 1,
      limit: 12,
    },
    fetchPolicy: "network-only",
  });

  const allProducts =
    data?.products?.products ?? [];

  /*
    Only published products should appear
    on the customer-facing Home page.
  */
  const products = allProducts
    .filter(
      (product) =>
        !product.status ||
        product.status === "published"
    )
    .slice(0, 8);

  /* =======================================================
     ADD TO WISHLIST
  ======================================================= */

  const handleAddToWishlist = async (
    productId: string
  ) => {
    try {
      const authUser =
        localStorage.getItem("authUser");

      if (!authUser) {
        window.location.href =
          "/customer-login";
        return;
      }

      const user = JSON.parse(authUser);

      if (!user?.id) {
        window.location.href =
          "/customer-login";
        return;
      }

      await createWishlist({
        variables: {
          userId: user.id,
          productId,
        },
      });

      setWishlistProducts((current) => {
        if (current.includes(productId)) {
          return current;
        }

        return [
          ...current,
          productId,
        ];
      });

      alert(
        "Product added to your wishlist ❤️"
      );
    } catch (error: any) {
      console.error(
        "Wishlist error:",
        error
      );

      alert(
        error?.message ||
          "Unable to add product to wishlist"
      );
    }
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <main className="min-h-screen bg-white text-[#172033]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header />

      {/* =====================================================
          PROMOTIONAL HERO
      ===================================================== */}

      <section className="bg-[#F8F9FB]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">

          <div className="grid gap-4 lg:grid-cols-2">

            {banners
              .slice(0, 2)
              .map((banner) => (
                <div
                  key={banner.title}
                  className="group relative h-[390px] overflow-hidden rounded-2xl bg-[#0B1F3A] sm:h-[450px]"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/65 to-transparent" />

                  <div className="absolute inset-0 flex items-center p-7 sm:p-10">
                    <div className="max-w-sm">

                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">
                        Arunodaya Collections
                      </p>

                      <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
                        {banner.title}
                      </h1>

                      <p className="mt-4 text-sm font-medium text-white/80 sm:text-base">
                        {banner.subtitle}
                      </p>

                      <Link
                        href={banner.link}
                        className="mt-7 inline-flex rounded-full bg-[#C9A227] px-6 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e0bb38]"
                      >
                        {banner.button}

                        <span className="ml-2">
                          →
                        </span>
                      </Link>

                    </div>
                  </div>
                </div>
              ))}

          </div>

          {/* SMALL PROMOTION CARDS */}

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">

            {banners
              .slice(2)
              .map((banner) => (
                <Link
                  key={banner.title}
                  href={banner.link}
                  className="group relative h-48 overflow-hidden rounded-xl bg-[#0B1F3A]"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">

                    <h2 className="font-serif text-lg font-semibold text-white">
                      {banner.title}
                    </h2>

                    <p className="mt-1 text-xs text-[#C9A227]">
                      {banner.subtitle}
                    </p>

                    <span className="mt-2 inline-block text-xs font-bold text-white">
                      {banner.button} →
                    </span>

                  </div>
                </Link>
              ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          SHOP BY CATEGORY
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">

        <div className="text-center">

          <p className="text-xs font-bold tracking-[0.25em] text-[#C9A227]">
            SHOP BY CATEGORY
          </p>

          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#0B1F3A] sm:text-4xl">
            Explore Our Clothing
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#172033]/60">
            Discover clothing collections for
            women, men and kids, from traditional
            ethnic wear to modern western styles.
          </p>

        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/shop?category=${encodeURIComponent(
                category.name
              )}`}
              className="group text-center"
            >

              <div className="aspect-square overflow-hidden rounded-full border-4 border-[#C9A227]/15 bg-[#F8F9FB]">

                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

              </div>

              <h3 className="mt-4 font-serif text-lg font-semibold text-[#0B1F3A]">
                {category.name}
              </h3>

              <p className="mt-1 text-xs font-bold text-[#C9A227]">
               Shop Now <span aria-hidden="true">&rarr;</span>
              </p>

            </Link>
          ))}

        </div>

      </section>

      {/* =====================================================
          NEW ARRIVALS
      ===================================================== */}

      <section className="border-y border-[#0B1F3A]/5 bg-[#F8F9FB] py-14 sm:py-18">

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs font-bold tracking-[0.25em] text-[#C9A227]">
                NEW ARRIVALS
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#0B1F3A] sm:text-4xl">
                Fresh Styles For You
              </h2>

              <p className="mt-2 text-sm text-[#172033]/60">
                Explore the latest clothing added
                to our collection.
              </p>

            </div>

            <Link
              href="/shop"
              className="hidden text-sm font-bold text-[#0B1F3A] transition hover:text-[#C9A227] sm:block"
            >
            View All <span aria-hidden="true">&rarr;</span>
            </Link>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-xl bg-white"
                  >

                    <div className="aspect-[4/5] animate-pulse bg-[#e9ebef]" />

                    <div className="space-y-3 p-4">

                      <div className="h-4 animate-pulse rounded bg-[#e9ebef]" />

                      <div className="h-4 w-1/2 animate-pulse rounded bg-[#e9ebef]" />

                    </div>
                  </div>
                )
              )}

            </div>
          )}

          {/* API ERROR */}

          {!loading && productsError && (
            <div className="mt-9 rounded-xl border border-red-200 bg-white px-6 py-10 text-center">

              <h3 className="font-serif text-xl font-semibold text-[#0B1F3A]">
                Unable to load products
              </h3>

              <p className="mt-2 text-sm text-red-500">
                {productsError.message}
              </p>

            </div>
          )}

          {/* PRODUCTS */}

          {!loading &&
            !productsError &&
            products.length > 0 && (
              <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                {products.map((product) => {

                  const isWishlisted =
                    wishlistProducts.includes(
                      product.id
                    );

                  const image =
                    getProductImage(product);

                  const price =
                    getProductPrice(product);

                  const mrp =
                    getProductMrp(product);

                  const stock =
                    getProductStock(product);

                  const category =
                    getProductCategory(product);

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >

                      {/* IMAGE */}

                      <div className="relative overflow-hidden bg-[#eeeae2]">

                        <Link
                          href={`/product/${product.id}`}
                        >

                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex aspect-[4/5] items-center justify-center text-sm text-[#172033]/50">
                              No image
                            </div>
                          )}

                        </Link>

                        {/* NEW BADGE */}

                        <div className="absolute left-3 top-3 z-10 rounded-md bg-[#C9A227] px-2 py-1 text-[10px] font-bold text-[#0B1F3A]">
                          NEW
                        </div>

                        {/* WISHLIST */}

                        <button
                          type="button"
                          aria-label={
                            isWishlisted
                              ? "Added to wishlist"
                              : "Add to wishlist"
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            if (!isWishlisted) {
                              handleAddToWishlist(
                                product.id
                              );
                            }
                          }}
                          className={`absolute right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full text-3xl shadow-lg transition ${
                            isWishlisted
                              ? "bg-white text-[#E91E63]"
                              : "bg-white/95 text-[#0B1F3A] hover:bg-[#E91E63] hover:text-white"
                          }`}
                        >
                          {isWishlisted
                            ? "♥"
                            : "♡"}
                        </button>

                      </div>

                      {/* DETAILS */}

                      <div className="p-4">

                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#C9A227]">
                          {category}
                        </p>

                        <Link
                          href={`/product/${product.id}`}
                        >

                          <h3 className="line-clamp-2 min-h-[44px] font-medium text-[#0B1F3A] hover:text-[#C9A227]">
                            {product.name}
                          </h3>

                        </Link>

                        <p className="mt-2 line-clamp-1 text-xs text-[#172033]/50">
                          {product.subTitle ||
                            product.description ||
                            "Quality clothing from Arunodaya Collections"}
                        </p>

                        {/* PRICE */}

                        <div className="mt-4 flex items-center gap-2">

                          <span className="text-lg font-bold text-[#0B1F3A]">
                            {formatPrice(price)}
                          </span>

                          {mrp > price &&
                            mrp > 0 && (
                              <span className="text-xs text-[#172033]/40 line-through">
                                {formatPrice(mrp)}
                              </span>
                            )}

                        </div>

                        {/* STOCK / BRAND */}

                        <div className="mt-3 flex items-center justify-between text-[10px] text-[#172033]/50">

                          <span>
                            {stock > 0
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>

                          <span>
                            {product.brand?.name ||
                              "Arunodaya"}
                          </span>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            !productsError &&
            products.length === 0 && (
              <div className="mt-9 rounded-xl border border-[#0B1F3A]/10 bg-white px-6 py-14 text-center">

                <h3 className="font-serif text-xl font-semibold text-[#0B1F3A]">
                  New arrivals coming soon
                </h3>

                <p className="mt-2 text-sm text-[#172033]/60">
                  Our latest clothing collections
                  will appear here.
                </p>

              </div>
            )}

          <Link
            href="/shop"
            className="mx-auto mt-8 flex w-fit rounded-full border border-[#0B1F3A]/20 px-6 py-3 text-sm font-bold text-[#0B1F3A] sm:hidden"
          >
            View All Products →
          </Link>

        </div>

      </section>

      {/* =====================================================
          SPECIAL OFFER
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">

        <div className="relative overflow-hidden rounded-2xl bg-[#0B1F3A] px-7 py-12 sm:px-12">

          <div className="relative z-10 max-w-xl">

            <p className="text-xs font-bold tracking-[0.25em] text-[#C9A227]">
              SPECIAL OFFER
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
              Great Styles.
              <br />

              <span className="text-[#C9A227]">
                Great Prices.
              </span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              Shop selected clothing collections
              from Arunodaya Collections and
              discover quality fashion at attractive
              prices.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-full bg-[#C9A227] px-7 py-3.5 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e0bb38]"
            >
              Shop Clothing

              <span className="ml-2">
                →
              </span>
            </Link>

          </div>

          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[45px] border-[#C9A227]/10" />

          <div className="absolute -bottom-32 right-40 h-80 w-80 rounded-full border-[50px] border-white/5" />

        </div>

      </section>

      {/* =====================================================
          WHY CHOOSE ARUNODAYA
      ===================================================== */}

      <section className="bg-[#F3F0E9] py-14 sm:py-18">

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="text-center">

            <p className="text-xs font-bold tracking-[0.25em] text-[#C9A227]">
              WHY CHOOSE ARUNODAYA
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#0B1F3A] sm:text-4xl">
              Quality Fashion · Trusted Retail
            </h2>

          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B1F3A] text-xl text-[#C9A227]">
                ★
              </div>

              <h3 className="mt-4 font-semibold text-[#0B1F3A]">
                Quality Clothing
              </h3>

              <p className="mt-1 text-xs text-[#172033]/60">
                Carefully selected styles
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B1F3A] text-xl text-[#C9A227]">
                🚚
              </div>

              <h3 className="mt-4 font-semibold text-[#0B1F3A]">
                Free Delivery
              </h3>

              <p className="mt-1 text-xs text-[#172033]/60">
                Available in Davanagere
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B1F3A] text-xl text-[#C9A227]">
                ↻
              </div>

              <h3 className="mt-4 font-semibold text-[#0B1F3A]">
                Easy Exchange
              </h3>

              <p className="mt-1 text-xs text-[#172033]/60">
                7 Days Easy Exchange
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B1F3A] text-xl text-[#C9A227]">
                ✓
              </div>

              <h3 className="mt-4 font-semibold text-[#0B1F3A]">
                Trusted Since 2006
              </h3>

              <p className="mt-1 text-xs text-[#172033]/60">
                Fashion for generations
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#0B1F3A] text-white">

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}

          <div>

            <img
              src="/logo.png"
              alt="Arunodaya Collections"
              className="h-16 w-auto object-contain"
            />

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
              Quality Fashion · Trusted Retail
            </p>

            <p className="mt-2 max-w-xs text-sm leading-6 text-white/55">
              Discover premium ethnic wear,
              western fashion, men's and kids'
              wear.
            </p>

          </div>

          {/* CUSTOMER CARE */}

          <div>

            <h3 className="font-semibold text-[#C9A227]">
              CUSTOMER CARE
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/65">

              <Link
                href="/contact"
                className="block transition hover:text-white"
              >
                Stores & Contact
              </Link>

              <Link
                href="/orders"
                className="block transition hover:text-white"
              >
                Track Order
              </Link>

              <Link
                href="/basket"
                className="block transition hover:text-white"
              >
                My Bag
              </Link>

            </div>

          </div>

          {/* POLICIES */}

          <div>

            <h3 className="font-semibold text-[#C9A227]">
              POLICIES
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/65">

              <Link
                href="/privacy-policy"
                className="block transition hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="block transition hover:text-white"
              >
                Terms & Conditions
              </Link>

              <Link
                href="/refund-policy"
                className="block transition hover:text-white"
              >
                Refund Policy
              </Link>

              <Link
                href="/shipping-policy"
                className="block transition hover:text-white"
              >
                Shipping Policy
              </Link>

            </div>

          </div>

          {/* CONTACT */}

          <div>

            <h3 className="font-semibold text-[#C9A227]">
              CONTACT
            </h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">

              <p>
                Email:
                <br />

                <a
                  href="mailto:arunodayacollections25@gmail.com"
                  className="transition hover:text-white"
                >
                  arunodayacollections25@gmail.com
                </a>
              </p>

              <p>
                Phone:
                <br />

                <a
                  href="tel:+918073033273"
                  className="transition hover:text-white"
                >
                  +91 80730 33273
                </a>
              </p>

              <p>
                Davanagere, Karnataka, India
              </p>

            </div>

          </div>

        </div>

        {/* COPYRIGHT */}

        <div className="border-t border-white/10">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-5 text-center text-xs text-white/45">

            <p>
              © 2006 - 2026 Arunodaya Collections.
              All rights reserved.
            </p>

            <p>
              Technology Partner: CREATOR.EXPRESS
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}