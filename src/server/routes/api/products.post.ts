// src/server/routes/api/products.post.ts
import {
  defineEventHandler,
  readBody,
  createError,
  setResponseHeader,
} from 'h3';
import { connectToDB } from '../../utils/mongoDB';
import {
  Product,
  ProductFilterValidator,
} from '../../../app/utils/validators/product.validators';
import { Collection, Filter } from 'mongodb';

export default defineEventHandler(async (event) => {
  try {
    // 1. Read and destructure body
    const body = await readBody(event);
    const { searchQuery } = body;

    // 2. Validate filters using Zod
    const { type, brand, sort } = ProductFilterValidator.parse(body.filter);

    // 3. Bail early if no filters are selected
    if (type.length === 0 || brand.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
    const productsCollection = db.collection('products') as Collection<Product>;

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

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
