import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';


export default function MyOrder() {
  const [orderData, setOrderData] = useState([]);

  const fetchMyOrder = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      console.error('User email not found in localStorage');
      return;
    }

    try {
      const response = await fetch("https://fast-food-zeta-hazel.vercel.app/api/food/myOrderData", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("myorder:", data);
      setOrderData(data.orderData);
      console.log("order",orderData);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  useEffect(() => {
    fetchMyOrder();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="row">
         
          {orderData.length > 0 ?  (
           
            orderData.map((order, index) => (
              <div key={index} className="w-100">
                {/* Display the order date */}
                {console.log("ok",)}
                <div className="m-auto mt-5">
                  {console.log("check",order)}
                  <h5>Order Date: {new Date(order.Order_date).toLocaleDateString()}</h5>
                  <hr />
                </div>

                {/* Display the order items */}
                <div className="row">
                
                  {console.log("oklength", Object.keys(order).length)}
                  {
                    Object.values(order).map((item, idx) =>  (
                     idx < Object.values(order).length - 1 ? (
                      <div key={idx} className="col-12 col-md-6 col-lg-3">
                        <div className="card mt-3" style={{ width: '16rem', maxHeight: '360px' }}>
                          <img
                            src={item.img || 'defaultImageURL'} // Use item.img or provide a default image URL
                            className="card-img-top"
                            alt={item.name}
                            style={{ height: '120px', objectFit: 'fill' }}
                          />
                          <div className="card-body">
                            <h5 className="card-title">{item.name}</h5>
                            <div className="container w-100 p-0" style={{ height: '38px' }}>
                              <span className="m-1">Qty: {item.qty}</span>
                              <span className="m-1">Size: {item.size}</span>
                              <span className="d-inline ms-2 h-100 w-20 fs-5">₹{item.price}/-</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                    ))}
                  
                </div>
              </div>
            ))
          ) : (
            <div>No orders found.</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
