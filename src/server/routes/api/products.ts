import {
  defineEventHandler,
  readBody,
  createError,
  setResponseHeader,
  isMethod,
} from 'h3';
import { connectToDB } from '../../utils/mongoDB';
import {
  Product,
  ProductFilterValidator,
} from '../../../app/utils/validators/product.validators';
import { Collection, Filter } from 'mongodb';

export default defineEventHandler(async (event) => {
  if (isMethod(event, 'POST')) {
    try {
      // 1. Read and destructure body
      const body = await readBody(event);
      const { searchQuery } = body;

      // 2. Validate filters using Zod
      const { type, brand, sort } = ProductFilterValidator.parse(body.filter);

      // 3. Bail early if no filters are selected
      if (type.length === 0 || brand.length === 0) {
        // Ensure we set headers for this response too
        setResponseHeader(event, 'Content-Type', 'application/json');
        return []; // Return empty array directly for 200 OK
      }

      const mongoFilter: Filter<Product> = {
        type: { $in: type },
        brand: { $in: brand },
      };

      // Add fuzzy search if provided
      if (
        searchQuery &&
        typeof searchQuery === 'string' &&
        searchQuery.trim() !== ''
      ) {
        mongoFilter['name'] = {
          $regex: new RegExp(searchQuery.trim(), 'i'),
        };
      }

      // 🔀 5. Handle sorting
      const sortOption: Record<string, 1 | -1> = {};
      if (sort === 'price-asc') sortOption['price'] = 1;
      if (sort === 'price-desc') sortOption['price'] = -1;

      // ⚡ 6. Query DB
      const { db } = await connectToDB();
      const productsCollection = db.collection(
        'products'
      ) as Collection<Product>;

      const products = await productsCollection
        .find(mongoFilter)
        .sort(sortOption)
        .limit(100)
        .toArray();

      // 📤 7. Return results as JSON
      setResponseHeader(event, 'Content-Type', 'application/json');
      return products;
    } catch (err: any) {
      console.error('[POST /api/products] Filter/Query Error:', err);

      // Check if it's a Zod validation error
      if (err.name === 'ZodError') {
        throw createError({
          statusCode: 400, // Bad Request
          statusMessage: 'Invalid filter payload',
          data: err.errors,
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  }

  // If not POST, or any other method, return Method Not Allowed
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
  });
});
