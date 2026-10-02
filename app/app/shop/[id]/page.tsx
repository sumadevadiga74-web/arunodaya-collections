"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header/Header";

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
        image
      }

      sizechart
      status
    }
  }
`;

/* =========================================================
   REVIEWS
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
   BASKET
========================================================= */

const CREATE_BASKET = gql`
  mutation CreateBasket(
    $userId: String!
    $productId: String!
    $quantity: Int!
    $size: String
    $colour: String
  ) {
    createBasket(
      userId: $userId
      productId: $productId
      quantity: $quantity
      size: $size
      colour: $colour
    ) {
      id
      userId
      productId
      quantity
      size
      colour
    }
  }
`;

/* =========================================================
   WISHLIST
========================================================= */

const ADD_WISHLIST = gql`
  mutation AddWishlist(
    $userId: ID!
    $productId: ID!
  ) {
    addWishlist(
      userId: $userId
      productId: $productId
    ) {
      id
      userId
      productId
    }
  }
`;

/* =========================================================
   TYPES
========================================================= */

type ProductImage = {
  image: string;
};

type ColourImage = {
  colour: string;
  image: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  brand?: {
    id: string;
    name: string;
  } | null;
  description?: string;
  stock: number;
  sizes?: string[];
  colours?: string[];
  colourImages?: ColourImage[];
  productImages?: ProductImage[];
  sizechart?: string;
  status?: string;
};

type Review = {
  id: string;
  productId: string;
  userId: string;
  customerName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

type ProductRating = {
  averageRating: number;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
};

/* =========================================================
   COLOUR HELPERS
========================================================= */

const normalizeColour = (colour: string) =>
  colour.trim().toLowerCase().replace(/\s+/g, " ");

const getColourValue = (colourName: string) => {
  const name = normalizeColour(colourName);

  const colourMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",

    red: "#E53935",
    "dark red": "#8B0000",
    "light red": "#FF7F7F",

    maroon: "#800000",
    burgundy: "#800020",
    wine: "#722F37",

    pink: "#F48FB1",
    "light pink": "#F8BBD0",
    "dark pink": "#C2185B",
    "baby pink": "#F4C2C2",
    "hot pink": "#FF69B4",
    rose: "#F4A6A6",
    "rose gold": "#B76E79",

    orange: "#FB8C00",
    "dark orange": "#E65100",
    "light orange": "#FFCC80",
    peach: "#FFB07C",
    coral: "#FF7F50",

    yellow: "#FDD835",
    "light yellow": "#FFF59D",
    "dark yellow": "#C9A227",
    mustard: "#D4A017",
    saffron: "#F4C430",

    green: "#43A047",
    "dark green": "#1B5E20",
    "light green": "#A5D6A7",
    olive: "#808000",
    mint: "#98FF98",
    sage: "#9CAF88",
    "sea green": "#2E8B57",

    blue: "#1E88E5",
    "dark blue": "#0D47A1",
    "light blue": "#90CAF9",
    navy: "#102F56",
    "navy blue": "#102F56",
    "royal blue": "#4169E1",
    "sky blue": "#81D4FA",
    "powder blue": "#B0E0E6",

    purple: "#8E24AA",
    "dark purple": "#4A148C",
    "light purple": "#CE93D8",
    violet: "#7E57C2",
    lavender: "#B39DDB",
    plum: "#8E4585",
    indigo: "#4B0082",

    brown: "#795548",
    "dark brown": "#4E342E",
    "light brown": "#BCAAA4",
    tan: "#D2B48C",

    beige: "#D7C4A3",
    cream: "#FFF1C1",
    ivory: "#FFFFF0",
    "off white": "#F8F8F0",

    grey: "#9E9E9E",
    gray: "#9E9E9E",
    "dark grey": "#555555",
    "dark gray": "#555555",
    "light grey": "#D3D3D3",
    "light gray": "#D3D3D3",
    charcoal: "#36454F",

    silver: "#C0C0C0",
    gold: "#D4AF37",

    teal: "#00897B",
    turquoise: "#26A69A",
    cyan: "#00ACC1",
    aqua: "#00FFFF",

    lime: "#8BC34A",
    magenta: "#D81B60",
    fuchsia: "#FF00FF",

    khaki: "#C3B091",
    nude: "#E3BC9A",
  };

  if (colourMap[name]) {
    return colourMap[name];
  }

  /*
    If admin has entered an actual CSS colour or hex value,
    allow it to work too.
  */

  if (
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(name) ||
    /^(rgb|rgba|hsl|hsla)\(/i.test(name)
  ) {
    return name;
  }

  /*
    Unknown colour fallback.
    This prevents the circle from becoming invisible.
  */

  return "#D9D9D9";
};

const getColourCircleBorder = (colourName: string) => {
  const name = normalizeColour(colourName);

  const lightColours = [
    "white",
    "cream",
    "ivory",
    "off white",
    "beige",
    "light yellow",
    "light pink",
    "silver",
  ];

  if (lightColours.includes(name)) {
    return "#B8B8B8";
  }

  return "#D1D5DB";
};

const isLightColour = (colourName: string) => {
  const name = normalizeColour(colourName);

  return [
    "white",
    "cream",
    "ivory",
    "off white",
    "beige",
    "light yellow",
    "light pink",
    "silver",
  ].includes(name);
};

/* =========================================================
   PAGE
========================================================= */

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  /* =======================================================
     STATE
  ======================================================= */

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColour, setSelectedColour] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [addingToBag, setAddingToBag] = useState(false);
  const [addingToWishlist, setAddingToWishlist] =
    useState(false);

  const [selectedImage, setSelectedImage] = useState("");

  const [showSizeChart, setShowSizeChart] = useState(false);

  /* =======================================================
     PRODUCT QUERY
  ======================================================= */

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery<any>(PRODUCT_QUERY, {
    variables: {
      id: productId,
    },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  /* =======================================================
     REVIEW QUERY
  ======================================================= */

  const {
    data: reviewsData,
    loading: reviewsLoading,
  } = useQuery<any>(PRODUCT_REVIEWS_QUERY, {
    variables: {
      productId,
    },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createBasket] = useMutation<any>(CREATE_BASKET);

  const [addWishlist] = useMutation<any>(ADD_WISHLIST);

  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const product: Product | null =
    productData?.product || null;

  const reviews: Review[] =
    reviewsData?.productReviews || [];

  const productRating: ProductRating =
    reviewsData?.productRating || {
      averageRating: 0,
      totalReviews: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    };

  /* =======================================================
     COLOUR OPTIONS
     
     IMPORTANT:
     - 0 colours = no colour required
     - 1 colour = automatically selected
     - 2+ colours = customer must select
  ======================================================= */

  const colourOptions = product?.colours ?? [];

  const hasColours = colourOptions.length > 0;

  const hasMultipleColours =
    colourOptions.length > 1;

  /*
    This is the most important part.

    If there is exactly ONE colour, we use that colour
    even if React state has not updated yet.

    Therefore the customer never gets:
    "Please select a colour."
  */

  const effectiveSelectedColour =
    colourOptions.length === 1
      ? colourOptions[0]
      : selectedColour.trim();

  /* =======================================================
     AUTO SELECT COLOUR
  ======================================================= */

  useEffect(() => {
    if (!product) {
      return;
    }

    const colours = product.colours ?? [];

    setSelectedSize("");
    setQuantity(1);
    setSelectedImage("");

    /*
      ONE COLOUR

      Automatically select it.
    */

    if (colours.length === 1) {
      const onlyColour = colours[0];

      setSelectedColour(onlyColour);

      const matchingImage =
        product.colourImages?.find(
          (item) =>
            normalizeColour(item.colour) ===
            normalizeColour(onlyColour)
        )?.image;

      if (matchingImage) {
        setSelectedImage(matchingImage);
      }

      return;
    }

    /*
      MULTIPLE COLOURS

      Do not automatically choose one.
      Customer must choose.
    */

    setSelectedColour("");
  }, [product?.id]);

  /* =======================================================
     ALL PRODUCT IMAGES
  ======================================================= */

  const allImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const images: string[] = [];

    if (product.image) {
      images.push(product.image);
    }

    if (product.productImages) {
      product.productImages.forEach((item) => {
        if (
          item.image &&
          !images.includes(item.image)
        ) {
          images.push(item.image);
        }
      });
    }

    if (product.colourImages) {
      product.colourImages.forEach((item) => {
        if (
          item.image &&
          !images.includes(item.image)
        ) {
          images.push(item.image);
        }
      });
    }

    return images;
  }, [product]);

  /* =======================================================
     SELECTED COLOUR IMAGE
  ======================================================= */

  const selectedColourImage = useMemo(() => {
    if (
      !product ||
      !effectiveSelectedColour ||
      !product.colourImages
    ) {
      return "";
    }

    const colourImage =
      product.colourImages.find(
        (item) =>
          normalizeColour(item.colour) ===
          normalizeColour(effectiveSelectedColour)
      );

    return colourImage?.image || "";
  }, [product, effectiveSelectedColour]);

  /* =======================================================
     DISPLAY IMAGE
  ======================================================= */

  const displayImage =
    selectedColourImage ||
    selectedImage ||
    product?.image ||
    allImages[0] ||
    "";

  /* =======================================================
     COLOUR CHANGE
  ======================================================= */

  const handleColourChange = (colour: string) => {
    setSelectedColour(colour);

    const matchingImage =
      product?.colourImages?.find(
        (item) =>
          normalizeColour(item.colour) ===
          normalizeColour(colour)
      )?.image;

    if (matchingImage) {
      setSelectedImage(matchingImage);
    }
  };

  /* =======================================================
     RATING PERCENTAGE
  ======================================================= */

  const getPercentage = (count: number) => {
    if (!productRating.totalReviews) {
      return 0;
    }

    return Math.round(
      (count / productRating.totalReviews) * 100
    );
  };

  /* =======================================================
     RATING DATA
  ======================================================= */

  const ratingRows = [
    {
      star: 5,
      count: productRating.fiveStar,
    },
    {
      star: 4,
      count: productRating.fourStar,
    },
    {
      star: 3,
      count: productRating.threeStar,
    },
    {
      star: 2,
      count: productRating.twoStar,
    },
    {
      star: 1,
      count: productRating.oneStar,
    },
  ];

  /* =======================================================
     AUTH USER
  ======================================================= */

  const getAuthUser = () => {
    try {
      const storedUser =
        localStorage.getItem("authUser");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  /* =======================================================
     ADD TO BAG
  ======================================================= */

  const handleAddToBag = async () => {
    if (!product) {
      return;
    }

    const authUser = getAuthUser();

    if (!authUser?.id) {
      alert(
        "Please login to add products to your basket."
      );

      router.push("/customer-login");
      return;
    }

    const isProductActive =
      String(product.status ?? "")
        .trim()
        .toLowerCase() === "active";

    if (!isProductActive) {
      alert(
        "This product is currently unavailable."
      );
      return;
    }

    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    /* =====================================================
       SIZE VALIDATION
    ===================================================== */

    if (
      product.sizes &&
      product.sizes.length > 0 &&
      !selectedSize
    ) {
      alert("Please select a size.");
      return;
    }

    /* =====================================================
       COLOUR VALIDATION

       ONE COLOUR:
       Automatically accepted.

       MULTIPLE COLOURS:
       Customer must select one.
    ===================================================== */

    const colourOptions = product.colours ?? [];

    const effectiveColour =
      colourOptions.length === 1
        ? colourOptions[0]
        : selectedColour.trim();

    if (
      colourOptions.length > 1 &&
      !effectiveColour
    ) {
      alert("Please select a colour.");
      return;
    }

    /* =====================================================
       STOCK VALIDATION
    ===================================================== */

    if (quantity > product.stock) {
      alert(
        `Only ${product.stock} item${
          product.stock === 1 ? "" : "s"
        } available.`
      );
      return;
    }

    /* =====================================================
       CREATE BASKET
    ===================================================== */

    try {
      setAddingToBag(true);

      await createBasket({
        variables: {
          userId: authUser.id,
          productId: product.id,
          quantity,
          size: selectedSize || null,

          /*
            IMPORTANT:
            For one-colour products this sends the
            automatically selected colour.
          */

          colour: effectiveColour || null,
        },
      });

      router.push("/basket");
    } catch (error: any) {
      console.error(
        "ADD TO BASKET ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to add product to basket."
      );
    } finally {
      setAddingToBag(false);
    }
  };

  /* =======================================================
     ADD TO WISHLIST
  ======================================================= */

  const handleAddToWishlist = async () => {
    if (!product) {
      return;
    }

    const authUser = getAuthUser();

    if (!authUser?.id) {
      alert(
        "Please login to add products to wishlist."
      );

      router.push("/customer-login");
      return;
    }

    try {
      setAddingToWishlist(true);

      await addWishlist({
        variables: {
          userId: authUser.id,
          productId: product.id,
        },
      });

      alert("Product added to wishlist.");
    } catch (error: any) {
      console.error(
        "ADD TO WISHLIST ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to add product to wishlist."
      );
    } finally {
      setAddingToWishlist(false);
    }
  };

  /* =======================================================
     QUANTITY
  ======================================================= */

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    setQuantity((current) =>
      Math.min(product.stock, current + 1)
    );
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatReviewDate = (
    createdAt?: string
  ) => {
    if (!createdAt) {
      return "";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (productLoading) {
    return (
      <>
        <Header />

        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "#555",
            }}
          >
            Loading product...
          </p>
        </main>
      </>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (productError || !product) {
    return (
      <>
        <Header />

        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#102f56",
              marginBottom: "12px",
            }}
          >
            Product not found
          </h2>

          <p
            style={{
              color: "#777",
              marginBottom: "25px",
            }}
          >
            The product you are looking for is
            unavailable.
          </p>

          <Link
            href="/shop"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#C9A227",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Shop
          </Link>
        </main>
      </>
    );
  }

  const isProductActive =
    String(product.status ?? "")
      .trim()
      .toLowerCase() === "active";

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <Header />

      <main
        style={{
          background: "#fff",
          minHeight: "100vh",
        }}
      >
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "22px 20px 10px",
            color: "#777",
            fontSize: "14px",
          }}
        >
          <Link
            href="/shop"
            style={{
              color: "#102f56",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Shop
          </Link>

          <span style={{ margin: "0 8px" }}>
            /
          </span>

          <span>{product.name}</span>
        </div>

        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "25px 20px 60px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "55px",
            }}
            className="product-details-grid"
          >
            {/* =============================================
                LEFT - IMAGES
            ============================================== */}

            <div>
              {/* Main Image */}

              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#F8F9FB",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #eee",
                }}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "#999",
                    }}
                  >
                    No Image
                  </span>
                )}
              </div>

              {/* Thumbnail Images */}

              {allImages.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "16px",
                    overflowX: "auto",
                    paddingBottom: "5px",
                  }}
                >
                  {allImages.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(image)
                        }
                        style={{
                          width: "75px",
                          height: "75px",
                          minWidth: "75px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border:
                            displayImage === image
                              ? "2px solid #C9A227"
                              : "1px solid #ddd",
                          background: "#fff",
                          cursor: "pointer",
                          padding: "3px",
                        }}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${
                            index + 1
                          }`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =============================================
                RIGHT - PRODUCT INFO
            ============================================== */}

            <div>
              {/* Category */}

              {product.category && (
                <p
                  style={{
                    color: "#C9A227",
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  {product.category}
                </p>
              )}

              {/* Product Name */}

              <h1
                style={{
                  color: "#102f56",
                  fontSize: "34px",
                  lineHeight: 1.2,
                  margin: "0 0 12px",
                  fontWeight: 800,
                }}
              >
                {product.name}
              </h1>

              {/* Brand */}

              {product.brand?.name && (
                <p
                  style={{
                    color: "#666",
                    fontSize: "15px",
                    marginBottom: "15px",
                  }}
                >
                  Brand:{" "}
                  <strong
                    style={{
                      color: "#102f56",
                    }}
                  >
                    {product.brand.name}
                  </strong>
                </p>
              )}

              {/* Rating */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#FFF8DF",
                    color: "#102f56",
                    borderRadius: "7px",
                    padding: "7px 10px",
                    fontWeight: 800,
                  }}
                >
                  â˜…{" "}
                  {productRating.averageRating.toFixed(
                    1
                  )}
                </span>

                <span
                  style={{
                    color: "#777",
                    fontSize: "14px",
                  }}
                >
                  {productRating.totalReviews}{" "}
                  {productRating.totalReviews === 1
                    ? "review"
                    : "reviews"}
                </span>
              </div>

              {/* Price */}

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#102f56",
                  marginBottom: "20px",
                }}
              >
                â‚¹
                {Number(
                  product.price
                ).toLocaleString("en-IN")}
              </div>

              {/* Description */}

              {product.description && (
                <div
                  style={{
                    marginBottom: "25px",
                  }}
                >
                  <h3
                    style={{
                      color: "#102f56",
                      fontSize: "17px",
                      marginBottom: "8px",
                    }}
                  >
                    Description
                  </h3>

                  <p
                    style={{
                      color: "#666",
                      lineHeight: 1.7,
                      fontSize: "15px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* ===========================================
                  COLOURS
              ============================================ */}

              {hasColours && (
                <div
                  style={{
                    marginBottom: "25px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <h3
                      style={{
                        color: "#102f56",
                        fontSize: "16px",
                        margin: 0,
                      }}
                    >
                      Colour
                    </h3>

                    {/* 
                      For one colour, show it as
                      automatically selected.
                    */}

                    <span
                      style={{
                        color: "#666",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {effectiveSelectedColour}
                    </span>
                  </div>

                  {/* =====================================
                      ONE COLOUR
                      
                      NO selection required.
                      
                      This is only informational.
                  ====================================== */}

                  {!hasMultipleColours ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 14px 8px 8px",
                        border:
                          "1px solid #E5E5E5",
                        borderRadius: "999px",
                        background: "#FAFAFA",
                      }}
                    >
                      <span
                        style={{
                          width: "42px",
                          height: "42px",
                          minWidth: "42px",
                          borderRadius: "50%",
                          background:
                            getColourValue(
                              colourOptions[0]
                            ),
                          border: `2px solid ${getColourCircleBorder(
                            colourOptions[0]
                          )}`,
                          boxShadow:
                            "0 1px 4px rgba(0,0,0,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "17px",
                            fontWeight: 800,
                            color: isLightColour(
                              colourOptions[0]
                            )
                              ? "#333"
                              : "#fff",
                          }}
                        >
                          âœ“
                        </span>
                      </span>

                      <span
                        style={{
                          color: "#102f56",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {colourOptions[0]}
                      </span>

                      <span
                        style={{
                          color: "#777",
                          fontSize: "12px",
                        }}
                      >
                        Selected
                      </span>
                    </div>
                  ) : (
                    /* ===================================
                       MULTIPLE COLOURS

                       Customer MUST choose one.
                    ==================================== */

                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "20px",
                          alignItems: "flex-start",
                        }}
                      >
                        {colourOptions.map(
                          (colour) => {
                            const isSelected =
                              normalizeColour(
                                selectedColour
                              ) ===
                              normalizeColour(
                                colour
                              );

                            const matchingImage =
                              product.colourImages?.find(
                                (item) =>
                                  normalizeColour(
                                    item.colour
                                  ) ===
                                  normalizeColour(
                                    colour
                                  )
                              )?.image;

                            const circleColour =
                              getColourValue(
                                colour
                              );

                            const circleBorder =
                              getColourCircleBorder(
                                colour
                              );

                            return (
                              <button
                                key={colour}
                                type="button"
                                title={`Select ${colour}`}
                                onClick={() =>
                                  handleColourChange(
                                    colour
                                  )}
                                style={{
                                  border: "none",
                                  background:
                                    "transparent",
                                  padding: 0,
                                  margin: 0,
                                  cursor: "pointer",
                                  display: "flex",
                                  flexDirection:
                                    "column",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                  minWidth: "68px",
                                }}
                              >
                                {/* Colour Circle */}

                                <span
                                  style={{
                                    width: "52px",
                                    height: "52px",
                                    minWidth: "52px",
                                    borderRadius:
                                      "50%",
                                    background:
                                      circleColour,
                                    border: isSelected
                                      ? "3px solid #C9A227"
                                      : `2px solid ${circleBorder}`,
                                    boxShadow:
                                      isSelected
                                        ? "0 0 0 4px #FFF3C4, 0 3px 8px rgba(0,0,0,0.12)"
                                        : "0 2px 6px rgba(0,0,0,0.12)",
                                    display: "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    transition:
                                      "all 0.2s ease",
                                  }}
                                >
                                  {isSelected && (
                                    <span
                                      style={{
                                        width:
                                          "25px",
                                        height:
                                          "25px",
                                        borderRadius:
                                          "50%",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        background:
                                          isLightColour(
                                            colour
                                          )
                                            ? "rgba(0,0,0,0.08)"
                                            : "rgba(255,255,255,0.2)",
                                        color:
                                          isLightColour(
                                            colour
                                          )
                                            ? "#333"
                                            : "#fff",
                                        fontSize:
                                          "15px",
                                        fontWeight:
                                          900,
                                      }}
                                    >
                                      âœ“
                                    </span>
                                  )}
                                </span>

                                {/* Colour Name */}

                                <span
                                  style={{
                                    color: isSelected
                                      ? "#102f56"
                                      : "#555",
                                    fontSize:
                                      "13px",
                                    fontWeight:
                                      isSelected
                                        ? 700
                                        : 500,
                                    textAlign:
                                      "center",
                                    lineHeight: 1.2,
                                    maxWidth:
                                      "85px",
                                    wordBreak:
                                      "break-word",
                                  }}
                                >
                                  {colour}
                                </span>

                                {matchingImage && (
                                  <span
                                    style={{
                                      display: "none",
                                    }}
                                  >
                                    {matchingImage}
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {!selectedColour && (
                        <p
                          style={{
                            margin:
                              "12px 0 0",
                            color: "#777",
                            fontSize: "13px",
                          }}
                        >
                          Please select a colour
                          before adding to
                          basket.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===========================================
                  SIZES
              ============================================ */}

              {product.sizes &&
                product.sizes.length > 0 && (
                  <div
                    style={{
                      marginBottom: "22px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#102f56",
                          fontSize: "16px",
                          margin: 0,
                        }}
                      >
                        Size
                      </h3>

                      {product.sizechart && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSizeChart(true)
                          }
                          style={{
                            border: "none",
                            background:
                              "transparent",
                            color: "#C9A227",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Size Chart
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      {product.sizes.map(
                        (size) => {
                          const isSelected =
                            selectedSize ===
                            size;

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                setSelectedSize(
                                  size
                                )
                              }
                              style={{
                                minWidth: "52px",
                                padding:
                                  "10px 14px",
                                borderRadius:
                                  "8px",
                                border:
                                  isSelected
                                    ? "2px solid #C9A227"
                                    : "1px solid #ddd",
                                background:
                                  isSelected
                                    ? "#FFF8DF"
                                    : "#fff",
                                color:
                                  "#102f56",
                                fontWeight:
                                  isSelected
                                    ? 700
                                    : 500,
                                cursor:
                                  "pointer",
                              }}
                            >
                              {size}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* ===========================================
                  STOCK
              ============================================ */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                {product.stock > 0 ? (
                  <p
                    style={{
                      color: "#238636",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    âœ“ In Stock{" "}
                    <span
                      style={{
                        color: "#777",
                        fontWeight: 400,
                      }}
                    >
                      ({product.stock}{" "}
                      available)
                    </span>
                  </p>
                ) : (
                  <p
                    style={{
                      color: "#d32f2f",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Out of Stock
                  </p>
                )}
              </div>

              {/* ===========================================
                  QUANTITY
              ============================================ */}

              {product.stock > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "22px",
                  }}
                >
                  <span
                    style={{
                      color: "#102f56",
                      fontWeight: 700,
                    }}
                  >
                    Quantity
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      style={{
                        width: "38px",
                        height: "38px",
                        border: "none",
                        background:
                          "#f8f8f8",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      âˆ’
                    </button>

                    <span
                      style={{
                        width: "45px",
                        textAlign: "center",
                        fontWeight: 700,
                        color: "#102f56",
                      }}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      style={{
                        width: "38px",
                        height: "38px",
                        border: "none",
                        background:
                          "#f8f8f8",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* ===========================================
                  ACTION BUTTONS
              ============================================ */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "25px",
                }}
              >
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={
                    addingToBag ||
                    product.stock <= 0 ||
                    !isProductActive
                  }
                  style={{
                    flex: "1 1 220px",
                    minHeight: "50px",
                    border: "none",
                    borderRadius: "9px",
                    background:
                      addingToBag ||
                      product.stock <= 0 ||
                      !isProductActive
                        ? "#ccc"
                        : "#102f56",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor:
                      addingToBag ||
                      product.stock <= 0 ||
                      !isProductActive
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingToBag
                    ? "Adding..."
                    : product.stock <= 0
                    ? "Out of Stock"
                    : "Add to Basket"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleAddToWishlist
                  }
                  disabled={
                    addingToWishlist
                  }
                  style={{
                    minHeight: "50px",
                    padding: "0 22px",
                    borderRadius: "9px",
                    border:
                      "1.5px solid #C9A227",
                    background: "#FFFDF5",
                    color: "#102f56",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor:
                      addingToWishlist
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingToWishlist
                    ? "Adding..."
                    : "â™¡ Wishlist"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px 70px",
          }}
        >
          <div
            style={{
              borderTop:
                "1px solid #e8e8e8",
              paddingTop: "45px",
            }}
          >
            <h2
              style={{
                color: "#102f56",
                fontSize: "28px",
                marginBottom: "30px",
                fontWeight: 800,
              }}
            >
              Customer Reviews
            </h2>

            {/* Rating Summary */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "260px minmax(0, 1fr)",
                gap: "45px",
                padding: "25px",
                background: "#F8F9FB",
                borderRadius: "14px",
                marginBottom: "40px",
              }}
              className="review-summary-grid"
            >
              {/* Average */}

              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection:
                    "column",
                  alignItems: "center",
                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize: "52px",
                    lineHeight: 1,
                    fontWeight: 800,
                    color: "#102f56",
                  }}
                >
                  {productRating.averageRating.toFixed(
                    1
                  )}
                </div>

                <div
                  style={{
                    color: "#C9A227",
                    fontSize: "24px",
                    letterSpacing: "2px",
                    margin: "8px 0",
                  }}
                >
                  â˜…â˜…â˜…â˜…â˜…
                </div>

                <div
                  style={{
                    color: "#777",
                    fontSize: "14px",
                  }}
                >
                  Based on{" "}
                  <strong>
                    {
                      productRating.totalReviews
                    }
                  </strong>{" "}
                  {productRating.totalReviews ===
                  1
                    ? "review"
                    : "reviews"}
                </div>
              </div>

              {/* Distribution */}

              <div>
                {ratingRows.map(
                  ({ star, count }) => {
                    const percentage =
                      getPercentage(count);

                    return (
                      <div
                        key={star}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "45px 1fr 55px",
                          alignItems:
                            "center",
                          gap: "10px",
                          marginBottom:
                            "12px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              "#102f56",
                            fontSize:
                              "14px",
                            fontWeight: 700,
                          }}
                        >
                          {star} â˜…
                        </span>

                        <div
                          style={{
                            height: "9px",
                            background:
                              "#e3e3e3",
                            borderRadius:
                              "20px",
                            overflow:
                              "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background:
                                "#C9A227",
                              borderRadius:
                                "20px",
                              transition:
                                "width 0.3s ease",
                            }}
                          />
                        </div>

                        <span
                          style={{
                            color: "#777",
                            fontSize:
                              "13px",
                            textAlign:
                              "right",
                          }}
                        >
                          {percentage}%
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Review List */}

            {reviewsLoading ? (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  padding: "35px",
                  textAlign: "center",
                  border:
                    "1px solid #eee",
                  borderRadius: "12px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                    marginBottom: "10px",
                  }}
                >
                  â˜†
                </div>

                <h3
                  style={{
                    color: "#102f56",
                    marginBottom: "7px",
                  }}
                >
                  No reviews yet
                </h3>

                <p
                  style={{
                    color: "#777",
                    margin: 0,
                  }}
                >
                  Reviews from customers will
                  appear here after they submit
                  them from My Orders.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "18px",
                }}
              >
                {reviews.map((review) => {
                  const rating = Math.min(
                    5,
                    Math.max(
                      0,
                      Number(review.rating)
                    )
                  );

                  return (
                    <article
                      key={review.id}
                      style={{
                        border:
                          "1px solid #e7e7e7",
                        borderRadius: "12px",
                        padding: "22px",
                        background: "#fff",
                      }}
                    >
                      {/* Customer + Rating */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "15px",
                          flexWrap:
                            "wrap",
                          marginBottom:
                            "12px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color:
                                "#102f56",
                              fontWeight:
                                800,
                              fontSize:
                                "16px",
                              marginBottom:
                                "5px",
                            }}
                          >
                            {review.customerName ||
                              "Customer"}
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "2px",
                              fontSize:
                                "18px",
                            }}
                          >
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <span
                                  key={star}
                                  style={{
                                    color:
                                      star <=
                                      rating
                                        ? "#C9A227"
                                        : "#ddd",
                                  }}
                                >
                                  â˜…
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {review.createdAt && (
                          <span
                            style={{
                              color: "#888",
                              fontSize:
                                "13px",
                            }}
                          >
                            {formatReviewDate(
                              review.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      {/* Comment */}

                      <p
                        style={{
                          color: "#555",
                          lineHeight: 1.7,
                          margin: 0,
                          fontSize: "15px",
                          whiteSpace:
                            "pre-line",
                        }}
                      >
                        {review.comment}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ===================================================
          SIZE CHART MODAL
      =================================================== */}

      {showSizeChart &&
        product.sizechart && (
          <div
            onClick={() =>
              setShowSizeChart(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.55)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "20px",
                maxWidth: "900px",
                maxHeight: "90vh",
                overflow: "auto",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowSizeChart(false)
                }
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "12px",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#102f56",
                  color: "#fff",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                Ã—
              </button>

              <h2
                style={{
                  color: "#102f56",
                  marginBottom: "18px",
                  paddingRight: "45px",
                }}
              >
                Size Chart
              </h2>

              <img
                src={product.sizechart}
                alt={`${product.name} size chart`}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>
          </div>
        )}

      {/* ===================================================
          RESPONSIVE STYLES
      =================================================== */}

      <style jsx>{`
        @media (max-width: 768px) {
          .product-details-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }

          .review-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }

        @media (max-width: 480px) {
          .product-details-grid {
            gap: 20px !important;
          }
        }
      `}</style>
    </>
  );
}