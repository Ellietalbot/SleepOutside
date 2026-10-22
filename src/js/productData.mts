import type { Product } from "./types.mts";
const baseURL = import.meta.env.PUBLIC_SERVER_URL;

function convertToJson(res: Response) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export async function getProducts(category:string) {
  const response = await fetch(baseURL + `?category=${category}`);
  return response;
}

export async function findProductById(id:string) {
    const response = await fetch(baseURL + `products/${id}`);
    const product = await convertToJson(response) as Product;
    console.log(product)
    return product;
}
