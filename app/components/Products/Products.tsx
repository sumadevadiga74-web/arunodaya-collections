"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import MediaLibrary from "../MediaLibrary/MediaLibrary";

/* =========================================================
   TYPES
========================================================= */

type ProductMedia = {
  type: string;
  url: string;
  publicId?: string | null;
};

type MediaLibraryItem = {
  id: string;
  mediaType: string;
  url: string;
  publicId?: string;
  fullPublicId?: string;
  altText?: string;
  folder?: string;
  createdAt?: string;
};

type ProductItem = {
  id?: string;
  price?: number | null;
  onDiscount?: boolean | null;
  mrp?: number | null;
  discountPerc?: number | null;
  discountAmount?: number | null;
  sellingPrice?: number | null;
  currency?: string | null;
  barcode?: string | null;
  sku?: string | null;
  stock?: number | null;
  size?: string | null;
  colour?: string | null;
  images?: ProductMedia[] | null;
};

type Product = {
  id: string;
  name: string;
  status?: string | null;
  subTitle?: string | null;
  slug?: string | null;
  description?: string | null;
  skuPrefix?: string | null;

  storeId?: string | null;

  brand?: {
    id: string;
    name: string;
  } | null;

  categories?: string[] | null;

  mainMedia?: ProductMedia[] | null;
  images?: ProductMedia[] | null;

  sizeChart?: {
    id: string;
    name: string;
    slug?: string | null;
    image?: string | null;
    status?: string | null;
  } | null;

  rating?: number | null;
  reviewsCount?: number | null;

  items?: ProductItem[] | null;
};

type ProductPage = {
  products: Product[];
  page: number;
  limit: number;
  hasMore: boolean;
};

type ProductsResponse = {
  products: ProductPage;
};

type Brand = {
  id: string;
  name: string;
  status?: string | null;
};

type BrandsResponse = {
  brands: Brand[];
};

type SizeChart = {
  id: string;
  name: string;
  slug?: string | null;
  image?: string | null;
  status?: string | null;
};

type SizeChartsResponse = {
  sizecharts: SizeChart[];
};

type VariantForm = {
  colour: string;
  size: string;
  price: string;
  stock: string;
  sku: string;
  barcode: string;
  images: ProductMedia[];
};

/* =========================================================
   PRODUCTS QUERY
========================================================= */

const PRODUCTS_QUERY = gql`
  query Products($page: Int, $limit: Int) {
    products(page: $page, limit: $limit) {
      products {
        id
        name
        status
        subTitle
        slug
        description
        skuPrefix
        storeId

        brand {
          id
          name
        }

        categories

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

        sizeChart {
          id
          name
          slug
          image
          status
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
          barcode
          sku
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
      status
    }
  }
`;

/* =========================================================
   SIZE CHART QUERY
========================================================= */

const SIZE_CHARTS_QUERY = gql`
  query Sizecharts {
    sizecharts {
      id
      name
      slug
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
    $status: String
    $subTitle: String
    $slug: String
    $description: String
    $skuPrefix: String
    $storeId: ID
    $brand: ID
    $categories: [String!]
    $mainMedia: [ProductMediaInput!]
    $images: [ProductMediaInput!]
    $sizeChart: ID
    $items: [ProductItemInput!]
  ) {
    createProduct(
      name: $name
      status: $status
      subTitle: $subTitle
      slug: $slug
      description: $description
      skuPrefix: $skuPrefix
      storeId: $storeId
      brand: $brand
      categories: $categories
      mainMedia: $mainMedia
      images: $images
      sizeChart: $sizeChart
      items: $items
    ) {
      id
      name
      status
      subTitle
      slug
      description
      skuPrefix
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

      sizeChart {
        id
        name
        slug
        image
        status
      }

      items {
        id
        price
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

      rating
      reviewsCount
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
    $status: String
    $subTitle: String
    $slug: String
    $description: String
    $skuPrefix: String
    $storeId: ID
    $brand: ID
    $categories: [String!]
    $mainMedia: [ProductMediaInput!]
    $images: [ProductMediaInput!]
    $sizeChart: ID
    $items: [ProductItemInput!]
  ) {
    updateProduct(
      id: $id
      name: $name
      status: $status
      subTitle: $subTitle
      slug: $slug
      description: $description
      skuPrefix: $skuPrefix
      storeId: $storeId
      brand: $brand
      categories: $categories
      mainMedia: $mainMedia
      images: $images
      sizeChart: $sizeChart
      items: $items
    ) {
      id
      name
      status
      subTitle
      slug
      description
      skuPrefix
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

      sizeChart {
        id
        name
        slug
        image
        status
      }

      items {
        id
        price
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

      rating
      reviewsCount
    }
  }
`;

