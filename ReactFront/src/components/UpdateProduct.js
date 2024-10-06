import Header from './Header';
import {useLocation} from 'react-router-dom';
import {useState,useEffect} from 'react';


    function UpdateProduct(){

        const location = useLocation(); 
        const [data, setData]= useState([]);

       

        useEffect(() => {
        async function fetchData() {
        // You can await here
        let result = await fetch('http://localhost:8000/api/product/'+location.state.id);
        // ...
        result = await result.json()
        setData(result);
        }
        fetchData();
        },); 
        // [location.state.id]

        console.warn('props',location.state.id);

        // console.log(location.state.id);
        console.log("the log works");
        return(   
            <>
            <Header />
            <div className="container">
                <h1>Update Product</h1>
                <input type='text' defaultValue={data.name}></input> <br/><br/>
                <input type='text' defaultValue={data.price}></input> <br/><br/>
                <input type='text' defaultValue={data.description}></input> <br/><br/>
                <input type='file' defaultValue={data.file_path}></input> <br/><br/>
                <input type='text' defaultValue={data.file_path}></input> <br/><br/>

                <img style={{width:100}} src={'http://localhost:8000/'+data.file_path} alt='product'/> <br/><br/>

                <button>Update product</button>
            </div>  
            </>

        )

    }

    
    export default UpdateProduct;
  
