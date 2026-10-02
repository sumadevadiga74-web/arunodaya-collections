import Product from "../../models/Product.js";

export const productTypeDefs = `#graphql

  # --------------------------------------------------
  # Product Media
  # --------------------------------------------------

  type ProductMedia {
    type: String!
    url: String!
    publicId: String
  }

  input ProductMediaInput {
    type: String!
    url: String!
    publicId: String
  }

  # --------------------------------------------------
  # Product Item / Variant
  # --------------------------------------------------

  type ProductOffer {
    minQty: Int
    maxQty: Int
    discountType: String
    pricePerUnit: Float
    percentOff: Float
    freeProductConfig: String
  }

  input ProductOfferInput {
    minQty: Int
    maxQty: Int
    discountType: String
    pricePerUnit: Float
    percentOff: Float
    freeProductConfig: String
  }

  type ProductWeight {
    type: String
    value: Float
  }

  input ProductWeightInput {
    type: String
    value: Float
  }

  type ProductItem {
    id: ID!
    price: Float
    onDiscount: Boolean
    mrp: Float
    discountPerc: Float
    discountAmount: Float
    sellingPrice: Float
    currency: String
    offers: ProductOffer
    categories: [String!]
    brands: [String!]
    freeQty: Int
    barcode: String
    sku: String
    weight: ProductWeight
    stock: Int
    size: String
    colour: String
    images: [ProductMedia!]
  }

  input ProductItemInput {
    price: Float
    onDiscount: Boolean
    mrp: Float
    discountPerc: Float
    discountAmount: Float
    sellingPrice: Float
    currency: String
    offers: ProductOfferInput
    categories: [String!]
    brands: [String!]
    freeQty: Int
    barcode: String
    sku: String
    weight: ProductWeightInput
    stock: Int
    size: String
    colour: String
    images: [ProductMediaInput!]
  }

  # --------------------------------------------------
  # Extra Info
  # --------------------------------------------------

  type ProductExtraInfo {
    title: String
    description: String
    image: String
  }

  input ProductExtraInfoInput {
    title: String
    description: String
    image: String
  }

  # --------------------------------------------------
  # SEO
  # --------------------------------------------------

  type ProductSEO {
    title: String
    description: String
    image: String
  }

  input ProductSEOInput {
    title: String
    description: String
    image: String
  }

  # --------------------------------------------------
  # Product Image Info
  # --------------------------------------------------

  type ProductImageInfo {
    lineOne: String
    lineTwo: String
  }

  input ProductImageInfoInput {
    lineOne: String
    lineTwo: String
  }

  # --------------------------------------------------
  # Product
  # --------------------------------------------------

  type Product {
    id: ID!
    name: String!
    status: String
    subTitle: String
    slug: String
    description: String
    skuPrefix: String

    storeId: ID
    brand: Brand

    extraInfo: ProductExtraInfo
    categories: [String!]

    seo: ProductSEO

    mainMedia: [ProductMedia!]
    images: [ProductMedia!]

    similarItems: [Product!]

    productImageInfo: ProductImageInfo

    sizeChart: Sizechart

    rating: Float
    reviewsCount: Int

    items: [ProductItem!]
  }

  # --------------------------------------------------
  # Product Pagination
  # --------------------------------------------------

  type ProductPage {
    products: [Product!]!
    page: Int!
    limit: Int!
    hasMore: Boolean!
  }

  # --------------------------------------------------
  # Queries
  # --------------------------------------------------

  extend type Query {
    products(
      page: Int
      limit: Int
    ): ProductPage!

    product(
      id: ID!
    ): Product

    productsByIds(
      ids: [ID!]!
    ): [Product!]!
  }

  # --------------------------------------------------
  # Mutations
  # --------------------------------------------------

  extend type Mutation {

    createProduct(
      name: String!
      status: String
      subTitle: String
      slug: String
      description: String
      skuPrefix: String
      storeId: ID
      brand: ID
      extraInfo: ProductExtraInfoInput
      categories: [String!]
      seo: ProductSEOInput
      mainMedia: [ProductMediaInput!]
      images: [ProductMediaInput!]
      similarItems: [ID!]
      productImageInfo: ProductImageInfoInput
      sizeChart: ID
      rating: Float
      reviewsCount: Int
      items: [ProductItemInput!]
    ): Product!

    updateProduct(
      id: ID!
      name: String
      status: String
      subTitle: String
      slug: String
      description: String
      skuPrefix: String
      storeId: ID
      brand: ID
      extraInfo: ProductExtraInfoInput
      categories: [String!]
      seo: ProductSEOInput
      mainMedia: [ProductMediaInput!]
      images: [ProductMediaInput!]
      similarItems: [ID!]
      productImageInfo: ProductImageInfoInput
      sizeChart: ID
      rating: Float
      reviewsCount: Int
      items: [ProductItemInput!]
    ): Product!
  }
`;

export const productResolvers = {
  Query: {
    product: async (_, { id }) => {
      return await Product.findById(id);
    },

    productsByIds: async (_, { ids }) => {
      const validIds = ids.filter((id) =>
        /^[0-9a-fA-F]{24}$/.test(String(id))
      );

      if (validIds.length === 0) {
        return [];
      }

      return await Product.find({
        _id: { $in: validIds },
      });
    },

    products: async (_, { page = 1, limit = 10 }) => {
      const skip = (page - 1) * limit;

      const products = await Product.find()
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments();

      return {
        products,
        page,
        limit,
        hasMore: skip + products.length < total,
      };
    },
  },

  Product: {
    id: (product) => product._id.toString(),

    storeId: (product) =>
      product.storeId
        ? product.storeId.toString()
        : null,

    brand: async (product) => {
      if (!product.brand) {
        return null;
      }

      const Brand = (
        await import("../../models/Brand.js")
      ).default;

      return await Brand.findById(product.brand);
    },

    similarItems: async (product) => {
      if (
        !product.similarItems ||
        product.similarItems.length === 0
      ) {
        return [];
      }

      return await Product.find({
        _id: {
          $in: product.similarItems,
        },
      });
    },

    sizeChart: async (product) => {
      if (!product.sizeChart) {
        return null;
      }

      const Sizechart = (
        await import("../../models/Sizechart.js")
      ).default;

      return await Sizechart.findById(product.sizeChart);
    },
  },

  ProductItem: {
    id: (item) => item._id.toString(),
  },
};