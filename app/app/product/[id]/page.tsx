"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Header from "../../../components/Header/Header";

/* =========================================================
   PRODUCT REVIEWS
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
   PRODUCT QUERY
========================================================= */

const PRODUCT_QUERY = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      price
      image
      category
      brand {
        id
        name
      }
      description
      stock
      sizes
      colours
      colourImages {
        colour
        image
      }
      productImages {
        view
        image
      }
      sizechart {
        id
      }
      status
    }
  }
`;

/* =========================================================
   SUGGESTED PRODUCTS QUERY
========================================================= */

const SUGGESTED_PRODUCTS_QUERY = gql`
  query SuggestedProducts($page: Int!, $limit: Int!) {
    products(page: $page, limit: $limit) {
      products {
        id
        name
        price
        image
        category
        status
      }
    }
  }
`;

/* =========================================================
   TYPES
========================================================= */

type ColourImage = {
  colour: string;
  image: string;
};

type ProductImage = {
  view?: string;
  image?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  brand?: {
    id: string;
    name: string;
  };
  description?: string;
  stock?: number;
  sizes?: string[];
  colours?: string[];
  colourImages?: ColourImage[];
  productImages?: ProductImage[];
  status?: string;
};

type SuggestedProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  status?: string;
};

/* =========================================================
   PRODUCT PAGE
========================================================= */

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createBasket] = useMutation(CREATE_BASKET);

  /* =======================================================
     GENERAL STATES
  ======================================================= */

  const [addingToBag, setAddingToBag] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  const productId = String(params.id);

  /* =======================================================
     PRODUCT QUERY
  ======================================================= */

  const {
    data,
    loading,
    error,
  } = useQuery(PRODUCT_QUERY, {
    variables: {
      id: productId,
    },
    fetchPolicy: "network-only",
  });

  const product: Product | undefined = data?.product;

  /* =======================================================
     REVIEWS QUERY
  ======================================================= */

  const {
    data: reviewsData,
    loading: reviewsLoading,
  } = useQuery(PRODUCT_REVIEWS_QUERY, {
    variables: {
      productId,
    },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  /* =======================================================
     SUGGESTED PRODUCTS QUERY
  ======================================================= */

  const {
    data: suggestedProductsData,
    loading: suggestedProductsLoading,
  } = useQuery(SUGGESTED_PRODUCTS_QUERY, {
    variables: {
      page: 1,
      limit: 100,
    },
    fetchPolicy: "network-only",
  });

  /* =======================================================
     PRODUCT STATES
  ======================================================= */

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
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

  /* =========================================================
     IMAGE HELPER
  ========================================================= */

  const getImage = (image?: string) => {
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

  /* =========================================================
     ALL PRODUCT IMAGES
  ========================================================= */

  const allImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const images: string[] = [];

    if (product.image) {
      images.push(getImage(product.image));
    }

    if (product.productImages) {
      product.productImages.forEach((item) => {
        if (item.image) {
          const image = getImage(item.image);

          if (!images.includes(image)) {
            images.push(image);
          }
        }
      });
    }

    return images;
  }, [product]);

  /* =========================================================
     COLOUR IMAGE
  ========================================================= */

  const colourImage = useMemo(() => {
    if (!product || !selectedColour) {
      return "";
    }

    const found = product.colourImages?.find(
      (item) =>
        item.colour.trim().toLowerCase() ===
        selectedColour.trim().toLowerCase()
    );

    return found?.image ? getImage(found.image) : "";
  }, [product, selectedColour]);

  /* =========================================================
     MAIN IMAGE
  ========================================================= */

  const mainImage =
    selectedImage ||
    colourImage ||
    (allImages.length > 0
      ? allImages[0]
      : "/placeholder.png");

  /* =========================================================
     STOCK
  ========================================================= */

  const stock = product?.stock ?? 0;

  const isOutOfStock = stock <= 0;

  /* =========================================================
     SUGGESTED PRODUCTS
  ========================================================= */

  const suggestedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    const products: SuggestedProduct[] =
      suggestedProductsData?.products?.products || [];

    const currentCategory =
      product.category?.trim().toLowerCase();

    return products
      .filter((item) => {
        const sameProduct =
          String(item.id) === String(product.id);

        const activeProduct =
          String(item.status || "")
            .trim()
            .toLowerCase() === "active";

        const sameCategory =
          currentCategory &&
          item.category &&
          item.category.trim().toLowerCase() ===
            currentCategory;

        return (
          !sameProduct &&
          activeProduct &&
          sameCategory
        );
      })
      .slice(0, 4);
  }, [suggestedProductsData, product]);

  /* =========================================================
     ADD TO BAG
  ========================================================= */

  const handleAddToBag = async () => {
    try {
      if (!product) {
       showPageMessage(
  "Product information is not available.",
  "error"
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
showPageMessage("Please login again.", "info");
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
       showPageMessage("Please login again.", "info");
        localStorage.removeItem("authUser");
        router.push("/customer-login");
        return;
      }

      if (
        product.sizes &&
        product.sizes.length > 0 &&
        !selectedSize
      ) {
        showPageMessage("Please select a size.", "info");
        return;
      }

      if (
        product.colours &&
       product.colours.length > 1 &&
        !selectedColour
      ) {
        showPageMessage("Please select a colour.", "info");
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
    `Only ${stock} item${stock === 1 ? "" : "s"} available.`,
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
          size: selectedSize || null,
          colour: selectedColour || null,
          status: "active",
        },
      });

      setAddedToBag(true);
    } catch (error: any) {
      console.error(
        "ADD TO BAG ERROR:",
        error
      );

      const message =
        error?.message ||
        "Unable to add this product to your bag.";

     showPageMessage(message, "error");
    } finally {
      setAddingToBag(false);
    }
  };

  /* =========================================================
     QUANTITY
  ========================================================= */

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

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

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-semibold text-[#0B1F3A]">
            Unable to load product
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Something went wrong while loading this
            product.
          </p>

          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="mt-6 rounded-md bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102f56]"
          >
            Back to Shop
          </button>
        </main>
      </>
    );
  }

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

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
            onClick={() => router.push("/shop")}
            className="mt-6 rounded-md bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102f56]"
          >
            Back to Shop
          </button>
        </main>
      </>
    );
  }

  /* =========================================================
     REVIEW DATA
  ========================================================= */

  const reviews =
    reviewsData?.productReviews || [];

  const productRating =
    reviewsData?.productRating;

  const averageRating =
    productRating?.averageRating ?? 0;

  const totalReviews =
    productRating?.totalReviews ?? 0;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F9FB] px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <div className="mb-6 text-sm text-gray-500">
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="hover:text-[#0B1F3A]"
            >
              Shop
            </button>

            <span className="mx-2">/</span>

            <span className="text-gray-800">
              {product.name}
            </span>
          </div>

          {/* =================================================
              PRODUCT SECTION
          ================================================= */}

          <div className="grid gap-10 rounded-2xl bg-white p-5 shadow-sm md:p-8 lg:grid-cols-2">

            {/* =================================================
                LEFT - IMAGES
            ================================================= */}

            <div>

              {/* Main Image */}

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

              {/* Image Thumbnails */}

             {allImages.length > 1 && (
  <div className="mt-5 flex flex-wrap gap-3">
    {allImages.map((image, index) => (
      <button
        key={`${image}-${index}`}
        type="button"
        onClick={() => {
          setSelectedImage(image);
          setSelectedColour("");
        }}
        aria-label={`View product image ${index + 1}`}
        className={`group relative h-20 w-20 overflow-hidden rounded-xl bg-white transition-all duration-200 ${
          mainImage === image
            ? "ring-2 ring-[#C9A227] ring-offset-2"
            : "border border-gray-200 hover:border-[#C9A227] hover:shadow-sm"
        }`}
      >
        <img
          src={image}
          alt={`${product.name} ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {mainImage === image && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-[#C9A227]" />
        )}
      </button>
    ))}
  </div>
)}


            </div>

            {/* =================================================
                RIGHT - DETAILS
            ================================================= */}

            <div className="flex flex-col">

            {/* Brand */}
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

