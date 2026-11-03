import type { Product } from "./types.mts";
const baseURL = `${import.meta.env.PUBLIC_SERVER_URL.replace(/\/?$/, "/")}`;

async function convertToJson(res: Response): Promise<unknown> {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`Request failed with status ${res.status}`);
  }
}

function asProductList(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data as Product[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray(data.results)
  ) {
    return data.results as Product[];
  }

  throw new Error("The products API returned an unexpected response.");
}

export async function getProducts(category: string = "tents") {
  const response = await fetch(
    baseURL + `products?category=${encodeURIComponent(category)}`
  );
  const data = asProductList(await convertToJson(response));
  if (!category) return data;
  return data.filter((product) => product.category === category);
}

export async function findProductById(id: string) {
  const response = await fetch(baseURL + `products/${encodeURIComponent(id)}`);
  const product = (await convertToJson(response)) as Product;
  return product;
}
