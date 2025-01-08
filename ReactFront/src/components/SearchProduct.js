import Header from "./Header";
import { useState } from 'react';
import { Card, CardGroup } from 'react-bootstrap';

function SearchProduct() {
    const [data, setData] = useState([]);

    async function search(key) {
        // Clear the products if the search input is empty
        if (key.trim() === "") {
            setData([]); // Clear the product list
            return; // Don't continue the fetch operation
        }

        let result = await fetch(`http://127.0.0.1:8000/api/search/${key}`);
        result = await result.json();

        setData(result);
    }

    return (
        <>
            <Header />
            <div className="container mt-3">
                <h1>Search Product</h1>
                <br />
                <input
                    type='text'
                    onChange={(e) => search(e.target.value)}
                    className='form-control'
                    placeholder='Search for a product'
                />
                <CardGroup className="mt-3">
                    {data.length === 0 ? (
                        <p>No products to display</p>
                    ) : (
                        data.map((item) => (
                            <Card key={item.id} className="mb-3" style={{ width: '18rem', margin: '10px' }}>
                                <Card.Img
                                    variant="top"
                                    src={`http://localhost:8000/storage/${item.file_path}`}
                                    alt={item.name}
                                    style={{ height: '150px', objectFit: 'contain' }} // Image size and scaling
                                />
                                <Card.Body>
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>{item.description}</Card.Text>
                                    <Card.Text>
                                        <strong>Price:</strong> ${item.price}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </CardGroup>
            </div>
        </>
    );
}

export default SearchProduct;
