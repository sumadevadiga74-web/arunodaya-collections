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
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");

  const [showSizeChart, setShowSizeChart] = useState(false);

  /* =======================================================
     PRODUCT QUERY
  ======================================================= */

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(PRODUCT_QUERY, {
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
  } = useQuery(PRODUCT_REVIEWS_QUERY, {
    variables: {
      productId,
    },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createBasket] = useMutation(CREATE_BASKET);

  const [addWishlist] = useMutation(ADD_WISHLIST);

  /* =======================================================
     PRODUCT
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
     IMPORTANT COLOUR LOGIC

     0 colours:
       No colour selection.

     1 colour:
       Automatically selected.
       Customer does NOT need to select.

     2+ colours:
       Customer must select one.
  ======================================================= */

  const effectiveColour =
    product?.colours?.length === 1
      ? product.colours[0]
      : selectedColour;

  /* =======================================================
     AUTO SELECT SINGLE COLOUR
  ======================================================= */

  useEffect(() => {
    if (!product) {
      return;
    }

    /* Reset size */
    setSelectedSize("");

    /* Reset quantity */
    setQuantity(1);

    /* No colours */
    if (
      !product.colours ||
      product.colours.length === 0
    ) {
      setSelectedColour("");
      return;
    }

    /* ONE COLOUR */

    if (product.colours.length === 1) {
      const onlyColour =
        product.colours[0];

      /*
        Automatically store the only colour.
        Customer does not have to click anything.
      */
      setSelectedColour(onlyColour);

      const matchingImage =
        product.colourImages?.find(
          (item) =>
            item.colour.trim().toLowerCase() ===
            onlyColour.trim().toLowerCase()
        )?.image;

      if (matchingImage) {
        setSelectedImage(matchingImage);
      }
    }

    /* MULTIPLE COLOURS */

    else {
      /*
        Important:
        Do NOT automatically select the first colour.
        Customer must choose.
      */
      setSelectedColour("");
      setSelectedImage("");
    }
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
     CURRENT IMAGE
  ======================================================= */

  const currentImage =
    selectedImage ||
    product?.image ||
    allImages[0] ||
    "";

  /* =======================================================
     SELECTED COLOUR IMAGE
  ======================================================= */

  const selectedColourImage = useMemo(() => {
    if (
      !product ||
      !effectiveColour ||
      !product.colourImages
    ) {
      return "";
    }

    const colourImage =
      product.colourImages.find(
        (item) =>
          item.colour.trim().toLowerCase() ===
          effectiveColour.trim().toLowerCase()
      );

    return colourImage?.image || "";
  }, [
    product,
    effectiveColour,
  ]);

  /* =======================================================
     DISPLAY IMAGE
  ======================================================= */

  const displayImage =
    selectedColourImage || currentImage;

  /* =======================================================
     COLOUR VALUE
  ======================================================= */

  const getColourValue = (
    colour: string
  ) => {
    const normalized = colour
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const colourMap: Record<
      string,
      string
    > = {
      black: "#000000",
      white: "#ffffff",

      red: "#e53935",
      "dark red": "#8b0000",
      maroon: "#800000",
      wine: "#722f37",
      burgundy: "#800020",

      pink: "#f48fb1",
      "light pink": "#f8bbd0",
      "dark pink": "#c2185b",
      rose: "#e91e63",

      yellow: "#fdd835",
      mustard: "#d4a017",

      orange: "#fb8c00",
      peach: "#ffb07c",
      coral: "#ff7f50",

      blue: "#1e88e5",
      "light blue": "#90caf9",
      "dark blue": "#0d47a1",
      navy: "#102f56",
      "navy blue": "#102f56",
      "sky blue": "#81d4fa",
      sky: "#81d4fa",
      royal: "#4169e1",
      "royal blue": "#4169e1",

      green: "#43a047",
      "light green": "#81c784",
      "dark green": "#1b5e20",
      darkgreen: "#1b5e20",
      olive: "#808000",
      mint: "#98ff98",
      teal: "#00897b",
      turquoise: "#26a69a",

      purple: "#8e24aa",
      violet: "#7e57c2",
      lavender: "#b39ddb",
      magenta: "#d81b60",

      brown: "#795548",
      "dark brown": "#4e342e",
      tan: "#d2b48c",

      beige: "#d7c4a3",
      cream: "#fff1c1",
      ivory: "#fffff0",

      grey: "#9e9e9e",
      gray: "#9e9e9e",
      "dark grey": "#616161",
      "dark gray": "#616161",
      "light grey": "#eeeeee",
      "light gray": "#eeeeee",

      silver: "#c0c0c0",
      gold: "#d4af37",
    };

    return (
      colourMap[normalized] ||
      "#d9d9d9"
    );
  };

  /* =======================================================
     COLOUR BORDER
  ======================================================= */

  const getColourCircleBorder = (
    colour: string
  ) => {
    const normalized = colour
      .trim()
      .toLowerCase();

    if (
      normalized === "white" ||
      normalized === "cream" ||
      normalized === "beige" ||
      normalized === "ivory" ||
      normalized === "light grey" ||
      normalized === "light gray"
    ) {
      return "#aaa";
    }

    return "transparent";
  };

  /* =======================================================
     RATING PERCENTAGE
  ======================================================= */

  const getPercentage = (
    count: number
  ) => {
    if (!productRating.totalReviews) {
      return 0;
    }

    return Math.round(
      (count /
        productRating.totalReviews) *
        100
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
        localStorage.getItem(
          "authUser"
        );

      if (!storedUser) {
        return null;
      }

      return JSON.parse(
        storedUser
      );
    } catch {
      return null;
    }
  };

  /* =======================================================
     ADD TO BAG
  ======================================================= */

  const handleAddToBag = async () => {
    console.log("ADD TO BASKET CLICKED", {
  productId: product?.id,
  status: product?.status,
  stock: product?.stock,
  sizes: product?.sizes,
  selectedSize,
  colours: product?.colours,
  selectedColour,
  quantity,
});
    if (!product) {
      return;
    }

    const authUser =
      getAuthUser();

    if (!authUser?.id) {
      alert(
        "Please login to add products to your basket."
      );

      router.push(
        "/customer-login"
      );

      return;
    }

    /* PRODUCT STATUS */

    if (
      product.status !== "active"
    ) {
      alert(
        "This product is currently unavailable."
      );

      return;
    }

    /* STOCK */

    if (product.stock <= 0) {
      alert(
        "This product is out of stock."
      );

      return;
    }

    /* SIZE */

    if (
      product.sizes &&
      product.sizes.length > 0 &&
      !selectedSize
    ) {
      alert(
        "Please select a size."
      );

      return;
    }

    /* =====================================================
       COLOUR VALIDATION

       ONLY ask when there are MULTIPLE colours.

       If there is exactly ONE colour,
       effectiveColour automatically contains
       that colour.
    ===================================================== */

    if (
      product.colours &&
      product.colours.length > 1 &&
      !selectedColour
    ) {
      alert(
        "Please select a colour."
      );

      return;
    }

    /* QUANTITY */

    if (
      quantity > product.stock
    ) {
      alert(
        `Only ${product.stock} item${
          product.stock === 1
            ? ""
            : "s"
        } available.`
      );

      return;
    }

    try {
      setAddingToBag(true);

      console.log(
        "ADDING PRODUCT TO BASKET:",
        {
          userId: authUser.id,
          productId: product.id,
          quantity,
          size:
            selectedSize || null,
          colour:
            effectiveColour || null,
        }
      );

      await createBasket({
        variables: {
          userId: String(
            authUser.id
          ),

          productId: String(
            product.id
          ),

          quantity,

          size:
            selectedSize || null,

          /*
            IMPORTANT:
            For one colour this will automatically
            contain that colour.
          */
          colour:
            effectiveColour || null,
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

  const handleAddToWishlist =
    async () => {
      if (!product) {
        return;
      }

      const authUser =
        getAuthUser();

      if (!authUser?.id) {
        alert(
          "Please login to add products to wishlist."
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      try {
        setAddingToWishlist(
          true
        );

        await addWishlist({
          variables: {
            userId:
              authUser.id,

            productId:
              product.id,
          },
        });

        alert(
          "Product added to wishlist."
        );
      } catch (error: any) {
        console.error(
          "ADD WISHLIST ERROR:",
          error
        );

        alert(
          error?.message ||
            "Unable to add product to wishlist."
        );
      } finally {
        setAddingToWishlist(
          false
        );
      }
    };

  /* =======================================================
     QUANTITY
  ======================================================= */

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  const increaseQuantity =
    () => {
      if (!product) {
        return;
      }

      setQuantity(
        (current) =>
          Math.min(
            product.stock,
            current + 1
          )
      );
    };

  /* =======================================================
     REVIEW DATE
  ======================================================= */

  const formatReviewDate = (
    createdAt?: string
  ) => {
    if (!createdAt) {
      return "";
    }

    const date =
      new Date(createdAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
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
            maxWidth:
              "1200px",
            margin: "0 auto",
            padding:
              "60px 20px",
            textAlign:
              "center",
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

  if (
    productError ||
    !product
  ) {
    return (
      <>
        <Header />

        <main
          style={{
            maxWidth:
              "1200px",
            margin: "0 auto",
            padding:
              "60px 20px",
            textAlign:
              "center",
          }}
        >
          <h2
            style={{
              color: "#102f56",
              marginBottom:
                "12px",
            }}
          >
            Product not found
          </h2>

          <p
            style={{
              color: "#777",
              marginBottom:
                "25px",
            }}
          >
            The product you are
            looking for is
            unavailable.
          </p>

          <Link
            href="/shop"
            style={{
              display:
                "inline-block",
              padding:
                "12px 24px",
              background:
                "#C9A227",
              color: "#fff",
              borderRadius:
                "8px",
              textDecoration:
                "none",
              fontWeight: 700,
            }}
          >
            Back to Shop
          </Link>
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

      <main
        style={{
          background: "#fff",
          minHeight:
            "100vh",
        }}
      >
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div
          style={{
            maxWidth:
              "1200px",
            margin: "0 auto",
            padding:
              "22px 20px 10px",
            color: "#777",
            fontSize:
              "14px",
          }}
        >
          <Link
            href="/shop"
            style={{
              color: "#102f56",
              textDecoration:
                "none",
              fontWeight: 600,
            }}
          >
            Shop
          </Link>

          <span
            style={{
              margin:
                "0 8px",
            }}
          >
            /
          </span>

          <span>
            {product.name}
          </span>
        </div>

        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <section
          style={{
            maxWidth:
              "1200px",
            margin: "0 auto",
            padding:
              "25px 20px 60px",
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
            {/* =================================================
                LEFT - IMAGES
            ================================================= */}

            <div>
              <div
                style={{
                  width: "100%",
                  aspectRatio:
                    "1 / 1",
                  background:
                    "#F8F9FB",
                  borderRadius:
                    "16px",
                  overflow:
                    "hidden",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  border:
                    "1px solid #eee",
                }}
              >
                {displayImage ? (
                  <img
                    src={
                      displayImage
                    }
                    alt={
                      product.name
                    }
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      objectFit:
                        "contain",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color:
                        "#999",
                    }}
                  >
                    No Image
                  </span>
                )}
              </div>

              {allImages.length >
                1 && (
                <div
                  style={{
                    display:
                      "flex",
                    gap: "12px",
                    marginTop:
                      "16px",
                    overflowX:
                      "auto",
                    paddingBottom:
                      "5px",
                  }}
                >
                  {allImages.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            image
                          )
                        }
                        style={{
                          width:
                            "75px",
                          height:
                            "75px",
                          minWidth:
                            "75px",
                          borderRadius:
                            "10px",
                          overflow:
                            "hidden",
                          border:
                            displayImage ===
                            image
                              ? "2px solid #C9A227"
                              : "1px solid #ddd",
                          background:
                            "#fff",
                          cursor:
                            "pointer",
                          padding:
                            "3px",
                        }}
                      >
                        <img
                          src={
                            image
                          }
                          alt={`${product.name} ${
                            index +
                            1
                          }`}
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "contain",
                          }}
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                RIGHT - PRODUCT INFO
            ================================================= */}

            <div>
              {/* CATEGORY */}

              {product.category && (
                <p
                  style={{
                    color:
                      "#C9A227",
                    fontWeight:
                      700,
                    fontSize:
                      "14px",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "1px",
                    marginBottom:
                      "8px",
                  }}
                >
                  {
                    product.category
                  }
                </p>
              )}

              {/* NAME */}

              <h1
                style={{
                  color:
                    "#102f56",
                  fontSize:
                    "34px",
                  lineHeight:
                    1.2,
                  margin:
                    "0 0 12px",
                  fontWeight:
                    800,
                }}
              >
                {
                  product.name
                }
              </h1>

              {/* BRAND */}

              {product.brand
                ?.name && (
                <p
                  style={{
                    color:
                      "#666",
                    fontSize:
                      "15px",
                    marginBottom:
                      "15px",
                  }}
                >
                  Brand:{" "}
                  <strong
                    style={{
                      color:
                        "#102f56",
                    }}
                  >
                    {
                      product
                        .brand
                        .name
                    }
                  </strong>
                </p>
              )}

              {/* RATING */}

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  marginBottom:
                    "20px",
                  flexWrap:
                    "wrap",
                }}
              >
                <span
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: "5px",
                    background:
                      "#FFF8DF",
                    color:
                      "#102f56",
                    borderRadius:
                      "7px",
                    padding:
                      "7px 10px",
                    fontWeight:
                      800,
                  }}
                >
                  ★{" "}
                  {productRating.averageRating.toFixed(
                    1
                  )}
                </span>

                <span
                  style={{
                    color:
                      "#777",
                    fontSize:
                      "14px",
                  }}
                >
                  {
                    productRating.totalReviews
                  }{" "}
                  {productRating.totalReviews ===
                  1
                    ? "review"
                    : "reviews"}
                </span>
              </div>

              {/* PRICE */}

              <div
                style={{
                  fontSize:
                    "30px",
                  fontWeight:
                    800,
                  color:
                    "#102f56",
                  marginBottom:
                    "20px",
                }}
              >
                ₹
                {Number(
                  product.price
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <div
                  style={{
                    marginBottom:
                      "25px",
                  }}
                >
                  <h3
                    style={{
                      color:
                        "#102f56",
                      fontSize:
                        "17px",
                      marginBottom:
                        "8px",
                    }}
                  >
                    Description
                  </h3>

                  <p
                    style={{
                      color:
                        "#666",
                      lineHeight:
                        1.7,
                      fontSize:
                        "15px",
                      whiteSpace:
                        "pre-line",
                    }}
                  >
                    {
                      product.description
                    }
                  </p>
                </div>
              )}

             {/* Colours */}

{product.colours &&
  product.colours.length > 0 && (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-[#0B1F3A]">
        Colour
      </h2>

      {/* ONE COLOUR */}

      {product.colours.length === 1 ? (
        <div className="mt-3 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="block h-11 w-11 shrink-0 rounded-full border-2 border-gray-300 shadow-sm"
            style={{
              backgroundColor:
                product.colours[0].trim().toLowerCase() === "maroon"
                  ? "#800000"
                  : product.colours[0].trim().toLowerCase() ===
                    "white"
                  ? "#ffffff"
                  : product.colours[0].trim().toLowerCase() ===
                    "black"
                  ? "#000000"
                  : product.colours[0].trim().toLowerCase() ===
                    "yellow"
                  ? "#fdd835"
                  : "#d9d9d9",
            }}
          />

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#0B1F3A]">
              {product.colours[0]}
            </span>

            <span className="text-xs text-gray-500">
              Available
            </span>
          </div>
        </div>
      ) : (
        /* MULTIPLE COLOURS */

        <div className="mt-3 flex flex-wrap items-start gap-5">
          {product.colours.map((colour) => {
            const normalizedColour =
              colour.trim().toLowerCase();

            const isSelected =
              selectedColour.trim().toLowerCase() ===
              normalizedColour;

            const matchingImage =
              product.colourImages?.find(
                (item) =>
                  item.colour.trim().toLowerCase() ===
                  normalizedColour
              )?.image;

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
                ? "#f48fb1"
                : normalizedColour === "blue"
                ? "#1e88e5"
                : normalizedColour === "green"
                ? "#43a047"
                : normalizedColour === "orange"
                ? "#fb8c00"
                : normalizedColour === "purple"
                ? "#8e24aa"
                : normalizedColour === "brown"
                ? "#795548"
                : "#d9d9d9";

            return (
              <button
                key={colour}
                type="button"
                title={`Select ${colour}`}
                aria-label={`Select ${colour} colour`}
                onClick={() => {
                  setSelectedColour(colour);

                  if (matchingImage) {
                    setSelectedImage(
                      getImage(matchingImage)
                    );
                  }
                }}
                className="flex min-w-[58px] flex-col items-center gap-2 border-0 bg-transparent p-0 outline-none"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                    isSelected
                      ? "ring-2 ring-[#C9A227] ring-offset-2"
                      : "border border-gray-300 shadow-sm"
                  }`}
                  style={{
                    backgroundColor: circleColour,
                  }}
                >
                  {isSelected && (
                    <span
                      className={
                        normalizedColour === "white"
                          ? "text-base font-bold text-gray-800"
                          : "text-base font-bold text-white"
                      }
                    >
                      ✓
                    </span>
                  )}
                </span>

                <span
                  className={`text-center text-xs leading-tight ${
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
      )}
    </div>
  )}
              {/* =================================================
                  SIZE
              ================================================= */}

              {product.sizes &&
                product.sizes.length >
                  0 && (
                  <div
                    style={{
                      marginBottom:
                        "22px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <h3
                        style={{
                          color:
                            "#102f56",
                          fontSize:
                            "16px",
                          margin: 0,
                        }}
                      >
                        Size
                      </h3>

                      {product.sizechart && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSizeChart(
                              true
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "transparent",
                            color:
                              "#C9A227",
                            fontWeight:
                              700,
                            cursor:
                              "pointer",
                          }}
                        >
                          Size Chart
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
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
                              key={
                                size
                              }
                              type="button"
                              onClick={() =>
                                setSelectedSize(
                                  size
                                )
                              }
                              style={{
                                minWidth:
                                  "52px",
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
                              {
                                size
                              }
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* =================================================
                  STOCK
              ================================================= */}

              <div
                style={{
                  marginBottom:
                    "20px",
                }}
              >
                {product.stock >
                0 ? (
                  <p
                    style={{
                      color:
                        "#238636",
                      fontWeight:
                        700,
                      margin: 0,
                    }}
                  >
                    ✓ In Stock{" "}
                    <span
                      style={{
                        color:
                          "#777",
                        fontWeight:
                          400,
                      }}
                    >
                      (
                      {
                        product.stock
                      }{" "}
                      available)
                    </span>
                  </p>
                ) : (
                  <p
                    style={{
                      color:
                        "#d32f2f",
                      fontWeight:
                        700,
                      margin: 0,
                    }}
                  >
                    Out of Stock
                  </p>
                )}
              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              {product.stock >
                0 && (
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                    marginBottom:
                      "22px",
                  }}
                >
                  <span
                    style={{
                      color:
                        "#102f56",
                      fontWeight:
                        700,
                    }}
                  >
                    Quantity
                  </span>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "8px",
                      overflow:
                        "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      style={{
                        width:
                          "38px",
                        height:
                          "38px",
                        border:
                          "none",
                        background:
                          "#f8f8f8",
                        cursor:
                          "pointer",
                        fontSize:
                          "18px",
                      }}
                    >
                      −
                    </button>

                    <span
                      style={{
                        width:
                          "45px",
                        textAlign:
                          "center",
                        fontWeight:
                          700,
                        color:
                          "#102f56",
                      }}
                    >
                      {
                        quantity
                      }
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      style={{
                        width:
                          "38px",
                        height:
                          "38px",
                        border:
                          "none",
                        background:
                          "#f8f8f8",
                        cursor:
                          "pointer",
                        fontSize:
                          "18px",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div
                style={{
                  display:
                    "flex",
                  gap: "12px",
                  flexWrap:
                    "wrap",
                  marginBottom:
                    "25px",
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleAddToBag
                  }
                  disabled={
                    addingToBag ||
                    product.stock <=
                      0 ||
                    product.status !==
                      "active"
                  }
                  style={{
                    flex:
                      "1 1 220px",
                    minHeight:
                      "50px",
                    border:
                      "none",
                    borderRadius:
                      "9px",
                    background:
                      product.stock <=
                        0 ||
                      product.status !==
                        "active"
                        ? "#ccc"
                        : "#102f56",
                    color:
                      "#fff",
                    fontSize:
                      "16px",
                    fontWeight:
                      700,
                    cursor:
                      addingToBag ||
                      product.stock <=
                        0 ||
                      product.status !==
                        "active"
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingToBag
                    ? "Adding..."
                    : product.stock <=
                      0
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
                    minHeight:
                      "50px",
                    padding:
                      "0 22px",
                    borderRadius:
                      "9px",
                    border:
                      "1.5px solid #C9A227",
                    background:
                      "#FFFDF5",
                    color:
                      "#102f56",
                    fontSize:
                      "16px",
                    fontWeight:
                      700,
                    cursor:
                      addingToWishlist
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingToWishlist
                    ? "Adding..."
                    : "♡ Wishlist"}
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
            maxWidth:
              "1200px",
            margin: "0 auto",
            padding:
              "0 20px 70px",
          }}
        >
          <div
            style={{
              borderTop:
                "1px solid #e8e8e8",
              paddingTop:
                "45px",
            }}
          >
            <h2
              style={{
                color:
                  "#102f56",
                fontSize:
                  "28px",
                marginBottom:
                  "30px",
                fontWeight:
                  800,
              }}
            >
              Customer Reviews
            </h2>

            {/* RATING SUMMARY */}

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "260px minmax(0, 1fr)",
                gap: "45px",
                padding:
                  "25px",
                background:
                  "#F8F9FB",
                borderRadius:
                  "14px",
                marginBottom:
                  "40px",
              }}
              className="review-summary-grid"
            >
              <div
                style={{
                  textAlign:
                    "center",
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "52px",
                    lineHeight:
                      1,
                    fontWeight:
                      800,
                    color:
                      "#102f56",
                  }}
                >
                  {productRating.averageRating.toFixed(
                    1
                  )}
                </div>

                <div
                  style={{
                    color:
                      "#C9A227",
                    fontSize:
                      "24px",
                    letterSpacing:
                      "2px",
                    margin:
                      "8px 0",
                  }}
                >
                  ★★★★★
                </div>

                <div
                  style={{
                    color:
                      "#777",
                    fontSize:
                      "14px",
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

              <div>
                {ratingRows.map(
                  ({
                    star,
                    count,
                  }) => {
                    const percentage =
                      getPercentage(
                        count
                      );

                    return (
                      <div
                        key={
                          star
                        }
                        style={{
                          display:
                            "grid",
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
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            star
                          }{" "}
                          ★
                        </span>

                        <div
                          style={{
                            height:
                              "9px",
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
                              height:
                                "100%",
                              background:
                                "#C9A227",
                              borderRadius:
                                "20px",
                            }}
                          />
                        </div>

                        <span
                          style={{
                            color:
                              "#777",
                            fontSize:
                              "13px",
                            textAlign:
                              "right",
                          }}
                        >
                          {
                            percentage
                          }
                          %
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* REVIEW LIST */}

            {reviewsLoading ? (
              <div
                style={{
                  padding:
                    "30px",
                  textAlign:
                    "center",
                  color:
                    "#777",
                }}
              >
                Loading reviews...
              </div>
            ) : reviews.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "35px",
                  textAlign:
                    "center",
                  border:
                    "1px solid #eee",
                  borderRadius:
                    "12px",
                  background:
                    "#fff",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "38px",
                    marginBottom:
                      "10px",
                  }}
                >
                  ☆
                </div>

                <h3
                  style={{
                    color:
                      "#102f56",
                    marginBottom:
                      "7px",
                  }}
                >
                  No reviews yet
                </h3>

                <p
                  style={{
                    color:
                      "#777",
                    margin: 0,
                  }}
                >
                  Reviews from
                  customers will
                  appear here after
                  they submit them
                  from My Orders.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: "18px",
                }}
              >
                {reviews.map(
                  (review) => {
                    const rating =
                      Math.min(
                        5,
                        Math.max(
                          0,
                          Number(
                            review.rating
                          )
                        )
                      );

                    return (
                      <article
                        key={
                          review.id
                        }
                        style={{
                          border:
                            "1px solid #e7e7e7",
                          borderRadius:
                            "12px",
                          padding:
                            "22px",
                          background:
                            "#fff",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap:
                              "15px",
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
                                gap:
                                  "2px",
                                color:
                                  "#C9A227",
                                fontSize:
                                  "18px",
                              }}
                            >
                              {[
                                1,
                                2,
                                3,
                                4,
                                5,
                              ].map(
                                (
                                  star
                                ) => (
                                  <span
                                    key={
                                      star
                                    }
                                    style={{
                                      color:
                                        star <=
                                        rating
                                          ? "#C9A227"
                                          : "#ddd",
                                    }}
                                  >
                                    ★
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          {review.createdAt && (
                            <span
                              style={{
                                color:
                                  "#888",
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

                        <p
                          style={{
                            color:
                              "#555",
                            lineHeight:
                              1.7,
                            margin: 0,
                            fontSize:
                              "15px",
                            whiteSpace:
                              "pre-line",
                          }}
                        >
                          {
                            review.comment
                          }
                        </p>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =================================================
          SIZE CHART
      ================================================= */}

      {showSizeChart &&
        product.sizechart && (
          <div
            onClick={() =>
              setShowSizeChart(
                false
              )
            }
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.55)",
              zIndex: 1000,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "20px",
            }}
          >
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                background:
                  "#fff",
                borderRadius:
                  "14px",
                padding:
                  "20px",
                maxWidth:
                  "900px",
                maxHeight:
                  "90vh",
                overflow:
                  "auto",
                position:
                  "relative",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowSizeChart(
                    false
                  )
                }
                style={{
                  position:
                    "absolute",
                  top: "10px",
                  right:
                    "12px",
                  width:
                    "35px",
                  height:
                    "35px",
                  borderRadius:
                    "50%",
                  border:
                    "none",
                  background:
                    "#102f56",
                  color:
                    "#fff",
                  fontSize:
                    "20px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

              <h2
                style={{
                  color:
                    "#102f56",
                  marginBottom:
                    "18px",
                  paddingRight:
                    "45px",
                }}
              >
                Size Chart
              </h2>

              <img
                src={
                  product.sizechart
                }
                alt={`${product.name} size chart`}
                style={{
                  maxWidth:
                    "100%",
                  height:
                    "auto",
                  display:
                    "block",
                }}
              />
            </div>
          </div>
        )}

      {/* =================================================
          RESPONSIVE
      ================================================= */}

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