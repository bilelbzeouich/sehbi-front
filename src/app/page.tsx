"use client"
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Define interfaces for product and API responses
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface NewProduct {
  name: string;
  description: string;
  price: string | number;
}

// Configuration for API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Product Service - Handles all API interactions
const ProductService = {
  // Fetch all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Add a new product
  addProduct: async (productData: NewProduct): Promise<Product> => {
    try {
      const response = await axios.post<Product>(`${API_BASE_URL}/products`, productData);
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (id: number, productData: NewProduct): Promise<Product> => {
    try {
      const response = await axios.put<Product>(`${API_BASE_URL}/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Trace a product
  traceProduct: async (productId: number, clientEmail: string): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/trace`, {
        product_id: productId,
        client_email: clientEmail,
      });
    } catch (error) {
      console.error('Error tracing product:', error);
      throw error;
    }
  },
};

// Product Management Component
const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); 
  const [newProduct, setNewProduct] = useState<NewProduct>({ name: '', description: '', price: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [traceEmail, setTraceEmail] = useState<string>('');

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await ProductService.getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        alert('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  // Handle form submission for adding/editing products
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update existing product
        await ProductService.updateProduct(editingProduct.id, newProduct);
      } else {
        // Add new product
        await ProductService.addProduct(newProduct);
      }

      // Refresh product list
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);

      // Reset form
      setNewProduct({ name: '', description: '', price: '' });
      setEditingProduct(null);
    } catch (error) {
      alert('Operation failed');
    }
  };

  // Start editing a product
  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
    });
  };

  // Delete a product
  const handleDelete = async (id: number) => {
    try {
      await ProductService.deleteProduct(id);
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  // Trace a product
  const handleTraceProduct = async (productId: number) => {
    if (!traceEmail) {
      alert('Please enter an email');
      return;
    }
    try {
      await ProductService.traceProduct(productId, traceEmail);
      alert('Product traced successfully');
      setTraceEmail('');
    } catch (error) {
      alert('Failed to trace product');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <Link href="client">client</Link>
      {/* Product Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 mr-2 bg-black text-white"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          className="border p-2 mr-2 bg-black text-white"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="border p-2 mr-2 bg-black text-white"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {/* Product List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Product List</h2>
        {products.map((product) => (
          <div key={product.id} className="border p-3 mb-2 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
            </div>
            <div>
              <button
                onClick={() => startEditing(product)}
                className="bg-yellow-500 text-white p-2 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white p-2 mr-2"
              >
                Delete
              </button>
              <div className="mt-2">
                <input
                  type="email"
                  placeholder="Email to trace"
                  value={traceEmail}
                  onChange={(e) => setTraceEmail(e.target.value)}
                  className="border p-1 mr-2 bg-black text-white"
                />
                <button
                  onClick={() => handleTraceProduct(product.id)}
                  className="bg-green-500 text-white p-2"
                >
                  Trace Product
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
