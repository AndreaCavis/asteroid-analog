// src/app/utils/fake-api.ts
export async function fakeFetchProducts(query: string): Promise<any[]> {
  await new Promise((r) => setTimeout(r, 800)); // Simulate delay

  const allProducts = [
    { name: 'Vitamin D', description: 'Supports immune health' },
    { name: 'Omega 3', description: 'Promotes heart health' },
    { name: 'Magnesium', description: 'Aids muscle recovery' },
    { name: 'Zinc', description: 'Boosts immunity' },
    { name: 'Probiotic', description: 'Supports gut health' },
  ];

  return allProducts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
}