{/* Name */}
<h1 className="mt-4 text-3xl font-bold leading-tight text-[#0B1F3A] md:text-4xl">
  {product.name}
</h1>

{/* Category */}
{product.category && (
  <div className="mt-3">
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
      {product.category}
    </span>
  </div>
)}

{/* Price */}
<div className="mt-6 rounded-2xl border border-gray-100 bg-[#F8F9FB] p-5">
  <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
    Price
  </p>

  <p className="mt-1 text-3xl font-bold text-[#0B1F3A]">
    ₹{product.price.toLocaleString("en-IN")}
  </p>
</div>

{/* Stock */}
{stock > 0 && stock <= 5 && (
  <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
    <span className="h-2 w-2 rounded-full bg-red-500" />
    <p className="text-sm font-semibold text-red-600">
      Only {stock} left in stock
    </p>
  </div>
)}

{/* Description */}
{product.description && (
  <div className="mt-6 border-t border-gray-100 pt-6">
    <h2 className="text-lg font-semibold text-[#0B1F3A]">
      Description
    </h2>

    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
      {product.description}
    </p>
  </div>
)}
              {/* Colours */}

              {product.colours &&
                product.colours.length > 0 && (
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
  {product.colours.map((colour) => {
    const normalizedColour = colour.trim().toLowerCase();

    const isSelected =
      selectedColour.trim().toLowerCase() === normalizedColour;

    const circleColour =
      normalizedColour === "maroon"
        ? "#800000"
        : normalizedColour === "white"
        ? "#ffffff"
        : normalizedColour === "black"
        ? "#000000"
        : normalizedColour === "yellow"
        ? "#fdd835"
        : normalizedColour === "red"
        ? "#e53935"
       : normalizedColour === "pink"
? "#c2185b"
        : normalizedColour === "blue"
? "#4169e1"
        : normalizedColour === "green"
        ? "#43a047"
        : normalizedColour === "orange"
        ? "#fb8c00"
        : normalizedColour === "purple"
        ? "#8e24aa"
        : normalizedColour === "brown"
        ? "#795548"
        : "#d9d9d9";

    const matchingImage = product.colourImages?.find(
      (item) =>
        item.colour.trim().toLowerCase() === normalizedColour
    )?.image;

    return (
      <button
        key={colour}
        type="button"
        onClick={() => {
          setSelectedColour(colour);

          if (matchingImage) {
            setSelectedImage(getImage(matchingImage));
          }
        }}
        className="flex min-w-[58px] flex-col items-center gap-2 border-0 bg-transparent p-0"
      >
        <span
          className={`h-11 w-11 rounded-full ${
            isSelected
              ? "ring-2 ring-[#C9A227] ring-offset-2"
              : "border border-gray-300"
          }`}
          style={{
            backgroundColor: circleColour,
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
  })}
</div>
                  </div>
                )}

              {/* Sizes */}

              {product.sizes &&
                product.sizes.length > 0 && (
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
  {product.sizes.map((size) => {
    const isSelected = selectedSize === size;

    return (
      <button
        key={size}
        type="button"
        onClick={() => setSelectedSize(size)}
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
  })}
</div>
                  </div>
                )}

              {/* Quantity */}

              {!isOutOfStock && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">
                    Quantity
                  </h2>

                 <div className="mt-4 inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
  <button
    type="button"
    onClick={decreaseQuantity}
    disabled={quantity <= 1}
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
    onClick={increaseQuantity}
    disabled={quantity >= stock}
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
      pageMessageType === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : pageMessageType === "success"
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-[#C9A227]/40 bg-[#FFF9E8] text-[#7A5A00]"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-bold shadow-sm">
        {pageMessageType === "error"
          ? "!"
          : pageMessageType === "success"
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
  disabled={isOutOfStock || addingToBag}
  onClick={() => {
    if (addedToBag) {
      router.push("/basket");
      return;
    }

    handleAddToBag();
  }}
  className={`group flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold shadow-md transition-all duration-200 ${
    addedToBag
      ? "bg-[#C9A227] text-[#0B1F3A] hover:bg-[#e0bb38]"
      : "bg-[#0B1F3A] text-white hover:bg-[#102F56]"
  } disabled:cursor-not-allowed disabled:bg-gray-400`}
>
  {isOutOfStock ? (
    "Out of Stock"
  ) : addingToBag ? (
    <>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      Adding...
    </>
  ) : addedToBag ? (
    <>
      Go to Bag
      <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </>
  ) : (
    <>
      Add to Bag
      <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </>
  )}
</button>

  <button
    type="button"
    onClick={() => router.push("/shop")}
    className="flex flex-1 items-center justify-center rounded-xl border-2 border-[#0B1F3A] bg-white px-6 py-4 font-semibold text-[#0B1F3A] transition-all duration-200 hover:border-[#C9A227] hover:bg-[#C9A227]/5 hover:shadow-md"
  >
    Continue Shopping
  </button>
</div>
          {/* =================================================
              CUSTOMER REVIEWS
              DISPLAY ONLY
              CUSTOMER CANNOT SUBMIT FROM HERE
          ================================================= */}

          <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm md:p-8">

            <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-2xl font-semibold text-[#0B1F3A]">
                  Customer Reviews
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {totalReviews === 0
                    ? "No reviews yet"
                    : `${totalReviews} review${
                        totalReviews === 1
                          ? ""
                          : "s"
                      }`}
                </p>
              </div>

              {/* Rating Summary */}

              <div className="flex items-center gap-3">

                <div className="text-3xl font-bold text-[#C9A227]">
                  {averageRating > 0
                    ? averageRating.toFixed(1)
                    : "0.0"}
                </div>

                <div>
                  {totalReviews > 0 ? (
                    <>
                      <div className="text-lg tracking-wide">
                        <span className="text-[#C9A227]">
                          {"★".repeat(
                            Math.round(
                              averageRating
                            )
                          )}
                        </span>

                        <span className="text-gray-300">
                          {"★".repeat(
                            Math.max(
                              0,
                              5 -
                                Math.round(
                                  averageRating
                                )
                            )
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        Average rating
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-gray-500">
                      No rating yet
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Existing Reviews */}

                    <div className="mt-8">

            {reviewsLoading ? (
              <p className="text-sm text-gray-500">
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-[#F8F9FB] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl text-[#C9A227] shadow-sm">
                  ☆
                </div>

                <h3 className="mt-4 text-lg font-semibold text-[#0B1F3A]">
                  No customer reviews yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Reviews from delivered orders will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => {
                  const rating = Math.min(
                    5,
                    Math.max(0, Number(review.rating) || 0)
                  );

                  const customerName =
                    review.customerName || "Customer";

                  const initials = customerName
                    .split(" ")
                    .filter(Boolean)
                    .map((name: string) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const validDate =
                    review.createdAt &&
                    !Number.isNaN(
                      new Date(review.createdAt).getTime()
                    );

                  return (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B1F3A] text-sm font-bold text-white">
                            {initials}
                          </div>

                          <div>
                            <p className="font-semibold text-[#0B1F3A]">
                              {customerName}
                            </p>

                            <div className="mt-1 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= rating
                                      ? "text-[#C9A227]"
                                      : "text-gray-200"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {validDate && (
                          <span className="shrink-0 text-xs text-gray-400">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-xl bg-[#F8F9FB] px-4 py-3">
                        <p className="text-sm leading-7 text-gray-600">
                          “{review.comment}”
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

                   </div>

        </section>

        </div>

        </div>

        
          {/* =================================================
              YOU MAY ALSO LIKE
          ================================================= */}

        <section className="mt-12">
  <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
        Shop more
      </p>

      <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
        You May Also Like
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Similar products you may be interested in
      </p>
    </div>
  </div>

  {suggestedProductsLoading ? (
    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <p className="text-sm text-gray-500">
        Loading suggestions...
      </p>
    </div>
  ) : suggestedProducts.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-[#F8F9FB] p-10 text-center">
      <p className="text-sm text-gray-500">
        No similar products available right now.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {suggestedProducts.map((suggestedProduct) => (
        <article
          key={suggestedProduct.id}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                `/product/${suggestedProduct.id}`
              )
            }
            className="block w-full text-left"
          >
            <div className="relative flex h-72 items-center justify-center overflow-hidden bg-[#F8F9FB]">
              <img
                src={getImage(suggestedProduct.image)}
                alt={suggestedProduct.name}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />

             
            </div>
          </button>

          <div className="p-5">
          
            <h3 className="mt-2 min-h-[48px] text-base font-semibold leading-6 text-[#0B1F3A]">
              {suggestedProduct.name}
            </h3>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-lg font-bold text-[#0B1F3A]">
                ₹{suggestedProduct.price}
              </p>

              <span className="text-xs font-medium text-gray-400">
                Explore
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/product/${suggestedProduct.id}`
                )
              }
              className="mt-5 flex w-full items-center justify-center rounded-xl border-2 border-[#0B1F3A] px-4 py-3 text-sm font-semibold text-[#0B1F3A] transition-all duration-200 hover:border-[#C9A227] hover:bg-[#0B1F3A] hover:text-white"
            >
              View Product
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </article>
      ))}
    </div>
  )}
</section>

        </div>
      </main>
    </>
  );
}
