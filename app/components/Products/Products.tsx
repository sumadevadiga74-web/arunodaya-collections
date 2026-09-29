
"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

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

        productImages {
          view
          image
        }

        sizechart {
          id
          name
          slug
          image
          status
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
   SIZECHART QUERY
========================================================= */

const SIZECHARTS_QUERY = gql`
  query Sizecharts {
    getSizecharts {
      id
      name
      slug
      image
      status
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
   CREATE PRODUCT
========================================================= */

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $price: Float!
    $image: String
    $category: String
    $brand: ID
    $description: String
    $stock: Int
    $sizes: [String!]
    $colours: [String!]
    $colourImages: [ColourImageInput!]
    $productImages: [ProductImageInput!]
    $sizechart: ID
    $status: String
  ) {
    createProduct(
      name: $name
      price: $price
      image: $image
      category: $category
      brand: $brand
      description: $description
      stock: $stock
      sizes: $sizes
      colours: $colours
      colourImages: $colourImages
      productImages: $productImages
      sizechart: $sizechart
      status: $status
    ) {
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
        name
        slug
        image
        status
      }

      status
    }
  }
`;

/* =========================================================
   UPDATE PRODUCT
========================================================= */

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $price: Float
    $image: String
    $category: String
    $brand: ID
    $description: String
    $stock: Int
    $sizes: [String!]
    $colours: [String!]
    $colourImages: [ColourImageInput!]
    $productImages: [ProductImageInput!]
    $sizechart: ID
    $status: String
  ) {
    updateProduct(
      id: $id
      name: $name
      price: $price
      image: $image
      category: $category
      brand: $brand
      description: $description
      stock: $stock
      sizes: $sizes
      colours: $colours
      colourImages: $colourImages
      productImages: $productImages
      sizechart: $sizechart
      status: $status
    ) {
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
        name
        slug
        image
        status
      }

      status
    }
  }
