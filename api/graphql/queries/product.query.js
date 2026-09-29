import Product from "../../models/Product.js";

export const productTypeDefs = `#graphql

  type ColourImage {
    colour: String!
    image: String!
  }

  type ProductImage {
    view: String
    image: String
  }

  input ProductImageInput {
    view: String!
    image: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    image: String
    category: String
    brand: Brand
    description: String
    stock: Int
    sizes: [String!]
    colours: [String!]
    colourImages: [ColourImage!]
    productImages: [ProductImage!]
    sizechart: Sizechart
    status: String
  }

  type ProductPage {
    products: [Product!]!
    page: Int!
    limit: Int!
    hasMore: Boolean!
  }

  extend type Query {
    products(page: Int, limit: Int): ProductPage!
    product(id: ID!): Product
    productsByIds(ids: [ID!]!): [Product!]!
  }

  extend type Mutation {
    createProduct(
      name: String!
      price: Float!
      image: String
      category: String
      brand: ID
      description: String
      stock: Int
      sizes: [String!]
      colours: [String!]
      colourImages: [ColourImageInput!]
      productImages: [ProductImageInput!]
      sizechart: ID
      status: String
    ): Product!

    updateProduct(
      id: ID!
      name: String
      price: Float
      image: String
      category: String
      brand: ID
      description: String
      stock: Int
      sizes: [String!]
      colours: [String!]
      colourImages: [ColourImageInput!]
      productImages: [ProductImageInput!]
      sizechart: ID
      status: String
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

    brand: async (product) => {
      if (!product.brand) {
        return null;
      }

      const Brand = (await import("../../models/Brand.js")).default;

      return await Brand.findById(product.brand);
    },

    sizechart: async (product) => {
      if (!product.sizechart) {
        return null;
      }

      const Sizechart = (
        await import("../../models/Sizechart.js")
      ).default;

      return await Sizechart.findById(product.sizechart);
    },
  },
};