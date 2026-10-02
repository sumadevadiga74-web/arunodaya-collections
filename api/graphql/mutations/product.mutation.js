import Product from "../../models/Product.js";
import { requireAdmin } from "../../permissions.js";

export const productMutationTypeDefs = `#graphql

  # --------------------------------------------------
  # Product Media
  # --------------------------------------------------

  input ProductMediaInput {
    type: String!
    url: String!
    publicId: String
  }

  # --------------------------------------------------
  # Product Offer
  # --------------------------------------------------

  input ProductOfferInput {
    minQty: Int
    maxQty: Int
    discountType: String
    pricePerUnit: Float
    percentOff: Float
    freeProductConfig: String
  }

  # --------------------------------------------------
  # Product Weight
  # --------------------------------------------------

  input ProductWeightInput {
    type: String
    value: Float
  }

  # --------------------------------------------------
  # Product Item / Variant
  # --------------------------------------------------

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

  input ProductExtraInfoInput {
    title: String
    description: String
    image: String
  }

  # --------------------------------------------------
  # SEO
  # --------------------------------------------------

  input ProductSEOInput {
    title: String
    description: String
    image: String
  }

  # --------------------------------------------------
  # Product Image Info
  # --------------------------------------------------

  input ProductImageInfoInput {
    lineOne: String
    lineTwo: String
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
    ): Product

    deleteProduct(
      id: ID!
    ): Product
  }
`;

export const productMutationResolvers = {
  Mutation: {
    createProduct: async (_, args, context) => {
      requireAdmin(context);

      const product = await Product.create({
        ...args,

        status: args.status || "draft",

        categories: args.categories || [],

        mainMedia: args.mainMedia || [],

        images: args.images || [],

        similarItems: args.similarItems || [],

        items: args.items || [],

        rating: args.rating || 0,

        reviewsCount: args.reviewsCount || 0,
      });

      return product;
    },

    updateProduct: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Product.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );
    },

    deleteProduct: async (_, { id }, context) => {
      requireAdmin(context);

      return await Product.findByIdAndDelete(id);
    },
  },
};