`;

/* =========================================================
   DELETE PRODUCT
========================================================= */

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

/* =========================================================
   TYPES
========================================================= */

type SizechartOption = {
  id: string;
  name?: string;
  slug?: string;
  image?: string;
  status?: string;
};

type SizechartsResponse = {
  getSizecharts: SizechartOption[];
};

type BrandOption = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  status?: string;
};

type BrandsResponse = {
  brands: BrandOption[];
};

type ProductImage = {
  view: string;
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
  } | null;

  description?: string;
  stock?: number;
  sizes?: string[];
  colours?: string[];

  colourImages?: {
    colour: string;
    image: string;
  }[];

  productImages?: ProductImage[];

  sizechart?: {
    id: string;
    name?: string;
    slug?: string;
    image?: string;
    status?: string;
  } | null;

  status?: string;
};

type ProductsResponse = {
  products: {
    products: Product[];
    page: number;
    limit: number;
    hasMore: boolean;
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Products() {
  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const {
    data,
    loading,
    error,
    fetchMore,
    refetch,
  } = useQuery<ProductsResponse>(PRODUCTS_QUERY, {
    variables: {
      page: 1,
      limit: 6,
    },
  });

  /* =======================================================
     SIZECHART DATA
  ======================================================= */

  const { data: sizechartData } =
    useQuery<SizechartsResponse>(SIZECHARTS_QUERY);

  /* =======================================================
     BRAND DATA
  ======================================================= */
const {
  data: brandData,
  error: brandError,
  loading: brandLoading,
} = useQuery<BrandsResponse>(BRANDS_QUERY);

console.log("BRAND DATA:", brandData);
console.log("BRAND ERROR:", brandError);
console.log("BRAND LOADING:", brandLoading);
  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createProduct] =
    useMutation(CREATE_PRODUCT);

  const [updateProduct] =
    useMutation(UPDATE_PRODUCT);

  const [deleteProduct] =
    useMutation(DELETE_PRODUCT);

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("");
  const [colours, setColours] = useState("");
  const [colourImages, setColourImages] =
    useState("");

  /* =======================================================
     NEW PRODUCT VIEW IMAGES
  ======================================================= */

  const [frontImage, setFrontImage] =
    useState("");

  const [backImage, setBackImage] =
    useState("");

  const [sideImage, setSideImage] =
    useState("");

  const [detailImage, setDetailImage] =
    useState("");

  const [sizechart, setSizechart] =
    useState("");

  const [status, setStatus] =
    useState("active");

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setEditingId(null);

    setName("");
    setPrice("");
    setImage("");
    setCategory("");
    setBrand("");
    setDescription("");
    setStock("");
    setSizes("");
    setColours("");
    setColourImages("");

    setFrontImage("");
    setBackImage("");
    setSideImage("");
    setDetailImage("");

    setSizechart("");

    setStatus("active");
  };

  /* =======================================================
     CONVERT COMMA STRING TO ARRAY
  ======================================================= */

  const convertToArray = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(
        (item) => item.length > 0
      );
  };

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    /* -----------------------------------------------------
       COLOUR IMAGE CONVERSION
    ----------------------------------------------------- */

    const colourImageArray = colourImages
      .split(",")
      .map((item) => {
        const [
          colour,
          ...imageParts
        ] = item.split("=");

        return {
          colour: colour?.trim() || "",
          image: imageParts
            .join("=")
            .trim(),
        };
      })
      .filter(
        (item) =>
          item.colour &&
          item.image
      );

    /* -----------------------------------------------------
       PRODUCT VIEW IMAGES
    ----------------------------------------------------- */

    const productImages = [
      {
        view: "front",
        image: frontImage.trim(),
      },
      {
        view: "back",
        image: backImage.trim(),
      },
      {
        view: "side",
        image: sideImage.trim(),
      },
      {
        view: "detail",
        image: detailImage.trim(),
      },
    ].filter(
      (item) => item.image
    );

    /* -----------------------------------------------------
       PRODUCT VARIABLES
    ----------------------------------------------------- */

    const variables = {
      name: name.trim(),

      price: Number(price),

      image:
        image.trim() || undefined,

      category:
        category.trim() || undefined,

      brand:
        brand || undefined,

      description:
        description.trim() || undefined,

      stock:
        stock === ""
          ? undefined
          : Number(stock),

      sizes:
        convertToArray(sizes),

      colours:
        convertToArray(colours),

      colourImages:
        colourImageArray,

      productImages,

      sizechart:
        sizechart || undefined,

      status,
    };

    try {
      /* ---------------------------------------------------
         UPDATE
      --------------------------------------------------- */

      if (editingId) {
        await updateProduct({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert(
          "Product updated successfully"
        );
      }

      /* ---------------------------------------------------
         CREATE
      --------------------------------------------------- */

      else {
        await createProduct({
          variables,
        });

        alert(
          "Product created successfully"
        );
      }

      resetForm();

      await refetch();
    } catch (err) {
      console.error(
        "Product operation error:",
        err
      );

      alert(
        "Operation failed"
      );
    }
  };

  /* =======================================================
     HANDLE EDIT
  ======================================================= */

  const handleEdit = (
    product: Product
  ) => {
    setEditingId(product.id);

    setName(
      product.name || ""
    );

    setPrice(
      product.price !== undefined
        ? String(product.price)
        : ""
    );

    setImage(
      product.image || ""
    );

    setCategory(
      product.category || ""
    );

    setBrand(
      product.brand?.id || ""
    );

    setDescription(
      product.description || ""
    );

    setStock(
      product.stock !== undefined
        ? String(product.stock)
        : ""
    );

    setSizes(
      product.sizes?.join(", ") || ""
    );

    setColours(
      product.colours?.join(", ") || ""
    );

    setColourImages(
      product.colourImages
        ?.map(
          (item) =>
            `${item.colour}=${item.image}`
        )
        .join(", ") || ""
    );

    /* -----------------------------------------------------
       LOAD PRODUCT VIEW IMAGES
    ----------------------------------------------------- */

    setFrontImage(
      product.productImages?.find(
        (item) =>
          item.view === "front"
      )?.image || ""
    );

    setBackImage(
      product.productImages?.find(
        (item) =>
          item.view === "back"
      )?.image || ""
    );

    setSideImage(
      product.productImages?.find(
        (item) =>
          item.view === "side"
      )?.image || ""
    );

    setDetailImage(
      product.productImages?.find(
        (item) =>
          item.view === "detail"
      )?.image || ""
    );

    /* -----------------------------------------------------
       LOAD SELECTED SIZE GUIDE
    ----------------------------------------------------- */

    setSizechart(
      product.sizechart?.id || ""
    );

    setStatus(
      product.status || "active"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     HANDLE DELETE
  ======================================================= */

  const handleDelete = async (
    id: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      await deleteProduct({
        variables: {
          id,
        },
      });

      alert(
        "Product deleted successfully"
      );

      await refetch();
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      alert("Delete failed");
    }
  };

  /* =======================================================
     LOAD MORE
  ======================================================= */

  const handleLoadMore = async () => {
    if (
      !data?.products.hasMore ||
      loading
    ) {
      return;
    }

    await fetchMore({
      variables: {
        page:
          data.products.page + 1,

        limit:
          data.products.limit,
      },
    });
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#C9A227]" />

          <p className="text-sm text-gray-500">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
        <p className="font-semibold">
          Unable to load products
        </p>

        <p className="mt-1 text-sm">
          {error.message}
        </p>
      </div>
    );
  }

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const products =
    data?.products.products ?? [];

  /* =======================================================
     ACTIVE PRODUCTS
  ======================================================= */

  const activeProducts =
    products.filter(
      (product) =>
        product.status === "active"
    ).length;

  /* =======================================================
     LOW STOCK
  ======================================================= */

  const lowStockProducts =
    products.filter(
      (product) =>
        product.stock !== undefined &&
        product.stock > 0 &&
        product.stock <= 5
    ).length;

  /* =======================================================
     OUT OF STOCK
  ======================================================= */

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.stock === 0
    ).length;

  /* =======================================================
     ACTIVE SIZECHARTS
  ======================================================= */

  const activeSizecharts =
    sizechartData?.getSizecharts?.filter(
      (chart) =>
        chart.status === "active"
    ) ?? [];

  /* =======================================================
     ACTIVE BRANDS
  ======================================================= */
const activeBrands =
  brandData?.brands?.filter(
    (item) =>
      item.status === "active"
  ) ?? [];

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 sm:p-6 lg:p-8">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="mb-1 text-sm font-medium text-[#C9A227]">
              ARUNODAYA COLLECTIONS
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#172033]">
              Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your product catalogue,
              inventory and variants.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102f56]"
          >
            + Add New Product
          </button>

        </div>
      </div>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold text-[#172033]">
            {products.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Products currently loaded
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Products
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeProducts}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Currently available
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {lowStockProducts}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            5 units or less
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {outOfStockProducts}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Requires inventory update
          </p>
        </div>

      </div>

      {/* ===================================================
          PRODUCT FORM
      =================================================== */}

      <div
        className={`mb-8 overflow-hidden rounded-xl border bg-white shadow-sm ${
          editingId
            ? "border-[#C9A227]"
            : "border-gray-200"
        }`}
      >

        {/* FORM HEADER */}

        <div className="border-b border-gray-100 bg-white px-5 py-4 sm:px-6">

          <div className="flex items-center justify-between gap-3">

            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {editingId
                  ? "Update product information and variants."
                  : "Add a new product to your Arunodaya Collections catalogue."}
              </p>
            </div>

            {editingId && (
              <span className="rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold text-[#9B7A12]">
                Editing
              </span>
            )}

          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="mb-8">

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#172033]">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Product Name *
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="Example: Designer Silk Kurti"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category
                </label>

                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  <option value="Women">
                    Women
                  </option>

                  <option value="Men">
                    Men
                  </option>

                  <option value="Kids">
                    Kids
                  </option>
                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Brand
                </label>

                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  value={brand}
                  onChange={(e) =>
                    setBrand(e.target.value)
                  }
                >

                  <option value="">
                    No Brand
                  </option>

                  {activeBrands.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}

                </select>

                {activeBrands.length === 0 && (
                  <p className="mt-2 text-xs text-orange-500">
                    No active brands are available. Create one from the Brands page.
                  </p>
                )}

              </div>

              <div className="lg:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="Describe the product..."
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

          {/* =================================================
              PRICE & INVENTORY
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#172033]">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Price (₹) *
                </label>

                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="799"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="20"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              MAIN PRODUCT IMAGE
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-[#172033]">
              Main Product Image
            </h3>

            <p className="mb-4 text-xs text-gray-500">
              This is the main image shown on the Shop page.
            </p>
<label className="mb-2 block text-sm font-semibold text-gray-700">
  Main Product Image
</label>

<input
  type="file"
  accept="image/*"
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
  onChange={async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Upload failed"
        );
      }

      setImage(result.imageUrl);

      alert("Main image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Image upload failed");
    }
  }}
/>

            {image && (
              <div className="mt-4 flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3">

                <img
                  src={image}
                  alt="Product preview"
                  className="h-20 w-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

                <div>

                  <p className="text-sm font-semibold text-gray-700">
                    Image Preview
                  </p>

                  <p className="text-xs text-gray-400">
                    Main product image
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              PRODUCT VIEW IMAGES
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-[#172033]">
              Product Views
            </h3>

            <p className="mb-5 text-xs text-gray-500">
              Add different views so customers can see the
              product from different sides.
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* FRONT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Front Image
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="/products/product-front.jpg"
                  value={frontImage}
                  onChange={(e) =>
                    setFrontImage(
                      e.target.value
                    )
                  }
                />

                {frontImage && (
                  <img
                    src={frontImage}
                    alt="Front preview"
                    className="mt-3 h-32 w-full rounded-lg object-contain bg-gray-50"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}

              </div>

              {/* BACK */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Back Image
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="/products/product-back.jpg"
                  value={backImage}
                  onChange={(e) =>
                    setBackImage(
                      e.target.value
                    )
                  }
                />

                {backImage && (
                  <img
                    src={backImage}
                    alt="Back preview"
                    className="mt-3 h-32 w-full rounded-lg object-contain bg-gray-50"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}

              </div>

              {/* SIDE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Side Image
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="/products/product-side.jpg"
                  value={sideImage}
                  onChange={(e) =>
                    setSideImage(
                      e.target.value
                    )
                  }
                />

                {sideImage && (
                  <img
                    src={sideImage}
                    alt="Side preview"
                    className="mt-3 h-32 w-full rounded-lg object-contain bg-gray-50"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}

              </div>

              {/* DETAIL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Detail Image
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="/products/product-detail.jpg"
                  value={detailImage}
                  onChange={(e) =>
                    setDetailImage(
                      e.target.value
                    )
                  }
                />

                {detailImage && (
                  <img
                    src={detailImage}
                    alt="Detail preview"
                    className="mt-3 h-32 w-full rounded-lg object-contain bg-gray-50"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}

              </div>

            </div>

            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3">

              <p className="text-xs leading-5 text-blue-700">
                These images are optional. Add Front, Back,
                Side and Detail images whenever you have
                them. Customers will be able to switch
                between the views on the product page.
              </p>

            </div>

          </div>

          {/* =================================================
              PRODUCT VARIANTS
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-[#172033]">
              Product Variants
            </h3>

            <p className="mb-4 text-xs text-gray-500">
              Add sizes and colours separated by commas.
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Available Sizes
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="XS, S, M, L, XL"
                  value={sizes}
                  onChange={(e) =>
                    setSizes(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Available Colours
                </label>

                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  placeholder="White, Black, Yellow, Maroon"
                  value={colours}
                  onChange={(e) =>
                    setColours(e.target.value)
                  }
                />

              </div>

            </div>

            {/* =================================================
                SIZE GUIDE
            ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Size Guide
              </label>

              <select
                value={sizechart}
                onChange={(e) =>
                  setSizechart(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
              >

                <option value="">
                  No Size Guide
                </option>

                {activeSizecharts.map(
                  (chart) => (
                    <option
                      key={chart.id}
                      value={chart.id}
                    >
                      {chart.name}
                    </option>
                  )
                )}

              </select>

              <p className="mt-2 text-xs text-gray-400">
                Select the size chart that should
                appear for this product.
              </p>

              {activeSizecharts.length === 0 && (
                <p className="mt-2 text-xs text-orange-500">
                  No active size guides are available.
                  Create one from the Sizechart page.
                </p>
              )}

            </div>

          </div>

          {/* =================================================
              COLOUR IMAGES
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-[#172033]">
              Colour-specific Images
            </h3>

            <p className="mb-4 text-xs text-gray-500">

              Optional. Use this format:

              <br />

              <span className="font-medium text-gray-700">
                Black=https://image-url.com/black.jpg,
                White=https://image-url.com/white.jpg
              </span>

            </p>

            <textarea
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
              placeholder="Black=https://..., White=https://..."
              value={colourImages}
              onChange={(e) =>
                setColourImages(
                  e.target.value
                )
              }
            />

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="rounded-lg bg-[#0B1F3A] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102f56]"
            >
              {editingId
                ? "Update Product"
                : "Add Product"}
            </button>

          </div>

        </form>

      </div>

      {/* ===================================================
          PRODUCT LIST
      =================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-lg font-bold text-[#172033]">
                Product Catalogue
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Manage your current products.
              </p>

            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {products.length} products
            </span>

          </div>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {products.length === 0 ? (

          <div className="p-12 text-center">

            <p className="text-lg font-semibold text-gray-700">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Add your first product using the form above.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

            {products.map(
              (product) => {

                const isLowStock =
                  product.stock !== undefined &&
                  product.stock > 0 &&
                  product.stock <= 5;

                const isOutOfStock =
                  product.stock === 0;

                return (

                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-[#C9A227]/50 hover:shadow-md"
                  >

                    {/* IMAGE */}

                    <div className="relative h-56 overflow-hidden bg-gray-100">

                      {product.image ? (

                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          No image
                        </div>

                      )}

                      <div className="absolute left-3 top-3">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status ===
                            "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.status ===
                          "active"
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-bold text-[#172033]">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {product.category ||
                              "Uncategorized"}
                          </p>

                          {product.brand && (
                            <p className="mt-1 text-xs font-medium text-[#9B7A12]">
                              Brand: {product.brand.name}
                            </p>
                          )}

                        </div>

                        <p className="shrink-0 text-base font-bold text-[#0B1F3A]">
                          ₹{product.price}
                        </p>

                      </div>

                      {/* STOCK */}

                      <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">

                        <span className="text-xs font-medium text-gray-500">
                          Inventory
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            isOutOfStock
                              ? "text-red-600"
                              : isLowStock
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of stock"
                            : `${product.stock ?? 0} units`}
                        </span>

                      </div>

                      {/* SIZES */}

                      <div className="mt-4">

                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          Sizes
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                          {product.sizes?.length ? (

                            product.sizes.map(
                              (size) => (

                                <span
                                  key={size}
                                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600"
                                >
                                  {size}
                                </span>

                              )
                            )

                          ) : (

                            <span className="text-xs text-gray-400">
                              No sizes
                            </span>

                          )}

                        </div>

                      </div>

                      {/* COLOURS */}

                      <div className="mt-4">

                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          Colours
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                          {product.colours?.length ? (

                            product.colours.map(
                              (colour) => (

                                <span
                                  key={colour}
                                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600"
                                >
                                  {colour}
                                </span>

                              )
                            )

                          ) : (

                            <span className="text-xs text-gray-400">
                              No colours
                            </span>

                          )}

                        </div>

                      </div>

                      {/* PRODUCT VIEWS STATUS */}

                      <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2">

                        <div className="flex items-center justify-between gap-2">

                          <span className="text-xs font-semibold text-gray-500">
                            Product Views
                          </span>

                          <span className="text-xs font-semibold text-blue-700">
                            {product.productImages?.length || 0}
                            {" "}
                            image
                            {(product.productImages?.length || 0) !== 1
                              ? "s"
                              : ""}
                          </span>

                        </div>

                      </div>

                      {/* SIZE GUIDE */}

                      <div className="mt-4 rounded-lg bg-[#C9A227]/5 px-3 py-2">

                        <div className="flex items-center justify-between gap-2">

                          <span className="text-xs font-semibold text-gray-500">
                            Size Guide
                          </span>

                          <span className="text-xs font-semibold text-[#9B7A12]">
                            {product.sizechart?.name ||
                              "Not assigned"}
                          </span>

                        </div>

                      </div>

                      {/* DESCRIPTION */}

                      {product.description && (

                        <p className="mt-4 line-clamp-2 text-xs leading-5 text-gray-500">
                          {product.description}
                        </p>

                      )}

                      {/* ACTIONS */}

                      <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(product)
                          }
                          className="flex-1 rounded-lg border border-[#0B1F3A] px-3 py-2.5 text-xs font-semibold text-[#0B1F3A] transition hover:bg-[#0B1F3A] hover:text-white"
                        >
                          Edit Product
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              product.id
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

        {/* =================================================
            LOAD MORE
        ================================================= */}

        {data?.products.hasMore && (

          <div className="border-t border-gray-100 p-6 text-center">

            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-lg bg-[#0B1F3A] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#102f56] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Load More Products"}
            </button>

          </div>

        )}

        {/* =================================================
            END MESSAGE
        ================================================= */}

        {!data?.products.hasMore &&
          products.length > 0 && (

            <div className="border-t border-gray-100 px-6 py-5 text-center">

              <p className="text-xs text-gray-400">
                You have reached the end of your product catalogue.
              </p>

            </div>

          )}

      </div>

    </div>
  );
}

