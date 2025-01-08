import Header from './Header';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function UpdateProduct() {
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [productId, setProductId] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/list');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleProductChange = (e) => {
    setProductId(e.target.value);
    const selectedProduct = data.find((product) => product.id === parseInt(e.target.value));
    setName(selectedProduct.name);
    setPrice(selectedProduct.price);
    setDescription(selectedProduct.description);
    setImageUrl(`http://localhost:8000/storage/${selectedProduct.file_path}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }
  
    try {
      const response = await axios.put(`http://localhost:8000/api/product/${productId}`, formData);
      if (response.status === 200) {
        console.log('Product updated successfully!');
        window.location.reload(); // Reload the page after update
      } else {
        console.error('Error updating product:', response.status);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <>
      <Header />
      <div className="container mt-3">
        <h3 className="text-center mb-3">Update Product</h3>
        <form onSubmit={handleSubmit} className="border p-3 rounded shadow mx-auto mb-4" style={{ maxWidth: '400px' }}>
          <div className="mb-3">
            <label htmlFor="product-select" className="form-label">Select Product</label>
            <select
              id="product-select"
              className="form-select"
              value={productId}
              onChange={handleProductChange}
            >
              <option value="">Select a product</option>
              {data.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="product-name" className="form-label">Product Name</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="product-price" className="form-label">Price</label>
            <input
              id="product-price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-control"
              placeholder="Enter price"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="product-description" className="form-label">Description</label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder="Enter description"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="product-file" className="form-label">Upload Image</label>
            <input
              id="product-file"
              type="file"
              onChange={handleFileChange}
              className="form-control"
            />
          </div>
          {imageUrl && <img className="img-thumbnail mb-3" src={imageUrl} alt="product" />}
          <button type="submit" className="btn btn-primary w-100">Update Product</button>
        </form>
      </div>
    </>
  );
}

export default UpdateProduct;
