// src/server/routes/api/products.get.ts
import { defineEventHandler, createError, setResponseHeader } from 'h3';
import { connectToDB } from '../../utils/mongoDB';
import { Collection } from 'mongodb';
import { Product } from 'src/app/utils/validators/product.validators';

export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDB();
    const productsCollection = db.collection('products') as Collection<Product>;

    const products = await productsCollection.find({}).toArray();

    setResponseHeader(event, 'Content-Type', 'application/json');
    return products;
  } catch (err: any) {
    console.error('[GET /api/products] DB Error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
