import axios from "axios";
import ProductDetailClient from "./ProductDetailClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export async function generateStaticParams() {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/products`);
    const products = res.data;
    // Map each product to its ID for static generation
    return products.map((product) => ({
      id: product._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch products for static generation:", error);
    return [];
  }
}

export default function Page({ params }) {
  const { id } = params;
  return <ProductDetailClient id={id} />;
}
