import Header from './Header';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function UpdateProduct() {
    const location = useLocation(); 
    const [data, setData] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await fetch(`http://localhost:8000/api/product/${location.state.id}`);
                const data = await result.json();
                setData(data);
                setName(data.name);
                setPrice(data.price);
                setDescription(data.description);
                setImageUrl(`http://localhost:8000/${data.file_path}`);
            } catch (error) {
                console.error("Error fetching product ", error);
            }
        }
        fetchData();
    }, [location.state.id]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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
            const response = await fetch(`http://localhost:8000/api/product/${location.state.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                console.log('Product updated successfully!');
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
            <div className="container">
                <h1>Update Product</h1>
                <form onSubmit={handleSubmit}>
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)} /> <br /><br />
                    <input type='text' value={price} onChange={(e) => setPrice(e.target.value)} /> <br /><br />
                    <input type='text' value={description} onChange={(e) => setDescription(e.target.value)} /> <br /><br />
                    <input type='file' onChange={handleFileChange} /> <br /><br />
                    <img style={{ width: 100 }} src={imageUrl} alt='product' /> <br /><br />
                    <button type="submit">Update Product</button>
                </form>
            </div>
        </>
    );
}

export default UpdateProduct;
