"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header/Header";

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
`;

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

type Media = {
  type: string;
  url: string;
  publicId?: string | null;
};

type ProductItem = {
  id: string;
  price?: number | null;
  stock?: number | null;
  size?: string | null;
  colour?: string | null;
  images?: Media[];
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
  mainMedia?: Media[];
  images?: Media[];
  rating?: number | null;
  reviewsCount?: number | null;
  items?: ProductItem[];
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToBag, setAddingToBag] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const {
    data,
    loading,
    error,
  } = useQuery<any>(PRODUCT_QUERY, {
    variables: {
      id: productId,
    },
    skip: !productId,
    fetchPolicy: "network-only",
  });

  const [createBasket] = useMutation<any>(CREATE_BASKET);
  const [addWishlist] = useMutation<any>(ADD_WISHLIST);

  const product: Product | null =
    data?.product || null;

  /*
   * ------------------------------------------------------
   * GLOBAL IMAGES
   * These are shown when no variant is selected.
   * ------------------------------------------------------
   */
  const globalImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const media = [
      ...(product.mainMedia || []),
      ...(product.images || []),
    ];

    return media
      .filter(
        (item) =>
          item?.type === "image" &&
          item?.url
      )
      .map((item) => item.url)
      .filter(
        (url, index, array) =>
          array.indexOf(url) === index
      );
  }, [product]);

  /*
   * ------------------------------------------------------
   * AVAILABLE COLOURS
   * ------------------------------------------------------
   */
  const colours = useMemo(() => {
    if (!product?.items) {
      return [];
    }

    return product.items
      .map((item) => item.colour?.trim())
      .filter(
        (colour): colour is string =>
          Boolean(colour)
      )
      .filter(
        (colour, index, array) =>
          array.findIndex(
            (value) =>
              value.toLowerCase() ===
              colour.toLowerCase()
          ) === index
      );
  }, [product]);

  /*
   * ------------------------------------------------------
   * AVAILABLE SIZES
   * ------------------------------------------------------
   */
  const sizes = useMemo(() => {
    if (!product?.items) {
      return [];
    }

    return product.items
      .filter((item) => {
        if (!selectedColour) {
          return true;
        }

        return (
          item.colour?.toLowerCase() ===
          selectedColour.toLowerCase()
        );
      })
      .map((item) => item.size?.trim())
      .filter(
        (size): size is string =>
          Boolean(size)
      )
      .filter(
        (size, index, array) =>
          array.indexOf(size) === index
      );
  }, [product, selectedColour]);

  /*
   * ------------------------------------------------------
   * SELECTED VARIANT
   * ------------------------------------------------------
   */
  const selectedVariant = useMemo(() => {
    if (!product?.items?.length) {
      return null;
    }

    /*
     * If both colour and size are selected,
     * find the exact variant.
     */
    if (selectedColour && selectedSize) {
      return (
        product.items.find(
          (item) =>
            (item.colour || "")
              .toLowerCase() ===
              selectedColour.toLowerCase() &&
            (item.size || "")
              .toLowerCase() ===
              selectedSize.toLowerCase()
        ) || null
      );
    }

    /*
     * If only colour is selected and there is
     * exactly one matching variant, use it.
     */
    if (selectedColour && !selectedSize) {
      const matching =
        product.items.filter(
          (item) =>
            (item.colour || "")
              .toLowerCase() ===
            selectedColour.toLowerCase()
        );

      if (matching.length === 1) {
        return matching[0];
      }
    }

    /*
     * If there is only one product variant,
     * automatically use it.
     */
    if (product.items.length === 1) {
      return product.items[0];
    }

    return null;
  }, [
    product,
    selectedColour,
    selectedSize,
  ]);

  /*
   * ------------------------------------------------------
   * CURRENT PRICE / STOCK
   * ------------------------------------------------------
   */
  const currentPrice =
    selectedVariant?.price ??
    product?.items?.[0]?.price ??
    0;

  const currentStock =
    selectedVariant?.stock ??
    product?.items?.[0]?.stock ??
    0;

  /*
   * ------------------------------------------------------
   * VARIANT IMAGES
   *
   * Once a variant is selected, only its images
   * are displayed.
   * ------------------------------------------------------
   */
  const variantImages = useMemo(() => {
    if (!selectedVariant) {
      return [];
    }

    return (selectedVariant.images || [])
      .filter(
        (item) =>
          item?.type === "image" &&
          item?.url
      )
      .map((item) => item.url)
      .filter(
        (url, index, array) =>
          array.indexOf(url) === index
      );
  }, [selectedVariant]);

  /*
   * ------------------------------------------------------
   * DISPLAY IMAGES
   * ------------------------------------------------------
   */
  const displayImages =
    selectedVariant
      ? variantImages
      : globalImages;

  /*
   * ------------------------------------------------------
   * RESET IMAGE WHEN VARIANT CHANGES
   * ------------------------------------------------------
   */
  useEffect(() => {
    setSelectedImage("");
    setQuantity(1);
  }, [selectedVariant?.id]);

  /*
   * ------------------------------------------------------
   * CURRENT DISPLAY IMAGE
   * ------------------------------------------------------
   */
  const displayImage =
    selectedImage ||
    displayImages[0] ||
    "";

  /*
   * ------------------------------------------------------
   * COLOUR CIRCLE
   * ------------------------------------------------------
   */
  const getColourValue = (
    colour: string
  ) => {
    const value = colour
      .trim()
      .toLowerCase();

    const map: Record<string, string> = {
      black: "#000000",
      white: "#ffffff",
      red: "#e53935",
      maroon: "#800000",
      pink: "#f48fb1",
      yellow: "#fdd835",
      orange: "#fb8c00",
      blue: "#1e88e5",
      navy: "#102f56",
      green: "#43a047",
      purple: "#8e24aa",
      brown: "#795548",
      beige: "#d7c4a3",
      cream: "#fff1c1",
      grey: "#9e9e9e",
      gray: "#9e9e9e",
      silver: "#c0c0c0",
      gold: "#d4af37",
    };

    return map[value] || "#d9d9d9";
  };

  /*
   * ------------------------------------------------------
   * AUTH USER
   * ------------------------------------------------------
   */
  const getAuthUser = () => {
    try {
      const value =
        localStorage.getItem(
          "authUser"
        );

      if (!value) {
        return null;
      }

      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  /*
   * ------------------------------------------------------
   * ADD TO BASKET
   * ------------------------------------------------------
   */
  const handleAddToBag = async () => {
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

    if (
      product.status !== "published" &&
      product.status !== "active"
    ) {
      alert(
        "This product is currently unavailable."
      );

      return;
    }

    if (!selectedVariant) {
      if (
        colours.length > 0 &&
        !selectedColour
      ) {
        alert(
          "Please select a colour."
        );

        return;
      }

      if (
        sizes.length > 0 &&
        !selectedSize
      ) {
        alert(
          "Please select a size."
        );

        return;
      }
    }

    if (currentStock <= 0) {
      alert(
        "This product is out of stock."
      );

      return;
    }

    if (
      quantity > currentStock
    ) {
      alert(
        `Only ${currentStock} item${
          currentStock === 1
            ? ""
            : "s"
        } available.`
      );

      return;
    }

    try {
      setAddingToBag(true);

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
            selectedVariant?.size ||
            selectedSize ||
            null,
          colour:
            selectedVariant?.colour ||
            selectedColour ||
            null,
        },
      });

      router.push("/basket");
    } catch (err: any) {
      console.error(
        "ADD TO BASKET ERROR:",
        err
      );

      alert(
        err?.message ||
          "Unable to add product to basket."
      );
    } finally {
      setAddingToBag(false);
    }
  };

  /*
   * ------------------------------------------------------
   * WISHLIST
   * ------------------------------------------------------
   */
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
      } catch (err: any) {
        console.error(
          "WISHLIST ERROR:",
          err
        );

        alert(
          err?.message ||
            "Unable to add product to wishlist."
        );
      } finally {
        setAddingToWishlist(
          false
        );
      }
    };

  /*
   * ------------------------------------------------------
   * LOADING
   * ------------------------------------------------------
   */
  if (loading) {
    return (
      <>
        <Header />

        <main
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          Loading product...
        </main>
      </>
    );
  }

  /*
   * ------------------------------------------------------
   * ERROR
   * ------------------------------------------------------
   */
  if (error || !product) {
    console.error(
      "PRODUCT QUERY ERROR:",
      error
    );

    return (
      <>
        <Header />

        <main
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#102f56",
              marginBottom: 12,
            }}
          >
            Unable to load product
          </h2>

          <p
            style={{
              color: "#777",
              marginBottom: 25,
            }}
          >
            Something went wrong
            while loading this
            product.
          </p>

          <Link
            href="/shop"
            style={{
              display: "inline-block",
              padding: "12px 25px",
              background: "#102f56",
              color: "#fff",
              borderRadius: 8,
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

  return (
    <>
      <Header />

      <main
        style={{
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        {/* BREADCRUMB */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "22px 20px 10px",
            color: "#777",
            fontSize: 14,
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

          <span
            style={{
              margin: "0 8px",
            }}
          >
            /
          </span>

          <span>
            {product.name}
          </span>
        </div>

        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "25px 20px 70px",
          }}
        >
          <div
            className="product-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 55,
            }}
          >
            {/* IMAGE SECTION */}
            <div>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#F8F9FB",
                  borderRadius: 16,
                  border:
                    "1px solid #eee",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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

              {displayImages.length >
                1 && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 16,
                    overflowX: "auto",
                  }}
                >
                  {displayImages.map(
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
                          width: 75,
                          height: 75,
                          minWidth: 75,
                          padding: 3,
                          borderRadius: 10,
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

            {/* PRODUCT INFORMATION */}
            <div>
              {product.categories &&
                product.categories.length >
                  0 && (
                  <p
                    style={{
                      color: "#C9A227",
                      fontWeight: 700,
                      fontSize: 14,
                      textTransform:
                        "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {
                      product.categories[0]
                    }
                  </p>
                )}

              <h1
                style={{
                  color: "#102f56",
                  fontSize: 34,
                  lineHeight: 1.2,
                  margin:
                    "0 0 12px",
                  fontWeight: 800,
                }}
              >
                {product.name}
              </h1>

              {product.subTitle && (
                <p
                  style={{
                    color: "#666",
                    fontSize: 16,
                    marginBottom: 15,
                  }}
                >
                  {product.subTitle}
                </p>
              )}

              {product.brand?.name && (
                <p
                  style={{
                    color: "#666",
                    fontSize: 15,
                    marginBottom: 15,
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
                      product.brand
                        .name
                    }
                  </strong>
                </p>
              )}

              {/* RATING */}
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    background:
                      "#FFF8DF",
                    color:
                      "#102f56",
                    borderRadius: 7,
                    padding:
                      "7px 10px",
                    fontWeight: 800,
                  }}
                >
                  ★{" "}
                  {Number(
                    product.rating ||
                      0
                  ).toFixed(1)}
                </span>

                <span
                  style={{
                    color: "#777",
                    fontSize: 14,
                  }}
                >
                  {product.reviewsCount ||
                    0}{" "}
                  {product.reviewsCount ===
                  1
                    ? "review"
                    : "reviews"}
                </span>
              </div>

              {/* PRICE */}
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#102f56",
                  marginBottom: 20,
                }}
              >
                ₹
                {Number(
                  currentPrice
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              {/* DESCRIPTION */}
              {product.description && (
                <div
                  style={{
                    marginBottom: 25,
                  }}
                >
                  <h3
                    style={{
                      color:
                        "#102f56",
                      fontSize: 17,
                      marginBottom: 8,
                    }}
                  >
                    Description
                  </h3>

                  <p
                    style={{
                      color: "#666",
                      lineHeight: 1.7,
                      fontSize: 15,
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

              {/* COLOUR */}
              {colours.length > 0 && (
                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{
                      color:
                        "#102f56",
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  >
                    Colour
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexWrap:
                        "wrap",
                      gap: 16,
                    }}
                  >
                    {colours.map(
                      (colour) => {
                        const selected =
                          selectedColour.toLowerCase() ===
                          colour.toLowerCase();

                        return (
                          <button
                            key={colour}
                            type="button"
                            onClick={() => {
                              setSelectedColour(
                                colour
                              );

                              setSelectedSize(
                                ""
                              );

                              setSelectedImage(
                                ""
                              );
                            }}
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              alignItems:
                                "center",
                              gap: 7,
                              border:
                                "none",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                            }}
                          >
                            <span
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius:
                                  "50%",
                                backgroundColor:
                                  getColourValue(
                                    colour
                                  ),
                                border:
                                  selected
                                    ? "3px solid #C9A227"
                                    : "1px solid #ccc",
                                boxShadow:
                                  selected
                                    ? "0 0 0 2px #fff, 0 0 0 4px #C9A227"
                                    : "none",
                              }}
                            />

                            <span
                              style={{
                                color:
                                  "#102f56",
                                fontSize:
                                  12,
                                fontWeight:
                                  selected
                                    ? 700
                                    : 500,
                              }}
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

              {/* SIZE */}
              {sizes.length > 0 && (
                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{
                      color:
                        "#102f56",
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  >
                    Size
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexWrap:
                        "wrap",
                      gap: 10,
                    }}
                  >
                    {sizes.map(
                      (size) => {
                        const selected =
                          selectedSize ===
                          size;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setSelectedSize(
                                size
                              );
                              setSelectedImage(
                                ""
                              );
                            }}
                            style={{
                              minWidth: 55,
                              padding:
                                "10px 15px",
                              borderRadius:
                                8,
                              border:
                                selected
                                  ? "2px solid #C9A227"
                                  : "1px solid #ddd",
                              background:
                                selected
                                  ? "#FFF8DF"
                                  : "#fff",
                              color:
                                "#102f56",
                              fontWeight:
                                selected
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

              {/* VARIANT INFORMATION */}
              {selectedVariant && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: 14,
                    background:
                      "#F8F9FB",
                    borderRadius: 10,
                    border:
                      "1px solid #eee",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color:
                        "#102f56",
                      fontWeight: 700,
                    }}
                  >
                    Selected Variant
                  </p>

                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      color: "#666",
                    }}
                  >
                    {selectedVariant.colour ||
                      "No colour"}
                    {selectedVariant.size
                      ? ` • ${selectedVariant.size}`
                      : ""}
                  </p>
                </div>
              )}

              {/* STOCK */}
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                {currentStock > 0 ? (
                  <p
                    style={{
                      color:
                        "#238636",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    ✓ In Stock{" "}
                    <span
                      style={{
                        color:
                          "#777",
                        fontWeight: 400,
                      }}
                    >
                      ({currentStock}{" "}
                      available)
                    </span>
                  </p>
                ) : (
                  <p
                    style={{
                      color:
                        "#d32f2f",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Out of Stock
                  </p>
                )}
              </div>

              {/* QUANTITY */}
              {currentStock > 0 && (
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 14,
                    marginBottom: 22,
                  }}
                >
                  <strong
                    style={{
                      color:
                        "#102f56",
                    }}
                  >
                    Quantity
                  </strong>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      border:
                        "1px solid #ddd",
                      borderRadius: 8,
                      overflow:
                        "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                      style={{
                        width: 38,
                        height: 38,
                        border:
                          "none",
                        background:
                          "#f8f8f8",
                        cursor:
                          "pointer",
                        fontSize: 18,
                      }}
                    >
                      −
                    </button>

                    <span
                      style={{
                        width: 45,
                        textAlign:
                          "center",
                        fontWeight: 700,
                        color:
                          "#102f56",
                      }}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.min(
                              currentStock,
                              value + 1
                            )
                        )
                      }
                      style={{
                        width: 38,
                        height: 38,
                        border:
                          "none",
                        background:
                          "#f8f8f8",
                        cursor:
                          "pointer",
                        fontSize: 18,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap:
                    "wrap",
                  marginBottom: 25,
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleAddToBag
                  }
                  disabled={
                    addingToBag ||
                    currentStock <= 0 ||
                    (product.status !==
                      "published" &&
                      product.status !==
                        "active")
                  }
                  style={{
                    flex:
                      "1 1 220px",
                    minHeight: 50,
                    border: "none",
                    borderRadius: 9,
                    background:
                      addingToBag ||
                      currentStock <=
                        0
                        ? "#ccc"
                        : "#102f56",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor:
                      addingToBag ||
                      currentStock <=
                        0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingToBag
                    ? "Adding..."
                    : currentStock <= 0
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
                    minHeight: 50,
                    padding:
                      "0 22px",
                    borderRadius: 9,
                    border:
                      "1.5px solid #C9A227",
                    background:
                      "#FFFDF5",
                    color:
                      "#102f56",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  {addingToWishlist
                    ? "Adding..."
                    : "♡ Wishlist"}
                </button>
              </div>
            </div>
          </div>

          {/* SIMPLE RATING SECTION */}
          <div
            style={{
              marginTop: 50,
              borderTop:
                "1px solid #eee",
              paddingTop: 35,
            }}
          >
            <h2
              style={{
                color:
                  "#102f56",
                marginBottom: 12,
              }}
            >
              Customer Reviews
            </h2>

            <div
              style={{
                color:
                  "#C9A227",
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              ★★★★★
            </div>

            <p
              style={{
                color: "#777",
              }}
            >
              {Number(
                product.rating || 0
              ).toFixed(1)}{" "}
              rating from{" "}
              {product.reviewsCount ||
                0}{" "}
              reviews.
            </p>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </>
  );
}