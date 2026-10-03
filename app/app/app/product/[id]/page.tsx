"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Header from "../../../../components/Header/Header";

/* =========================================================
   TYPES
========================================================= */

type ProductMedia = {
  type: string;
  url: string;
  publicId?: string | null;
};

type ProductItem = {
  id: string;
  price?: number | null;
  onDiscount?: boolean | null;
  mrp?: number | null;
  discountPerc?: number | null;
  discountAmount?: number | null;
  sellingPrice?: number | null;
  currency?: string | null;
  stock?: number | null;
  size?: string | null;
  colour?: string | null;
  sku?: string | null;
  barcode?: string | null;
  images?: ProductMedia[];
};

type Product = {
  id: string;
  name: string;
  status?: string | null;
  subTitle?: string | null;
  slug?: string | null;
  description?: string | null;
  categories?: string[];
  brand?: {
    id: string;
    name: string;
  } | null;
  mainMedia?: ProductMedia[];
  images?: ProductMedia[];
  rating?: number | null;
  reviewsCount?: number | null;
  items?: ProductItem[];
};

type Review = {
  id: string;
  productId?: string | null;
  userId?: string | null;
  customerName?: string | null;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
};

type ProductRating = {
  averageRating?: number | null;
  totalReviews?: number | null;
  fiveStar?: number | null;
  fourStar?: number | null;
  threeStar?: number | null;
  twoStar?: number | null;
  oneStar?: number | null;
};

type SuggestedProduct = {
  id: string;
  name: string;
  status?: string | null;
  subTitle?: string | null;
  categories?: string[];
  brand?: {
    id: string;
    name: string;
  } | null;
  mainMedia?: ProductMedia[];
  images?: ProductMedia[];
  items?: ProductItem[];
};

type ProductQueryData = {
  product: Product | null;
};

type ProductQueryVariables = {
  id: string;
};

type ProductReviewsQueryData = {
  productReviews: Review[];
  productRating: ProductRating | null;
};

type ProductReviewsQueryVariables = {
  productId: string;
};

type SuggestedProductsQueryData = {
  products: {
    products: SuggestedProduct[];
  };
};

type SuggestedProductsQueryVariables = {
  page: number;
  limit: number;
};

type CreateBasketMutationData = {
  createBasket: {
    id: string;
    quantity: number;
    size?: string | null;
    colour?: string | null;
    status?: string | null;
  };
};

type CreateBasketVariables = {
  userId: string;
  productId: string;
  quantity?: number;
  size?: string | null;
  colour?: string | null;
  status?: string | null;
};

/* =========================================================
   PRODUCT QUERY
========================================================= */

const PRODUCT_QUERY = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      status
      subTitle
      slug
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

      rating
      reviewsCount

      items {
        id
        price
        onDiscount
        mrp
        discountPerc
        discountAmount
        sellingPrice
        currency
        stock
        size
        colour
        sku
        barcode

        images {
          type
          url
          publicId
        }
      }
    }
  }
`;

/* =========================================================
   REVIEWS QUERY
========================================================= */

const PRODUCT_REVIEWS_QUERY = gql`
  query ProductReviews($productId: ID!) {
    productReviews(productId: $productId) {
      id
      productId
      userId
      customerName
      rating
      comment
      createdAt
    }

    productRating(productId: $productId) {
      averageRating
      totalReviews
      fiveStar
      fourStar
      threeStar
      twoStar
      oneStar
    }
  }
