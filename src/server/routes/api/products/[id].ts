// src/server/routes/api/products/[id].ts
import {
  defineEventHandler,
  getRouterParam,
  createError,
  setResponseHeader,
} from 'h3';
import { connectToDB } from '../../../utils/mongoDB';

export default defineEventHandler(async (event) => {
  const productID = getRouterParam(event, 'id');

  if (!productID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing product ID',
    });
  }

  try {
    const { db } = await connectToDB();

    const product = await db.collection('products').findOne({ id: productID });

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: `Product with ID "${productID}" not found`,
      });
    }

    setResponseHeader(event, 'Content-Type', 'application/json');

    return product;
  } catch (error: any) {
    console.error(`[GET /api/products/${productID}] DB Error:`, error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
