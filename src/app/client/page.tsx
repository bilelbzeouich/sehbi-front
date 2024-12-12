"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Configuration for API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Define types for product and trace data
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

const ProductTraceList: React.FC = () => {
  // State for products and tracing
  const [products, setProducts] = useState<Product[]>([]);
  const [traceEmail, setTraceEmail] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Handle tracing a product
  const handleTraceProduct = async (productId: number) => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!traceEmail) {
      alert('Please enter an email address');
      return;
    }
    if (!emailRegex.test(traceEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/trace`, {
        product_id: productId,
        client_email: traceEmail,
      });

      alert('Product traced successfully!');
      // Clear the email input after successful trace
      setTraceEmail('');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error tracing product:', error);
      alert('Failed to trace product');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Catalog</h1>
      <Link href="/">Back</Link>
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-green-600">${product.price}</span>
              <button
                onClick={() => setSelectedProduct(product.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                Trace Product
              </button>
            </div>

            {/* Trace Input for this specific product */}
            {selectedProduct === product.id && (
              <div className="mt-4 border-t pt-4">
                <input
                  type="email"
                  placeholder="Enter your email to trace"
                  value={traceEmail}
                  onChange={(e) => setTraceEmail(e.target.value)}
                  className="w-full p-2 border rounded mb-2 text-black"
                />
                <button
                  onClick={() => handleTraceProduct(product.id)}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                >
                  Confirm Trace
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full bg-gray-200 text-gray-700 p-2 rounded mt-2 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No products available at the moment.
        </div>
      )}
    </div>
  );
};

export default ProductTraceList;
