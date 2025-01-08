import Header from './Header';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import './App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProductList() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]); // Cart state

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8000/api/list');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const addToCart = (product) => {
        setCart((prevCart) => {
            // Check if product already exists in cart
            const exists = prevCart.find((item) => item.id === product.id);
            if (exists) {
                // Update quantity if it exists
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Add new product with quantity
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
        alert(`Product "${product.name}" added to cart!`);
    };

    if (isLoading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5">Error: {error}</div>;
    if (data.length === 0) return <div className="text-center mt-5">No products available.</div>;

    return (
        <div className="container mt-4">
            {/* Pass cart count to Header */}
            <Header cartCount={cart.length} cart={cart}/>
            <h4 className="text-center mb-4">Products Listed Here</h4>
            <div className="row">
                {data.map((dataitem) => (
                    <div className="col-md-4 mb-4" key={dataitem.id}>
                        <div className="card shadow-sm">
                            <img
                                className="card-img-top"
                                src={`http://localhost:8000/storage/${dataitem.file_path}`}
                                alt={dataitem.name}
                                style={{ height: '200px', objectFit: 'contain', width: '100%' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{dataitem.name}</h5>
                                <p className="card-text">{dataitem.description}</p>
                                <p className="card-text">
                                    <strong>${dataitem.price}</strong>
                                </p>
                                <Button
                                    onClick={() => addToCart(dataitem)} // Pass the entire product
                                    variant="success"
                                    className="w-100"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