/* =========================================================
   HELPERS
========================================================= */

const emptyVariant = (): VariantForm => ({
  colour: "",
  size: "",
  price: "",
  stock: "",
  sku: "",
  barcode: "",
  images: [],
});

/* =========================================================
   COMPONENT
========================================================= */

export default function Products() {
  /* =======================================================
     PRODUCT QUERY
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
      limit: 12,
    },
  });

  /* =======================================================
     BRAND QUERY
  ======================================================= */

  const {
    data: brandData,
    loading: brandsLoading,
  } = useQuery<BrandsResponse>(BRANDS_QUERY);

  /* =======================================================
     SIZE CHART QUERY
  ======================================================= */

  const { data: sizeChartData } =
    useQuery<SizeChartsResponse>(SIZE_CHARTS_QUERY);

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createProduct, { loading: creating }] =
    useMutation<any>(CREATE_PRODUCT);

  const [updateProduct, { loading: updating }] =
    useMutation<any>(UPDATE_PRODUCT);

  /* =======================================================
     EDITING
  ======================================================= */

  const [editingId, setEditingId] =
    useState<string | null>(null);

  /* =======================================================
     PRODUCT FORM
  ======================================================= */

  const [name, setName] = useState("");
  const [status, setStatus] = useState("draft");
  const [subTitle, setSubTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [skuPrefix, setSkuPrefix] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [sizeChart, setSizeChart] = useState("");

  /* =======================================================
     GLOBAL MEDIA
  ======================================================= */

  const [selectedMedia, setSelectedMedia] =
    useState<MediaLibraryItem[]>([]);

  /* =======================================================
     VARIANTS
  ======================================================= */

  const [items, setItems] = useState<VariantForm[]>([
    emptyVariant(),
  ]);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     BRANDS
  ======================================================= */

  const activeBrands =
    brandData?.brands?.filter(
      (item) =>
        !item.status ||
        item.status === "active"
    ) ?? [];

  /* =======================================================
     SIZE CHARTS
  ======================================================= */

  const activeSizeCharts =
    sizeChartData?.sizecharts?.filter(
      (item) =>
        !item.status ||
        item.status === "active"
    ) ?? [];

  /* =======================================================
     MEDIA HELPERS
  ======================================================= */

  const mediaToProductMedia = (
    media: MediaLibraryItem
  ): ProductMedia => ({
    type: media.mediaType || "image",
    url: media.url,
    publicId: media.publicId || null,
  });

  const addGlobalMedia = (
    media: MediaLibraryItem
  ) => {
    setSelectedMedia((previous) => {
      if (
        previous.some(
          (item) => item.id === media.id
        )
      ) {
        return previous;
      }

      return [...previous, media];
    });
  };

  const removeGlobalMedia = (
    mediaId: string
  ) => {
    setSelectedMedia((previous) =>
      previous.filter(
        (item) => item.id !== mediaId
      )
    );
  };

  const addVariantMedia = (
    index: number,
    media: MediaLibraryItem
  ) => {
    setItems((previous) =>
      previous.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          const alreadyExists =
            item.images.some(
              (image) =>
                image.url === media.url
            );

          if (alreadyExists) {
            return item;
          }

          return {
            ...item,
            images: [
              ...item.images,
              mediaToProductMedia(media),
            ],
          };
        }
      )
    );
  };

  const removeVariantMedia = (
    index: number,
    imageUrl: string
  ) => {
    setItems((previous) =>
      previous.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          return {
            ...item,
            images: item.images.filter(
              (image) =>
                image.url !== imageUrl
            ),
          };
        }
      )
    );
  };

  /* =======================================================
     VARIANT FUNCTIONS
  ======================================================= */

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      emptyVariant(),
    ]);
  };

  const removeItem = (
    index: number
  ) => {
    setItems((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  };

  const updateItem = (
    index: number,
    field: keyof Omit<VariantForm, "images">,
    value: string
  ) => {
    setItems((previous) =>
      previous.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setEditingId(null);

    setName("");
    setStatus("draft");
    setSubTitle("");
    setSlug("");
    setDescription("");
    setSkuPrefix("");

    setBrand("");
    setCategory("");
    setSizeChart("");

    setSelectedMedia([]);

    setItems([
      emptyVariant(),
    ]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    /* -----------------------------------------------------
       NAME
    ----------------------------------------------------- */

    if (!name.trim()) {
      alert(
        "Product name is required."
      );
      return;
    }

    /* -----------------------------------------------------
       VARIANTS
    ----------------------------------------------------- */

    const validItems = items
      .filter(
        (item) =>
          item.colour.trim() ||
          item.size.trim() ||
          item.price.trim() ||
          item.stock.trim() ||
          item.sku.trim() ||
          item.barcode.trim() ||
          item.images.length > 0
      )
      .map((item) => ({
        colour:
          item.colour.trim() ||
          undefined,

        size:
          item.size.trim() ||
          undefined,

        price:
          item.price.trim()
            ? Number(item.price)
            : undefined,

        stock:
          item.stock.trim()
            ? Number(item.stock)
            : undefined,

        sku:
          item.sku.trim() ||
          undefined,

        barcode:
          item.barcode.trim() ||
          undefined,

        currency: "INR",

        images: item.images,
      }));

    if (validItems.length === 0) {
      alert(
        "Please add at least one product variant."
      );
      return;
    }

    /* -----------------------------------------------------
       NUMBER VALIDATION
    ----------------------------------------------------- */

    const invalidNumber =
      validItems.some(
        (item) =>
          (item.price !== undefined &&
            Number.isNaN(item.price)) ||
          (item.stock !== undefined &&
            Number.isNaN(item.stock))
      );

    if (invalidNumber) {
      alert(
        "Price and stock must be valid numbers."
      );
      return;
    }

    /* -----------------------------------------------------
       CATEGORIES
    ----------------------------------------------------- */

    const categories =
      category.trim()
        ? [category.trim()]
        : [];

    /* -----------------------------------------------------
       GLOBAL MEDIA
    ----------------------------------------------------- */

    const allGlobalMedia =
      selectedMedia.map(
        mediaToProductMedia
      );

    const mainMedia =
      selectedMedia.length > 0
        ? [
            mediaToProductMedia(
              selectedMedia[0]
            ),
          ]
        : [];

    const images =
      allGlobalMedia;

    /* -----------------------------------------------------
       VARIABLES
    ----------------------------------------------------- */
const cleanProductMedia = (media: any) => ({
  type: media?.type || "image",
  url: media?.url || "",
  publicId: media?.publicId || "",
});

const cleanProductItems = validItems.map((item: any) => ({
  ...item,
  images: (item.images || []).map(cleanProductMedia),
}));

    const variables = {
      name: name.trim(),

      status:
        status || "draft",

      subTitle:
        subTitle.trim() ||
        undefined,

      slug:
        slug.trim() ||
        undefined,

      description:
        description.trim() ||
        undefined,

      skuPrefix:
        skuPrefix.trim() ||
        undefined,

      brand:
        brand || undefined,

      categories,

      mainMedia,

      images,

      sizeChart:
        sizeChart || undefined,

items: cleanProductItems,
    };

    console.log(
      "Product variables:",
      variables
    );

    /* -----------------------------------------------------
       SAVE
    ----------------------------------------------------- */

    try {
      if (editingId) {
        await updateProduct({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert(
          "Product updated successfully."
        );
      } else {
        await createProduct({
          variables,
        });

        alert(
          "Product created successfully."
        );
      }

      resetForm();

      await refetch();
    } catch (mutationError: any) {
      console.error(
        "Product save error:",
        mutationError
      );

      alert(
        mutationError?.message ||
          "Unable to save product."
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

    setStatus(
      product.status || "draft"
    );

    setSubTitle(
      product.subTitle || ""
    );

    setSlug(
      product.slug || ""
    );

    setDescription(
      product.description || ""
    );

    setSkuPrefix(
      product.skuPrefix || ""
    );

    setBrand(
      product.brand?.id || ""
    );

    setCategory(
      product.categories?.[0] || ""
    );

    setSizeChart(
      product.sizeChart?.id || ""
    );

    /* -----------------------------------------------------
       LOAD GLOBAL MEDIA
    ----------------------------------------------------- */

    const globalMedia = [
      ...(product.mainMedia || []),
      ...(product.images || []),
    ];

    const uniqueMedia =
      globalMedia.filter(
        (media, index, array) =>
          array.findIndex(
            (item) =>
              item.url === media.url
          ) === index
      );

    setSelectedMedia(
      uniqueMedia.map(
        (media, index) => ({
          id:
            media.publicId ||
            `existing-media-${index}-${media.url}`,
          mediaType:
            media.type || "image",
          url: media.url,
          publicId:
            media.publicId || undefined,
        })
      )
    );

    /* -----------------------------------------------------
       LOAD VARIANTS
    ----------------------------------------------------- */

    if (
      product.items &&
      product.items.length > 0
    ) {
      setItems(
        product.items.map(
          (item) => ({
            colour:
              item.colour || "",

            size:
              item.size || "",

            price:
              item.price !== null &&
              item.price !== undefined
                ? String(item.price)
                : "",

            stock:
              item.stock !== null &&
              item.stock !== undefined
                ? String(item.stock)
                : "",

            sku:
              item.sku || "",

            barcode:
              item.barcode || "",

            images:
              item.images || [],
          })
        )
      );
    } else {
      setItems([
        emptyVariant(),
      ]);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     LOAD MORE
  ======================================================= */

  const handleLoadMore =
    async () => {
      if (
        loading ||
        !data?.products?.hasMore
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
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#C9A227]" />

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
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          Unable to load products
        </p>

        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const products =
    data?.products?.products ?? [];

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredProducts =
    products.filter(
      (product) => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        const productName =
          product.name
            ?.toLowerCase() || "";

        const productBrand =
          product.brand?.name
            ?.toLowerCase() || "";

        const productCategory =
          product.categories
            ?.join(" ")
            .toLowerCase() || "";

        return (
          productName.includes(query) ||
          productBrand.includes(query) ||
          productCategory.includes(query)
        );
      }
    );

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.status === "active" ||
        product.status === "published"
    ).length;

  const totalVariants =
    products.reduce(
      (total, product) =>
        total +
        (product.items?.length || 0),
      0
    );

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        (product.items || []).reduce(
          (itemTotal, item) =>
            itemTotal +
            Number(item.stock || 0),
          0
        ),
      0
    );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 sm:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="mb-1 text-sm font-medium tracking-wide text-[#C9A227]">
              ARUNODAYA COLLECTIONS
            </p>

            <h1 className="text-3xl font-bold text-[#0B1F3A]">
              Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage products, variants, pricing and stock.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17365f]"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Products
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeProducts}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Variants
          </p>

          <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
            {totalVariants}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-[#C9A227]">
            {totalStock}
          </p>
        </div>

      </div>

      {/* =================================================
          PRODUCT FORM
      ================================================= */}

      <div
        className={`mb-8 overflow-hidden rounded-xl border bg-white shadow-sm ${
          editingId
            ? "border-[#C9A227]"
            : "border-gray-200"
        }`}
      >

        {/* FORM HEADER */}

        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Product information and variants.
              </p>
            </div>

            {editingId && (
              <span className="rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold text-[#9A7810]">
                Editing
              </span>
            )}

          </div>
        </div>

        {/* FORM BODY */}

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="mb-8">

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0B1F3A]">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Product Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Example: Designer Silk Kurti"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="trash">
                    Trash
                  </option>
                </select>
              </div>

              {/* SUBTITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Sub Title
                </label>

                <input
                  type="text"
                  value={subTitle}
                  onChange={(event) =>
                    setSubTitle(event.target.value)
                  }
                  placeholder="Short product subtitle"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  placeholder="designer-silk-kurti"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* SKU PREFIX */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  SKU Prefix
                </label>

                <input
                  type="text"
                  value={skuPrefix}
                  onChange={(event) =>
                    setSkuPrefix(event.target.value)
                  }
                  placeholder="KURTI"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* BRAND */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Brand
                </label>

                <select
                  value={brand}
                  onChange={(event) =>
                    setBrand(event.target.value)
                  }
                  disabled={brandsLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 disabled:bg-gray-100"
                >
                  <option value="">
                    Select Brand
                  </option>

                  {activeBrands.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
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

              {/* SIZE CHART */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Size Chart
                </label>

                <select
                  value={sizeChart}
                  onChange={(event) =>
                    setSizeChart(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                >
                  <option value="">
                    No Size Chart
                  </option>

                  {activeSizeCharts.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the product..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              MEDIA LIBRARY
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <div className="mb-4">

              <h3 className="text-sm font-bold uppercase tracking-wide text-[#0B1F3A]">
                Global Product Images
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Select images from the Media Library. The first
                selected image will be used as the main image.
              </p>

            </div>

            <MediaLibrary
              selectedMedia={selectedMedia}
              onSelect={addGlobalMedia}
            />

            {/* SELECTED GLOBAL IMAGES */}

            {selectedMedia.length > 0 && (
              <div className="mt-5">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-xs font-semibold text-gray-600">
                    Selected Images
                  </p>

                  <p className="text-xs text-gray-400">
                    {selectedMedia.length} selected
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">

                  {selectedMedia.map(
                    (media, index) => (
                      <div
                        key={media.id}
                        className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                      >

                        <img
                          src={media.url}
                          alt={
                            media.altText ||
                            "Selected product image"
                          }
                          className="h-28 w-full object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-[#0B1F3A] px-2 py-1 text-[10px] font-semibold text-white">
                            Main
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeGlobalMedia(
                              media.id
                            )
                          }
                          className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              VARIANTS
          ================================================= */}

          <div className="mb-8 border-t border-gray-100 pt-8">

            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <h3 className="text-sm font-bold uppercase tracking-wide text-[#0B1F3A]">
                  Product Variants
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Add Colour and Size combinations with their
                  own price, stock and images.
                </p>

              </div>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg border border-[#0B1F3A] px-4 py-2.5 text-xs font-semibold text-[#0B1F3A] transition hover:bg-[#0B1F3A] hover:text-white"
              >
                + Add Variant
              </button>

            </div>

            <div className="space-y-4">

              {items.map(
                (item, index) => (

                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >

                    {/* VARIANT HEADER */}

                    <div className="mb-4 flex items-center justify-between">

                      <div>

                        <p className="text-sm font-bold text-[#0B1F3A]">
                          Variant {index + 1}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          Item level variant
                        </p>

                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    {/* VARIANT FIELDS */}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                      {/* COLOUR */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Colour
                        </label>

                        <input
                          type="text"
                          value={item.colour}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "colour",
                              event.target.value
                            )
                          }
                          placeholder="Black"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      {/* SIZE */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Size
                        </label>

                        <input
                          type="text"
                          value={item.size}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "size",
                              event.target.value
                            )
                          }
                          placeholder="M"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      {/* PRICE */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Price (₹)
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "price",
                              event.target.value
                            )
                          }
                          placeholder="799"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      {/* STOCK */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Stock
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.stock}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "stock",
                              event.target.value
                            )
                          }
                          placeholder="20"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      {/* SKU */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          SKU
                        </label>

                        <input
                          type="text"
                          value={item.sku}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "sku",
                              event.target.value
                            )
                          }
                          placeholder="KURTI-BLK-M"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      {/* BARCODE */}

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Barcode
                        </label>

                        <input
                          type="text"
                          value={item.barcode}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "barcode",
                              event.target.value
                            )
                          }
                          placeholder="890123456789"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                        />
                      </div>

                    </div>

                    {/* =================================================
                        VARIANT MEDIA
                    ================================================= */}

                    <div className="mt-6 border-t border-gray-200 pt-5">

                      <div className="mb-4">

                        <h4 className="text-xs font-bold uppercase tracking-wide text-[#0B1F3A]">
                          Variant Images
                        </h4>

                        <p className="mt-1 text-[11px] text-gray-500">
                          These images are shown only when this
                          Colour/Size variant is selected.
                        </p>

                      </div>

                      <MediaLibrary
                        selectedMedia={item.images.map(
                          (image, imageIndex) => ({
                            id:
                              image.publicId ||
                              `${index}-${imageIndex}-${image.url}`,
                            mediaType:
                              image.type || "image",
                            url: image.url,
                            publicId:
                              image.publicId ||
                              undefined,
                          })
                        )}
                        onSelect={(media) =>
                          addVariantMedia(
                            index,
                            media
                          )
                        }
                      />

                      {/* SELECTED VARIANT IMAGES */}

                      {item.images.length > 0 && (
                        <div className="mt-4">

                          <p className="mb-3 text-xs font-semibold text-gray-600">
                            Selected Variant Images
                          </p>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">

                            {item.images.map(
                              (image, imageIndex) => (
                                <div
                                  key={`${image.url}-${imageIndex}`}
                                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                                >

                                  <img
                                    src={image.url}
                                    alt="Variant"
                                    className="h-24 w-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeVariantMedia(
                                        index,
                                        image.url
                                      )
                                    }
                                    className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white"
                                  >
                                    ×
                                  </button>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* =================================================
              FORM BUTTONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={creating || updating}
              className="rounded-lg bg-[#0B1F3A] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#17365f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating || updating
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Create Product"}
            </button>

          </div>

        </form>

      </div>

      {/* =================================================
          PRODUCT LIST
      ================================================= */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* LIST HEADER */}

        <div className="border-b border-gray-100 p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-bold text-[#0B1F3A]">
                Product Catalogue
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                View and manage your products.
              </p>

            </div>

            <div className="w-full lg:w-80">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
              />

            </div>

          </div>

        </div>

        {/* PRODUCT CARDS */}

        {filteredProducts.length === 0 ? (

          <div className="p-12 text-center">

            <p className="text-lg font-semibold text-gray-700">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {search
                ? "Try another search."
                : "Create your first product above."}
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">

            {filteredProducts.map(
              (product) => {

                const firstImage =
                  product.mainMedia?.[0]?.url ||
                  product.images?.[0]?.url ||
                  "";

                const variants =
                  product.items || [];

                const stock =
                  variants.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.stock || 0
                      ),
                    0
                  );

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-[#C9A227]/50 hover:shadow-md"
                  >

                    {/* IMAGE */}

                    <div className="relative h-60 overflow-hidden bg-gray-100">

                      {firstImage ? (

                        <img
                          src={firstImage}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          No Image
                        </div>

                      )}

                      <div className="absolute left-3 top-3">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status ===
                              "active" ||
                            product.status ===
                              "published"
                              ? "bg-green-100 text-green-700"
                              : product.status ===
                                "trash"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.status ||
                            "draft"}
                        </span>

                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="p-5">

                      <h3 className="truncate text-base font-bold text-[#0B1F3A]">
                        {product.name}
                      </h3>

                      {product.subTitle && (
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {product.subTitle}
                        </p>
                      )}

                      {/* CATEGORY / BRAND */}

                      <div className="mt-2 flex flex-wrap gap-2">

                        {product.categories?.map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600"
                            >
                              {item}
                            </span>
                          )
                        )}

                        {product.brand && (
                          <span className="rounded-full bg-[#C9A227]/10 px-2.5 py-1 text-[10px] font-semibold text-[#92720B]">
                            {product.brand.name}
                          </span>
                        )}

                      </div>

                      {/* VARIANT SUMMARY */}

                      <div className="mt-4 rounded-lg bg-gray-50 p-3">

                        <div className="mb-3 flex items-center justify-between">

                          <span className="text-xs font-semibold text-gray-500">
                            Variants
                          </span>

                          <span className="text-xs font-bold text-[#0B1F3A]">
                            {variants.length}
                          </span>

                        </div>

                        <div className="space-y-2">

                          {variants
                            .slice(0, 4)
                            .map(
                              (
                                item,
                                index
                              ) => (

                                <div
                                  key={
                                    item.id ||
                                    index
                                  }
                                  className="flex items-center justify-between rounded-md bg-white px-3 py-2"
                                >

                                  <div>

                                    <p className="text-xs font-semibold text-gray-700">
                                      {item.colour ||
                                        "No colour"}{" "}
                                      /{" "}
                                      {item.size ||
                                        "No size"}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-gray-400">
                                      SKU:{" "}
                                      {item.sku ||
                                        "-"}
                                    </p>

                                  </div>

                                  <div className="text-right">

                                    <p className="text-xs font-bold text-[#0B1F3A]">
                                      ₹
                                      {item.price ??
                                        0}
                                    </p>

                                    <p className="text-[10px] text-gray-400">
                                      Stock:{" "}
                                      {item.stock ??
                                        0}
                                    </p>

                                  </div>

                                </div>

                              )
                            )}

                        </div>

                        {variants.length > 4 && (
                          <p className="mt-2 text-center text-[10px] text-gray-400">
                            +
                            {variants.length -
                              4}{" "}
                            more variants
                          </p>
                        )}

                      </div>

                      {/* INVENTORY */}

                      <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">

                        <span className="text-xs font-medium text-gray-500">
                          Total Stock
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            stock === 0
                              ? "text-red-600"
                              : stock <= 5
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                        >
                          {stock} units
                        </span>

                      </div>

                      {/* SIZE CHART */}

                      {product.sizeChart && (
                        <p className="mt-3 text-xs text-gray-500">
                          Size Chart:{" "}
                          <span className="font-semibold text-gray-700">
                            {product.sizeChart.name}
                          </span>
                        </p>
                      )}

                      {/* ACTIONS */}

                      <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                          className="w-full rounded-lg border border-[#0B1F3A] px-3 py-2.5 text-xs font-semibold text-[#0B1F3A] transition hover:bg-[#0B1F3A] hover:text-white"
                        >
                          Edit
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

        {/* LOAD MORE */}

        {data?.products?.hasMore && (
          <div className="border-t border-gray-100 p-6 text-center">

            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-lg bg-[#0B1F3A] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#17365f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Load More Products"}
            </button>

          </div>
        )}

        {/* END */}

        {!data?.products?.hasMore &&
          products.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-5 text-center">

              <p className="text-xs text-gray-400">
                End of product catalogue.
              </p>

            </div>
          )}

      </div>

    </div>
  );
}