`;

/* =========================================================
   SUGGESTED PRODUCTS
========================================================= */

const SUGGESTED_PRODUCTS_QUERY = gql`
  query SuggestedProducts($page: Int!, $limit: Int!) {
    products(page: $page, limit: $limit) {
      products {
        id
        name
        status
        subTitle
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
          id
          price
          sellingPrice
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
   CREATE BASKET
========================================================= */

const CREATE_BASKET = gql`
  mutation CreateBasket(
    $userId: String!
    $productId: String!
    $quantity: Int
    $size: String
    $colour: String
    $status: String
  ) {
    createBasket(
      userId: $userId
      productId: $productId
      quantity: $quantity
      size: $size
      colour: $colour
      status: $status
    ) {
      id
      quantity
      size
      colour
      status
    }
  }
`;

/* =========================================================
   HELPERS
========================================================= */

const getImage = (image?: string | null) => {
  if (!image) {
    return "/placeholder.png";
  }

  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `/products/${image}`;
};

const normalize = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

/* =========================================================
   PRODUCT PAGE
========================================================= */

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  /* =======================================================
     MUTATION
  ======================================================= */

  const [createBasket] = useMutation<
    CreateBasketMutationData,
    CreateBasketVariables
  >(CREATE_BASKET);

  /* =======================================================
     PRODUCT QUERY
  ======================================================= */

  const {
    data,
    loading,
    error,
  } = useQuery<ProductQueryData, ProductQueryVariables>(
    PRODUCT_QUERY,
    {
      variables: {
        id: productId,
      },
      fetchPolicy: "network-only",
    }
  );

  const product = data?.product;

  /* =======================================================
     REVIEWS
  ======================================================= */

  const {
    data: reviewsData,
    loading: reviewsLoading,
  } = useQuery<
    ProductReviewsQueryData,
    ProductReviewsQueryVariables
  >(PRODUCT_REVIEWS_QUERY, {
    variables: {
      productId,
    },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  /* =======================================================
     SUGGESTED PRODUCTS
  ======================================================= */

  const {
    data: suggestedProductsData,
    loading: suggestedProductsLoading,
  } = useQuery<
    SuggestedProductsQueryData,
    SuggestedProductsQueryVariables
  >(SUGGESTED_PRODUCTS_QUERY, {
    variables: {
      page: 1,
      limit: 100,
    },
    fetchPolicy: "network-only",
  });

  /* =======================================================
     STATES
  ======================================================= */

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [addingToBag, setAddingToBag] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  const [pageMessage, setPageMessage] = useState("");
  const [pageMessageType, setPageMessageType] = useState<
    "error" | "info" | "success"
  >("info");

  const showPageMessage = (
    message: string,
    type: "error" | "info" | "success" = "info"
  ) => {
    setPageMessage(message);
    setPageMessageType(type);

    window.setTimeout(() => {
      setPageMessage("");
    }, 3500);
  };

  /* =======================================================
     VARIANTS
  ======================================================= */

  const variants = product?.items || [];

  /* =======================================================
     AVAILABLE SIZES
  ======================================================= */

  const availableSizes = useMemo(() => {
    const values = variants
      .map((item) => item.size?.trim())
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(values));
  }, [variants]);

  /* =======================================================
     AVAILABLE COLOURS
  ======================================================= */

  const availableColours = useMemo(() => {
    const values = variants
      .map((item) => item.colour?.trim())
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(values));
  }, [variants]);

  /* =======================================================
     SELECTED VARIANT
  ======================================================= */

  const selectedVariant = useMemo(() => {
    if (!variants.length) {
      return null;
    }

    if (!selectedSize && !selectedColour) {
      return variants.length === 1 ? variants[0] : null;
    }

    return (
      variants.find((item) => {
        const sizeMatches =
          !selectedSize ||
          normalize(item.size) === normalize(selectedSize);

        const colourMatches =
          !selectedColour ||
          normalize(item.colour) === normalize(selectedColour);

        return sizeMatches && colourMatches;
      }) || null
    );
  }, [
    variants,
    selectedSize,
    selectedColour,
  ]);

  /* =======================================================
     VARIANT SELECTION MESSAGE
  ======================================================= */

  const hasMultipleSizes = availableSizes.length > 1;
  const hasMultipleColours = availableColours.length > 1;

  /* =======================================================
     PRICE
  ======================================================= */

  const displayPrice =
    selectedVariant?.sellingPrice ??
    selectedVariant?.price ??
    0;

  const displayMrp =
    selectedVariant?.mrp ??
    0;

  const hasDiscount =
    Boolean(
      selectedVariant?.onDiscount &&
        displayMrp > displayPrice
    );

  /* =======================================================
     STOCK
  ======================================================= */

  const stock =
    selectedVariant?.stock ??
    (variants.length === 1
      ? variants[0]?.stock ?? 0
      : 0);

  const isOutOfStock = stock <= 0;

  /* =======================================================
     GLOBAL IMAGES
  ======================================================= */

  const globalImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const media = [
      ...(product.mainMedia || []),
      ...(product.images || []),
    ];

    const urls = media
      .map((item) => getImage(item.url))
      .filter(Boolean);

    return Array.from(new Set(urls));
  }, [product]);

  /* =======================================================
     VARIANT IMAGES
  ======================================================= */

  const variantImages = useMemo(() => {
    if (!selectedVariant) {
      return [];
    }

    return Array.from(
      new Set(
        (selectedVariant.images || [])
          .map((item) => getImage(item.url))
          .filter(Boolean)
      )
    );
  }, [selectedVariant]);

  /* =======================================================
     DISPLAY IMAGES
     
     Global images show initially.
     Once a variant is selected, only variant images show.
  ======================================================= */
const allImages = useMemo(() => {
  // 1. Once a variant is selected, show only that variant's images.
  if (selectedVariant && variantImages.length > 0) {
    return variantImages;
  }

  // 2. On initial load, prefer product-level/global images.
  if (globalImages.length > 0) {
    return globalImages;
  }

  // 3. If there are no global images, use the first available
  //    variant image so the product is not blank on initial load.
  const firstVariantImages = variants
    .flatMap((item) => item.images || [])
    .map((item) => getImage(item.url))
    .filter(Boolean);

  return Array.from(new Set(firstVariantImages));
}, [
  selectedVariant,
  variantImages,
  globalImages,
  variants,
]);

  /* =======================================================
     KEEP SELECTED IMAGE VALID
  ======================================================= */

  const mainImage =
    selectedImage &&
    allImages.includes(selectedImage)
      ? selectedImage
      : allImages[0] || "/placeholder.png";

  /* =======================================================
     CATEGORY
  ======================================================= */

  const categoryText =
    product?.categories?.length
      ? product.categories.join(", ")
      : "";

  /* =======================================================
     SUGGESTED PRODUCTS
  ======================================================= */

  const suggestedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    const products =
      suggestedProductsData?.products?.products || [];

    const currentCategories =
      product.categories || [];

    return products
      .filter((item) => {
        const sameProduct =
          String(item.id) === String(product.id);

        const published =
          normalize(item.status) === "published" ||
          normalize(item.status) === "active";

        const sameCategory =
          currentCategories.length === 0 ||
          item.categories?.some((category) =>
            currentCategories.some(
              (currentCategory) =>
                normalize(category) ===
                normalize(currentCategory)
            )
          );

        return (
          !sameProduct &&
          published &&
          sameCategory
        );
      })
      .slice(0, 4);
  }, [
    suggestedProductsData,
    product,
  ]);

  /* =======================================================
     GET SUGGESTED PRODUCT IMAGE
  ======================================================= */

  const getSuggestedProductImage = (
    item: SuggestedProduct
  ) => {
    const media = [
      ...(item.mainMedia || []),
      ...(item.images || []),
    ];

    const firstGlobal =
      media.find((mediaItem) => mediaItem.url);

    if (firstGlobal?.url) {
      return getImage(firstGlobal.url);
    }

    const firstVariant =
      item.items?.find(
        (variant) =>
          variant.images &&
          variant.images.length > 0
      );

    return getImage(
      firstVariant?.images?.[0]?.url
    );
  };

  /* =======================================================
     ADD TO BAG
  ======================================================= */

  const handleAddToBag = async () => {
    try {
      if (!product) {
        showPageMessage(
          "Product information is not available.",
          "error"
        );
        return;
      }

      if (variants.length > 1 && !selectedVariant) {
        if (hasMultipleSizes && !selectedSize) {
          showPageMessage(
            "Please select a size.",
            "info"
          );
          return;
        }

        if (hasMultipleColours && !selectedColour) {
          showPageMessage(
            "Please select a colour.",
            "info"
          );
          return;
        }

        showPageMessage(
          "Please select a valid variant.",
          "info"
        );
        return;
      }

      if (isOutOfStock) {
        showPageMessage(
          "This product is currently out of stock.",
          "info"
        );
        return;
      }

      const authUserRaw =
        localStorage.getItem("authUser");

      if (!authUserRaw) {
        showPageMessage(
          "Please login to add products to your bag.",
          "info"
        );

        router.push("/customer-login");
        return;
      }

      let authUser: any;

      try {
        authUser = JSON.parse(authUserRaw);
      } catch {
        showPageMessage(
          "Please login again.",
          "info"
        );

        localStorage.removeItem("authUser");
        router.push("/customer-login");
        return;
      }

      const userId =
        authUser?.id ||
        authUser?._id ||
        authUser?.user?.id ||
        authUser?.user?._id;

      if (!userId) {
        showPageMessage(
          "Please login again.",
          "info"
        );

        localStorage.removeItem("authUser");
        router.push("/customer-login");
        return;
      }

      if (quantity < 1) {
        showPageMessage(
          "Please select a valid quantity.",
          "info"
        );
        return;
      }

      if (quantity > stock) {
        showPageMessage(
          `Only ${stock} item${
            stock === 1 ? "" : "s"
          } available.`,
          "info"
        );

        setQuantity(stock);
        return;
      }

      setAddingToBag(true);

      await createBasket({
        variables: {
          userId: String(userId),
          productId: String(product.id),
          quantity: Number(quantity),
          size:
            selectedVariant?.size ||
            selectedSize ||
            null,
          colour:
            selectedVariant?.colour ||
            selectedColour ||
            null,
          status: "active",
        },
      });

      setAddedToBag(true);

      showPageMessage(
        "Product added to your bag.",
        "success"
      );
    } catch (error: any) {
      console.error(
        "ADD TO BAG ERROR:",
        error
      );

      const message =
        error?.message ||
        "Unable to add this product to your bag.";

      showPageMessage(
        message,
        "error"
      );
    } finally {
      setAddingToBag(false);
    }
  };

  /* =======================================================
     SELECT COLOUR
  ======================================================= */

  const handleColourSelect = (
    colour: string
  ) => {
    setSelectedColour(colour);
    setSelectedImage("");
    setAddedToBag(false);

    const matchingVariants =
      variants.filter(
        (item) =>
          normalize(item.colour) ===
          normalize(colour)
      );

    if (
      selectedSize &&
      !matchingVariants.some(
        (item) =>
          normalize(item.size) ===
          normalize(selectedSize)
      )
    ) {
      setSelectedSize("");
    }
  };

  /* =======================================================
     SELECT SIZE
  ======================================================= */

  const handleSizeSelect = (
    size: string
  ) => {
    setSelectedSize(size);
    setSelectedImage("");
    setAddedToBag(false);

    const matchingVariants =
      variants.filter(
        (item) =>
          normalize(item.size) ===
          normalize(size)
      );

    if (
      selectedColour &&
      !matchingVariants.some(
        (item) =>
          normalize(item.colour) ===
          normalize(selectedColour)
      )
    ) {
      setSelectedColour("");
    }
  };

  /* =======================================================
     QUANTITY
  ======================================================= */

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity(
        (current) => current + 1
      );
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(
        (current) => current - 1
      );
    }
  };

  /* =======================================================
     REVIEWS
  ======================================================= */

  const reviews =
    reviewsData?.productReviews || [];

  const productRating =
    reviewsData?.productRating;

  const averageRating =
    productRating?.averageRating ?? 0;

  const totalReviews =
    productRating?.totalReviews ?? 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500">
            Loading product...
          </p>
        </main>
      </>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-semibold text-[#0B1F3A]">
            Unable to load product
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Something went wrong while loading
            this product.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/shop")
            }
            className="mt-6 rounded-md bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102f56]"
          >
            Back to Shop
          </button>
        </main>
      </>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!product) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-semibold text-[#0B1F3A]">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This product may no longer be available.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/shop")
            }
            className="mt-6 rounded-md bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102f56]"
          >
            Back to Shop
          </button>
        </main>
      </>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F9FB] px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* BREADCRUMB */}

          <div className="mb-6 text-sm text-gray-500">
            <button
              type="button"
              onClick={() =>
                router.push("/shop")
              }
              className="hover:text-[#0B1F3A]"
            >
              Shop
            </button>

            <span className="mx-2">
              /
            </span>

            <span className="text-gray-800">
              {product.name}
            </span>
          </div>

          {/* PRODUCT SECTION */}

          <div className="grid gap-10 rounded-2xl bg-white p-5 shadow-sm md:p-8 lg:grid-cols-2">

            {/* =================================================
                LEFT - IMAGES
            ================================================= */}

            <div>

              {/* MAIN IMAGE */}

              <div className="group relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FB] p-4 shadow-sm md:min-h-[550px] md:p-6">

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-gray-100/40" />

                <img
                  src={mainImage}
                  alt={product.name}
                  className="relative z-10 h-full max-h-[520px] w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />

                <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1F3A] shadow-sm">
                  Arunodaya Collections
                </span>

              </div>

              {/* IMAGE THUMBNAILS */}

              {allImages.length > 1 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {allImages.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(image)
                        }
                        aria-label={`View product image ${
                          index + 1
                        }`}
                        className={`group relative h-20 w-20 overflow-hidden rounded-xl bg-white transition-all duration-200 ${
                          mainImage === image
                            ? "ring-2 ring-[#C9A227] ring-offset-2"
                            : "border border-gray-200 hover:border-[#C9A227] hover:shadow-sm"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {mainImage === image && (
                          <span className="absolute inset-x-0 bottom-0 h-1 bg-[#C9A227]" />
                        )}
                      </button>
                    )
                  )}
                </div>
              )}

              {/* VARIANT IMAGE NOTICE */}

              {selectedVariant &&
                variantImages.length > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    Showing images for selected
                    variant.
                  </p>
                )}

            </div>

            {/* =================================================
                RIGHT - DETAILS
            ================================================= */}

            <div className="flex flex-col">

              {/* BRAND */}

              {product.brand?.name && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#F8F9FB] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#0B1F3A]">
                    {product.brand.name}
                  </span>

                  <span className="text-xs text-gray-400">
                    • Trusted Collection
                  </span>
                </div>
              )}

              {/* NAME */}

              <h1 className="mt-4 text-3xl font-bold leading-tight text-[#0B1F3A] md:text-4xl">
                {product.name}
              </h1>

              {/* SUBTITLE */}

              {product.subTitle && (
                <p className="mt-2 text-sm text-gray-500">
                  {product.subTitle}
                </p>
              )}

              {/* CATEGORY */}

              {categoryText && (
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
                    {categoryText}
                  </span>
                </div>
              )}

              {/* RATING */}

              <div className="mt-4 flex items-center gap-2">
                <span className="text-yellow-500">
                  ★
                </span>

                <span className="text-sm font-semibold text-[#0B1F3A]">
                  {Number(
                    product.rating ??
                      averageRating
                  ).toFixed(1)}
                </span>

                <span className="text-sm text-gray-500">
                  ({totalReviews} reviews)
                </span>
              </div>

              {/* PRICE */}

              <div className="mt-6 rounded-2xl border border-gray-100 bg-[#F8F9FB] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                  Price
                </p>

                {displayPrice > 0 ? (
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-3xl font-bold text-[#0B1F3A]">
                      ₹
                      {displayPrice.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    {hasDiscount && (
                      <p className="text-sm text-gray-400 line-through">
                        ₹
                        {displayMrp.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-lg text-gray-500">
                    Select a variant
                  </p>
                )}
              </div>

              {/* STOCK */}

              {selectedVariant &&
                stock > 0 &&
                stock <= 5 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <p className="text-sm font-semibold text-red-600">
                      Only {stock} left in stock
                    </p>
                  </div>
                )}

              {/* COLOURS */}

              {availableColours.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">
                    Colour

                    {selectedColour && (
                      <span className="ml-2 font-normal text-gray-500">
                        {selectedColour}
                      </span>
                    )}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-start gap-5">
                    {availableColours.map(
                      (colour) => {
                        const normalizedColour =
                          normalize(colour);

                        const isSelected =
                          normalize(
                            selectedColour
                          ) === normalizedColour;

                        const circleColour =
                          normalizedColour ===
                          "maroon"
                            ? "#800000"
                            : normalizedColour ===
                              "white"
                            ? "#ffffff"
                            : normalizedColour ===
                              "black"
                            ? "#000000"
                            : normalizedColour ===
                              "yellow"
                            ? "#fdd835"
                            : normalizedColour ===
                              "red"
                            ? "#e53935"
                            : normalizedColour ===
                              "pink"
                            ? "#c2185b"
                            : normalizedColour ===
                              "blue"
                            ? "#4169e1"
                            : normalizedColour ===
                              "green"
                            ? "#43a047"
                            : normalizedColour ===
                              "orange"
                            ? "#fb8c00"
                            : normalizedColour ===
                              "purple"
                            ? "#8e24aa"
                            : normalizedColour ===
                              "brown"
                            ? "#795548"
                            : "#d9d9d9";

                        return (
                          <button
                            key={colour}
                            type="button"
                            onClick={() =>
                              handleColourSelect(
                                colour
                              )
                            }
                            className="flex min-w-[58px] flex-col items-center gap-2 border-0 bg-transparent p-0"
                          >
                            <span
                              className={`h-11 w-11 rounded-full ${
                                isSelected
                                  ? "ring-2 ring-[#C9A227] ring-offset-2"
                                  : "border border-gray-300"
                              }`}
                              style={{
                                backgroundColor:
                                  circleColour,
                              }}
                            />

                            <span
                              className={`text-xs ${
                                isSelected
                                  ? "font-bold text-[#0B1F3A]"
                                  : "font-medium text-gray-600"
                              }`}
                            >
                              {colour}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* SIZES */}

              {availableSizes.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">
                    Size

                    {selectedSize && (
                      <span className="ml-2 font-normal text-gray-500">
                        {selectedSize}
                      </span>
                    )}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {availableSizes.map(
                      (size) => {
                        const isSelected =
                          selectedSize === size;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              handleSizeSelect(
                                size
                              )
                            }
                            className={`relative flex h-12 min-w-[64px] items-center justify-center rounded-xl border px-5 text-sm font-semibold tracking-wide transition-all duration-200 ${
                              isSelected
                                ? "border-[#C9A227] bg-[#0B1F3A] text-white shadow-md ring-2 ring-[#C9A227]/20"
                                : "border-gray-200 bg-white text-[#0B1F3A] shadow-sm hover:border-[#C9A227] hover:shadow-md"
                            }`}
                          >
                            {size}

                            {isSelected && (
                              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-white shadow-sm">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* VARIANT INFORMATION */}

              {selectedVariant && (
                <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {selectedVariant.size && (
                      <span>
                        Size:{" "}
                        <strong className="text-gray-700">
                          {selectedVariant.size}
                        </strong>
                      </span>
                    )}

                    {selectedVariant.colour && (
                      <span>
                        Colour:{" "}
                        <strong className="text-gray-700">
                          {selectedVariant.colour}
                        </strong>
                      </span>
                    )}

                    {selectedVariant.sku && (
                      <span>
                        SKU:{" "}
                        <strong className="text-gray-700">
                          {selectedVariant.sku}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* NO VARIANT */}

              {variants.length > 1 &&
                !selectedVariant &&
                (selectedSize ||
                  selectedColour) && (
                  <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                    Please select a valid size and
                    colour combination.
                  </div>
                )}

              {/* QUANTITY */}

              {!isOutOfStock &&
                (selectedVariant ||
                  variants.length === 1) && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-[#0B1F3A]">
                      Quantity
                    </h2>

                    <div className="mt-4 inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={
                          decreaseQuantity
                        }
                        disabled={
                          quantity <= 1
                        }
                        aria-label="Decrease quantity"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-medium text-[#0B1F3A] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        −
                      </button>

                      <div className="flex h-10 min-w-[52px] items-center justify-center border-x border-gray-100 px-3 text-sm font-bold text-[#0B1F3A]">
                        {quantity}
                      </div>

                      <button
                        type="button"
                        onClick={
                          increaseQuantity
                        }
                        disabled={
                          quantity >= stock
                        }
                        aria-label="Increase quantity"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-medium text-[#0B1F3A] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

              {/* MESSAGE */}

              {pageMessage && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 shadow-sm ${
                    pageMessageType ===
                    "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : pageMessageType ===
                        "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-[#C9A227]/40 bg-[#FFF9E8] text-[#7A5A00]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-bold shadow-sm">
                      {pageMessageType ===
                      "error"
                        ? "!"
                        : pageMessageType ===
                          "success"
                        ? "✓"
                        : "i"}
                    </span>

                    <p className="text-sm font-semibold">
                      {pageMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    isOutOfStock ||
                    addingToBag ||
                    (variants.length > 1 &&
                      !selectedVariant)
                  }
                  onClick={() => {
                    if (addedToBag) {
                      router.push(
                        "/basket"
                      );
                      return;
                    }

                    handleAddToBag();
                  }}
                  className="flex-1 rounded-xl bg-[#0B1F3A] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#102f56] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {addingToBag
                    ? "Adding..."
                    : addedToBag
                    ? "Go to Bag"
                    : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Bag"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/shop")
                  }
                  className="rounded-xl border border-[#0B1F3A] px-6 py-4 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#F8F9FB]"
                >
                  Continue Shopping
                </button>
              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h2 className="text-lg font-semibold text-[#0B1F3A]">
                    Description
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                    {product.description}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* =================================================
              REVIEWS
          ================================================= */}

          <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-2xl font-bold text-[#0B1F3A]">
                  Customer Reviews
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl text-yellow-500">
                    ★
                  </span>

                  <span className="font-bold text-[#0B1F3A]">
                    {Number(
                      averageRating
                    ).toFixed(1)}
                  </span>

                  <span className="text-sm text-gray-500">
                    from {totalReviews} review
                    {totalReviews === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
              </div>

              {productRating && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-500">
                  <span>
                    5★:{" "}
                    {productRating.fiveStar ??
                      0}
                  </span>

                  <span>
                    4★:{" "}
                    {productRating.fourStar ??
                      0}
                  </span>

                  <span>
                    3★:{" "}
                    {productRating.threeStar ??
                      0}
                  </span>

                  <span>
                    2★:{" "}
                    {productRating.twoStar ??
                      0}
                  </span>

                  <span>
                    1★:{" "}
                    {productRating.oneStar ??
                      0}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              {reviewsLoading ? (
                <p className="text-sm text-gray-500">
                  Loading reviews...
                </p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No reviews yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {reviews.map(
                    (review) => (
                      <div
                        key={review.id}
                        className="rounded-xl border border-gray-100 p-5"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-[#0B1F3A]">
                              {review.customerName ||
                                "Customer"}
                            </p>

                            <div className="mt-1 text-sm text-yellow-500">
                              {"★".repeat(
                                Math.max(
                                  0,
                                  Math.min(
                                    5,
                                    Math.round(
                                      review.rating ??
                                        0
                                    )
                                  )
                                )
                              )}
                            </div>
                          </div>

                          {review.createdAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(
                                review.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </span>
                          )}
                        </div>

                        {review.comment && (
                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              SUGGESTED PRODUCTS
          ================================================= */}

          {!suggestedProductsLoading &&
            suggestedProducts.length > 0 && (
              <section className="mt-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                      You May Also Like
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      More products from this
                      collection
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {suggestedProducts.map(
                    (item) => {
                      const image =
                        getSuggestedProductImage(
                          item
                        );

                      const itemVariant =
                        item.items?.find(
                          (variant) =>
                            Number(
                              variant.stock ?? 0
                            ) > 0
                        ) ||
                        item.items?.[0];

                      const itemPrice =
                        itemVariant?.sellingPrice ??
                        itemVariant?.price ??
                        0;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            router.push(
                              `/product/${item.id}`
                            )
                          }
                          className="group overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#F8F9FB] p-5">
                            <img
                              src={image}
                              alt={item.name}
                              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                            />
                          </div>

                          <div className="p-5">
                            {item.brand?.name && (
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                {
                                  item.brand
                                    .name
                                }
                              </p>
                            )}

                            <h3 className="mt-2 line-clamp-2 font-semibold text-[#0B1F3A]">
                              {item.name}
                            </h3>

                            {item.subTitle && (
                              <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                                {item.subTitle}
                              </p>
                            )}

                            <p className="mt-3 text-lg font-bold text-[#0B1F3A]">
                              {itemPrice > 0
                                ? `₹${itemPrice.toLocaleString(
                                    "en-IN"
                                  )}`
                                : "View Product"}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </section>
            )}

        </div>
      </main>
    </>
  );
}