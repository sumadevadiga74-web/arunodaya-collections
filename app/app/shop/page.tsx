"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header/Header";

/* =========================================================
   TYPES
========================================================= */

type Brand = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status?: string;
};

type Colour = {
  id: string;
  name: string;
  code?: string;
  status?: string;
};

type ColourImage = {
  colour: string;
  image: string;
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
  status?: string;
};

/* =========================================================
   PRODUCTS QUERY
========================================================= */

const PRODUCTS_QUERY = gql`
  query Products($page: Int!, $limit: Int!) {
    products(page: $page, limit: $limit) {
      products {
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

        status
      }

      page
      limit
      hasMore
    }
  }
`;

/* =========================================================
   BRANDS QUERY
========================================================= */

const BRANDS_QUERY = gql`
  query Brands {
    brands {
      id
      name
      description
      image
      status
    }
  }
`;

/* =========================================================
   COLOURS QUERY
========================================================= */

const COLOURS_QUERY = gql`
  query Colours {
    colours {
      id
      name
      code
      status
    }
  }
`;

/* =========================================================
   REVIEWS QUERY
========================================================= */

const REVIEWS_QUERY = gql`
  query AllReviews {
    allReviews {
      id
      productId
      rating
    }
  }
`;

/* =========================================================
   WISHLIST QUERY
========================================================= */

const WISHLISTS_QUERY = gql`
  query Wishlists {
    wishlists {
      id
      productId
      status
    }
  }
`;

/* =========================================================
   CREATE WISHLIST
========================================================= */

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
   DELETE WISHLIST
========================================================= */

const DELETE_WISHLIST = gql`
  mutation DeleteWishlist($id: ID!) {
    deleteWishlist(id: $id) {
      id
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
      userId
      productId
      quantity
      size
      colour
      status
    }
  }
`;

/* =========================================================
   SORT OPTIONS
========================================================= */

type SortOption =
  | "featured"
  | "price-low-high"
  | "price-high-low"
  | "name-a-z"
  | "name-z-a";

/* =========================================================
   PAGE
========================================================= */

