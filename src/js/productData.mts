import type { Product } from "./types.mts";
const baseURL = `${import.meta.env.PUBLIC_SERVER_URL.replace(/\/?$/, "/")}`;

function convertToJson(res: Response) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export async function getProducts(category:string = "tents") {
  const response = await fetch(baseURL + `products?category=${category}`);
  const data = (await convertToJson(response)) as Product[];
  if (!category) return data;
  return data.filter((product) => product.category === category);
}
export async function findProductById(id:string) {
    const response = await fetch(baseURL + `products/${id}`);
    const product = await convertToJson(response) as Product;
    console.log(product)
    return product;
}
