// src/server/routes/api/query.ts
import { defineEventHandler, getQuery, createError } from 'h3';
import { connectToDB } from '../../utils/mongoDB';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search =
    typeof query['search'] === 'string' ? query['search'].trim() : '';

  try {
    const { db } = await connectToDB();

    const products = await db
      .collection('products')
      .find({
        name: {
          $regex: new RegExp(search, 'i'), // case-insensitive regex
        },
      })
      .toArray();

    if (products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `No products found matching "${search}"`,
      });
    }

    return products;
  } catch (err: any) {
    // If the error is the one we created for 404, re-throw it as is.
    if (err.statusCode === 404) {
      throw err;
    }
    // Otherwise, log and throw a generic 500 error.
    console.error('[GET /api/query] DB error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