export default function ShopPage() {
  const router = useRouter();

  /* =======================================================
     SEARCH STATE
  ======================================================= */

  const [searchText, setSearchText] = useState("");

  /* =======================================================
     READ SEARCH FROM URL
  ======================================================= */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const search = params.get("search") || "";

    setSearchText(search);
  }, []);

  /* =======================================================
     DATA
  ======================================================= */

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery(PRODUCTS_QUERY, {
    variables: {
      page: 1,
      limit: 1000,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    refetchProducts();
  }, [refetchProducts]);

  const {
    data: brandsData,
    loading: brandsLoading,
  } = useQuery(BRANDS_QUERY);

  const {
    data: coloursData,
    loading: coloursLoading,
  } = useQuery(COLOURS_QUERY);

  const {
    data: reviewsData,
  } = useQuery(REVIEWS_QUERY);

  /* =======================================================
     AUTH STATE FOR WISHLIST
  ======================================================= */

  const [authChecked, setAuthChecked] =
    useState(false);

  const [authUserId, setAuthUserId] =
    useState<string | null>(null);

  useEffect(() => {
    try {
      const authUserString =
        localStorage.getItem("authUser");

      if (!authUserString) {
        setAuthUserId(null);
        setAuthChecked(true);
        return;
      }

      const authUser =
        JSON.parse(authUserString);

      const userId =
        authUser?.id ||
        authUser?._id;

      setAuthUserId(
        userId ? String(userId) : null
      );
    } catch (error) {
      console.error(
        "AUTH USER READ ERROR:",
        error
      );

      setAuthUserId(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  /* =======================================================
     WISHLIST DATA
  ======================================================= */

  const {
    data: wishlistData,
    loading: wishlistLoading,
    refetch: refetchWishlist,
  } = useQuery(WISHLISTS_QUERY, {
    skip:
      !authChecked ||
      !authUserId,
    fetchPolicy: "network-only",
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createWishlist] =
    useMutation(CREATE_WISHLIST);

  const [deleteWishlist] =
    useMutation(DELETE_WISHLIST);

  const [createBasket] =
    useMutation(CREATE_BASKET);

  /* =======================================================
     FILTER STATES
  ======================================================= */

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [selectedSize, setSelectedSize] =
    useState("all");

  const [selectedColour, setSelectedColour] =
    useState("all");

  const [selectedPrice, setSelectedPrice] =
    useState("all");

  const [selectedBrand, setSelectedBrand] =
    useState("all");



  const [sortOption, setSortOption] =
    useState<SortOption>("featured");

  /* =======================================================
     BASKET STATES
  ======================================================= */

  const [basketProducts, setBasketProducts] =
    useState<string[]>([]);

  const [addingProductId, setAddingProductId] =
    useState<string | null>(null);

  /* =======================================================
     WISHLIST STATES
  ======================================================= */

  const [wishlistProducts, setWishlistProducts] =
    useState<string[]>([]);

  const [removingWishlistId, setRemovingWishlistId] =
    useState<string | null>(null);

  /* =======================================================
     LOAD EXISTING WISHLIST
  ======================================================= */

  useEffect(() => {
    if (!wishlistData?.wishlists) {
      setWishlistProducts([]);
      return;
    }

    const productIds =
      wishlistData.wishlists
        .filter(
          (item: {
            productId: string;
            status?: string | null;
          }) =>
            !item.status ||
            item.status.toLowerCase() ===
              "active"
        )
        .map(
          (item: {
            productId: string;
          }) =>
            String(item.productId)
        );

    setWishlistProducts(productIds);
  }, [wishlistData]);

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const products: Product[] =
    productsData?.products?.products || [];

  /* =======================================================
     BRANDS
  ======================================================= */

  const brands: Brand[] =
    (brandsData?.brands || []).filter(
      (brand: Brand) =>
        !brand.status ||
        brand.status.toLowerCase() ===
          "active"
    );

  /* =======================================================
     COLOURS
  ======================================================= */

  const colours: Colour[] =
    (coloursData?.colours || []).filter(
      (colour: Colour) =>
        !colour.status ||
        colour.status.toLowerCase() ===
          "active"
    );

  /* =======================================================
     PRODUCT RATINGS
  ======================================================= */

  const productRatings = useMemo(() => {
    const ratings: Record<
      string,
      {
        average: number;
        total: number;
      }
    > = {};

    const reviews =
      reviewsData?.allReviews || [];

    reviews.forEach(
      (review: {
        productId: string;
        rating: number;
      }) => {
        if (!ratings[review.productId]) {
          ratings[review.productId] = {
            average: 0,
            total: 0,
          };
        }

        ratings[review.productId].average +=
          review.rating;

        ratings[review.productId].total += 1;
      }
    );

    Object.keys(ratings).forEach(
      (productId) => {
        ratings[productId].average =
          Number(
            (
              ratings[productId].average /
              ratings[productId].total
            ).toFixed(1)
          );
      }
    );

    return ratings;
  }, [reviewsData]);

  /* =======================================================
     PRODUCT IMAGE
  ======================================================= */

  const getProductImage = (
    product: Product
  ) => {
    const image =
      product.image ||
      product.colourImages?.find(
        (item) => item.image
      )?.image ||
      "";

    if (!image) {
      return "";
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

  /* =======================================================
     FILTER VALUES
  ======================================================= */

  const categories = [
    "Women",
    "Men",
    "Kids",
  ];

  const sizes = Array.from(
    new Set(
      products.flatMap(
        (product) => product.sizes || []
      )
    )
  );

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    return products.filter((product) => {
/* =====================================================
   SEARCH
===================================================== */

if (normalizedSearch) {
  const productName =
    product.name?.trim().toLowerCase() || "";

  const productCategory =
    product.category?.trim().toLowerCase() || "";

  const productBrand =
    product.brand?.name?.trim().toLowerCase() || "";

  const productDescription =
    product.description?.trim().toLowerCase() || "";

  /* ---------------------------------------------
     CATEGORY SEARCH
     Match Men/Women/Kids exactly
  --------------------------------------------- */

  const categoryNames = [
    "men",
    "women",
    "kids",
  ];

  if (
    categoryNames.includes(normalizedSearch)
  ) {
    if (
      productCategory !== normalizedSearch
    ) {
      return false;
    }
  } else {
    /* -------------------------------------------
       NORMAL PRODUCT SEARCH
    ------------------------------------------- */

    const searchMatch =
      productName.includes(normalizedSearch) ||
      productBrand.includes(normalizedSearch) ||
      productDescription.includes(
        normalizedSearch
      );

    if (!searchMatch) {
      return false;
    }
  }
}


      /* =====================================================
         CATEGORY
      ===================================================== */

      if (selectedCategory !== "all") {
        if (
          product.category?.toLowerCase() !==
          selectedCategory.toLowerCase()
        ) {
          return false;
        }
      }

      /* =====================================================
         SIZE
      ===================================================== */

      if (
        selectedSize !== "all" &&
        !(product.sizes || []).some(
          (size) =>
            size.toLowerCase() ===
            selectedSize.toLowerCase()
        )
      ) {
        return false;
      }

      /* =====================================================
         COLOUR
      ===================================================== */

      if (selectedColour !== "all") {
        const productColours = [
          ...(product.colours || []),
          ...(product.colourImages || []).map(
            (item) => item.colour
          ),
        ];

        const colourMatch =
          productColours.some(
            (colour) =>
              colour.toLowerCase() ===
              selectedColour.toLowerCase()
          );

        if (!colourMatch) {
          return false;
        }
      }

      /* =====================================================
         BRAND
      ===================================================== */

      if (selectedBrand !== "all") {
        if (
          product.brand?.id !==
          selectedBrand
        ) {
          return false;
        }
      }

      /* =====================================================
         PRICE
      ===================================================== */

      if (selectedPrice !== "all") {
        const price = Number(
          product.price
        );

        if (
          selectedPrice ===
            "under-500" &&
          price >= 500
        ) {
          return false;
        }

        if (
          selectedPrice ===
            "500-1000" &&
          (price < 500 ||
            price > 1000)
        ) {
          return false;
        }

        if (
          selectedPrice ===
            "1000-2000" &&
          (price < 1000 ||
            price > 2000)
        ) {
          return false;
        }

        if (
          selectedPrice ===
            "2000-3000" &&
          (price < 2000 ||
            price > 3000)
        ) {
          return false;
        }

        if (
          selectedPrice ===
            "3000-4000" &&
          (price < 3000 ||
            price > 4000)
        ) {
          return false;
        }

        if (
          selectedPrice ===
            "above-4000" &&
          price <= 4000
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    products,
    searchText,
    selectedCategory,
    selectedSize,
    selectedColour,
    selectedPrice,
    selectedBrand,
  ]);

  /* =======================================================
     SORTED PRODUCTS
  ======================================================= */

  const sortedProducts = useMemo(() => {
    const sorted = [
      ...filteredProducts,
    ];

    if (
      sortOption ===
      "price-low-high"
    ) {
      sorted.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }

    if (
      sortOption ===
      "price-high-low"
    ) {
      sorted.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );
    }

    if (
      sortOption ===
      "name-a-z"
    ) {
      sorted.sort((a, b) =>
        a.name.localeCompare(
          b.name
        )
      );
    }

    if (
      sortOption ===
      "name-z-a"
    ) {
      sorted.sort((a, b) =>
        b.name.localeCompare(
          a.name
        )
      );
    }

    return sorted;
  }, [
    filteredProducts,
    sortOption,
  ]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchText("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setSelectedColour("all");
    setSelectedPrice("all");
    setSelectedBrand("all");
    setSortOption("featured");

    window.history.replaceState(
      {},
      "",
      "/shop"
    );
  };

  /* =======================================================
     TOGGLE WISHLIST
  ======================================================= */

  const handleWishlist = async (
    event: React.MouseEvent,
    product: Product
  ) => {
    event.stopPropagation();

    try {
      const authUserString =
        localStorage.getItem(
          "authUser"
        );

      if (!authUserString) {
        alert(
          "Please login to manage your wishlist."
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      let authUser;

      try {
        authUser =
          JSON.parse(
            authUserString
          );
      } catch {
        alert(
          "Please login again."
        );

        localStorage.removeItem(
          "authUser"
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      const userId =
        authUser?.id ||
        authUser?._id;

      if (!userId) {
        alert(
          "Please login again."
        );

        localStorage.removeItem(
          "authUser"
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      const existingWishlist =
        wishlistData?.wishlists?.find(
          (item: {
            id: string;
            productId: string;
            status?: string | null;
          }) =>
            String(
              item.productId
            ) ===
              String(product.id) &&
            (!item.status ||
              item.status.toLowerCase() ===
                "active")
        );

      if (existingWishlist) {
        setRemovingWishlistId(
          product.id
        );

        await deleteWishlist({
          variables: {
            id: existingWishlist.id,
          },
        });

        setWishlistProducts(
          (current) =>
            current.filter(
              (id) =>
                id !== product.id
            )
        );

        await refetchWishlist();

        setRemovingWishlistId(
          null
        );

        return;
      }

      await createWishlist({
        variables: {
          userId: String(userId),
          productId: String(
            product.id
          ),
        },
      });

      setWishlistProducts(
        (current) =>
          current.includes(product.id)
            ? current
            : [
                ...current,
                product.id,
              ]
      );

      await refetchWishlist();

    } catch (err) {
      console.error(
        "WISHLIST ERROR:",
        err
      );

      setRemovingWishlistId(
        null
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update wishlist."
      );
    }
  };

  /* =======================================================
     ADD TO BAG
  ======================================================= */

  const handleAddToBag = async (
    event: React.MouseEvent,
    product: Product
  ) => {
    event.stopPropagation();

    try {
      const authUserString =
        localStorage.getItem(
          "authUser"
        );

      if (!authUserString) {
        alert(
          "Please login to add products to bag."
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      let authUser;

      try {
        authUser =
          JSON.parse(
            authUserString
          );
      } catch {
        alert(
          "Please login again."
        );

        localStorage.removeItem(
          "authUser"
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      const userId =
        authUser?.id ||
        authUser?._id;

      if (!userId) {
        alert(
          "Please login again."
        );

        localStorage.removeItem(
          "authUser"
        );

        router.push(
          "/customer-login"
        );

        return;
      }

      if (
        product.status &&
        product.status.toLowerCase() !==
          "active"
      ) {
        alert(
          "This product is currently unavailable."
        );

        return;
      }

      if (
        product.stock !== null &&
        product.stock !==
          undefined &&
        product.stock <= 0
      ) {
        alert(
          "This product is out of stock."
        );

        return;
      }

      if (
        basketProducts.includes(
          product.id
        )
      ) {
        alert(
          "Product is already in your bag."
        );

        return;
      }

      setAddingProductId(
        product.id
      );

      await createBasket({
        variables: {
          userId: String(userId),
          productId: String(
            product.id
          ),
          quantity: 1,
          size: "",
          colour: "",
          status: "active",
        },
      });

      setBasketProducts(
        (current) => [
          ...current,
          product.id,
        ]
      );

      alert(
        "Product added to bag."
      );
    } catch (err) {
      console.error(
        "CREATE BASKET ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to add product to bag."
      );
    } finally {
      setAddingProductId(
        null
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    productsLoading ||
    brandsLoading ||
    coloursLoading ||
    wishlistLoading
  ) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-[#F8F9FB] px-6 py-12">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-gray-600">
              Loading products...
            </p>
          </div>
        </main>
      </>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (productsError) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-[#F8F9FB] px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <h2 className="text-xl font-semibold text-red-600">
                Unable to load products
              </h2>

              <p className="mt-2 text-gray-600">
                {productsError.message}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* =======================================================
     PAGE UI
  ======================================================= */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F9FB] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* PAGE HEADER */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0B1F3A]">
              Shop
            </h1>

            <p className="mt-2 text-gray-600">
              Discover our latest collection
            </p>

            {/* SEARCH RESULT */}
            {searchText && (
              <p className="mt-2 text-sm text-gray-500">
                Search results for{" "}
                <span className="font-semibold text-[#0B1F3A]">
                  "{searchText}"
                </span>
              </p>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">

            {/* FILTER SIDEBAR */}

            <aside className="h-fit rounded-xl bg-white p-5 shadow-sm md:sticky md:top-24">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#0B1F3A]">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-sm font-medium text-[#9B7A12] hover:underline"
                >
                  Clear
                </button>
              </div>

              {/* CATEGORY */}

              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-800">
                  Category
                </h3>

                <div className="space-y-2">

                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="category"
                      checked={
                        selectedCategory ===
                        "all"
                      }
                      onChange={() =>
                        setSelectedCategory(
                          "all"
                        )
                      }
                    />

                    <span>
                      All
                    </span>
                  </label>

                  {categories.map(
                    (category) => (
                      <label
                        key={category}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={
                            selectedCategory ===
                            category
                          }
                          onChange={() =>
                            setSelectedCategory(
                              category
                            )
                          }
                        />

                        <span>
                          {category}
                        </span>
                      </label>
                    )
                  )}

                </div>
              </div>

              {/* SIZE */}

              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-800">
                  Size
                </h3>

                <select
                  value={
                    selectedSize
                  }
                  onChange={(event) =>
                    setSelectedSize(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                >
                  <option value="all">
                    All Sizes
                  </option>

                  {sizes.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* COLOUR */}

              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-800">
                  Colour
                </h3>

                <select
                  value={
                    selectedColour
                  }
                  onChange={(event) =>
                    setSelectedColour(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                >
                  <option value="all">
                    All Colours
                  </option>

                  {colours.map(
                    (colour) => (
                      <option
                        key={
                          colour.id
                        }
                        value={
                          colour.name
                        }
                      >
                        {colour.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* PRICE */}

              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-800">
                  Price
                </h3>

                <select
                  value={
                    selectedPrice
                  }
                  onChange={(event) =>
                    setSelectedPrice(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                >
                  <option value="all">
                    All Prices
                  </option>

                  <option value="under-500">
                    Under ₹500
                  </option>

                  <option value="500-1000">
                    ₹500 – ₹1,000
                  </option>

                  <option value="1000-2000">
                    ₹1,000 – ₹2,000
                  </option>

                  <option value="2000-3000">
                    ₹2,000 – ₹3,000
                  </option>

                  <option value="3000-4000">
                    ₹3,000 – ₹4,000
                  </option>

                  <option value="above-4000">
                    Above ₹4,000
                  </option>
                </select>
              </div>

              {/* BRAND */}

              <div>
                <h3 className="mb-3 font-semibold text-gray-800">
                  Brand
                </h3>

                <select
                  value={
                    selectedBrand
                  }
                  onChange={(event) =>
                    setSelectedBrand(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                >
                  <option value="all">
                    All Brands
                  </option>

                  {brands.map(
                    (brand) => (
                      <option
                        key={
                          brand.id
                        }
                        value={
                          brand.id
                        }
                      >
                        {brand.name}
                      </option>
                    )
                  )}
                </select>
              </div>

            </aside>

            {/* PRODUCTS SECTION */}

            <section>

              {/* SORT + COUNT */}

              <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {
                      sortedProducts.length
                    }
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {
                      products.length
                    }
                  </span>{" "}
                  products
                </p>

                <div className="flex items-center gap-3">

                  <label
                    htmlFor="sort"
                    className="text-sm font-medium text-gray-700"
                  >
                    Sort:
                  </label>

                  <select
                    id="sort"
                    value={
                      sortOption
                    }
                    onChange={(
                      event
                    ) =>
                      setSortOption(
                        event
                          .target
                          .value as SortOption
                      )
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                  >
                    <option value="featured">
                      Featured
                    </option>

                    <option value="price-low-high">
                      Price: Low to High
                    </option>

                    <option value="price-high-low">
                      Price: High to Low
                    </option>

                    <option value="name-a-z">
                      Name: A to Z
                    </option>

                    <option value="name-z-a">
                      Name: Z to A
                    </option>
                  </select>

                </div>
              </div>

              {/* NO PRODUCTS */}

              {sortedProducts.length ===
              0 ? (

                <div className="rounded-xl bg-white p-12 text-center shadow-sm">

                  <h2 className="text-xl font-semibold text-[#0B1F3A]">
                    No products found
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Try changing or
                    clearing your
                    search or filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-5 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Clear Filters
                  </button>

                </div>

              ) : (

                /* PRODUCT GRID */

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {sortedProducts.map(
                    (product) => {

                      const image =
                        getProductImage(
                          product
                        );

                      const rating =
                        productRatings[
                          product.id
                        ];

                      const isAdding =
                        addingProductId ===
                        product.id;

                      const isInWishlist =
                        wishlistProducts.includes(
                          product.id
                        );

                      const isRemoving =
                        removingWishlistId ===
                        product.id;

                      const isInBasket =
                        basketProducts.includes(
                          product.id
                        );

                      return (
                        <article
                          key={
                            product.id
                          }
                          className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >

                          {/* PRODUCT IMAGE */}

                          <div
                            className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-gray-100"
                            onClick={() =>
                              router.push(
                                `/product/${product.id}`
                              )
                            }
                          >

                            {image ? (
                              <img
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}

                            {/* WISHLIST */}

                            <button
                              type="button"
                              onClick={(
                                event
                              ) =>
                                handleWishlist(
                                  event,
                                  product
                                )
                              }
                              disabled={
                                isRemoving
                              }
                              className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow-sm transition hover:scale-110 ${
                                isRemoving
                                  ? "cursor-not-allowed opacity-60"
                                  : ""
                              }`}
                              aria-label={
                                isInWishlist
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                              title={
                                isInWishlist
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {isRemoving ? (
                                <span className="text-sm text-gray-500">
                                  ...
                                </span>
                              ) : (
                                <span
                                  className={
                                    isInWishlist
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }
                                >
                                  {isInWishlist
                                    ? "♥"
                                    : "♡"}
                                </span>
                              )}
                            </button>

                          </div>

                          {/* PRODUCT DETAILS */}

                          <div className="p-4">

                            {/* CATEGORY */}

                            {product.category && (
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                                {
                                  product.category
                                }
                              </p>
                            )}

                            {/* NAME */}

                            <h2
                              className="cursor-pointer text-lg font-semibold text-[#0B1F3A]"
                              onClick={() =>
                                router.push(
                                  `/product/${product.id}`
                                )
                              }
                            >
                              {
                                product.name
                              }
                            </h2>

                            {/* BRAND */}

                            {product.brand?.name && (
                              <p className="mt-1 text-sm text-gray-500">
                                {
                                  product
                                    .brand
                                    .name
                                }
                              </p>
                            )}

                            {/* PRICE */}

                            <p className="mt-2 text-lg font-bold text-[#9B7A12]">
                              ₹
                              {Number(
                                product.price
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            {/* RATING */}

                            <div className="mt-2 flex items-center gap-2">
                              {rating ? (
                                <>
                                  <span className="text-sm font-semibold text-[#9B7A12]">
                                    ⭐{" "}
                                    {rating.average.toFixed(
                                      1
                                    )}
                                  </span>

                                  <span className="text-sm text-gray-500">
                                    (
                                    {
                                      rating.total
                                    }{" "}
                                    {
                                      rating.total ===
                                      1
                                        ? "review"
                                        : "reviews"
                                    }
                                    )
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  No reviews yet
                                </span>
                              )}
                            </div>

                        {/* STOCK */}

{product.stock !== undefined &&
  product.stock !== null &&
  (product.stock === 0 ? (
    <p className="mt-2 text-xs font-semibold text-red-500">
      Out of Stock
    </p>
  ) : product.stock <= 5 ? (
    <p className="mt-2 text-xs font-semibold text-red-500">
      Only {product.stock} left
    </p>
  ) : null)}

                            {/* ACTIONS */}

                            <div className="mt-4 flex gap-2">

                              {/* ADD TO BAG */}

                              <button
                                type="button"
                                disabled={
                                  isAdding ||
                                  isInBasket ||
                                  product.stock ===
                                    0 ||
                                  (product.status &&
                                    product.status.toLowerCase() !==
                                      "active")
                                }
                                onClick={(
                                  event
                                ) =>
                                  handleAddToBag(
                                    event,
                                    product
                                  )
                                }
                                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                  isInBasket
                                    ? "bg-gray-200 text-gray-500"
                                    : "bg-[#0B1F3A] text-white hover:opacity-90"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                {isAdding
                                  ? "Adding..."
                                  : isInBasket
                                  ? "Added to Bag"
                                  : product.stock ===
                                      0
                                  ? "Out of Stock"
                                  : "Add to Bag"}
                              </button>

                              {/* VIEW PRODUCT */}

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/product/${product.id}`
                                  )
                                }
                                className="rounded-lg border border-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-[#0B1F3A] hover:text-white"
                              >
                                View
                              </button>

                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}

                </div>
              )}

            </section>
          </div>
        </div>
      </main>
    </>
  );
}