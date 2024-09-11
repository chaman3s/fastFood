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
      const response = await fetch("http://localhost:5000/api/auth/myOrderData", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setOrderData(data.orderData);
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
          {orderData.length > 0 ? (
            orderData.map((order, index) => (
              <div key={index} className="w-100">
                {order.slice(0).reverse().map((item, idx) => (
                  <React.Fragment key={idx}>
                    {item[0].Order_date ? (
                      <div className="m-auto mt-5">
                        <h5>Order Date: {new Date(item[0].Order_date).toLocaleDateString()}</h5>
                        <hr />
                      </div>
                    ) : (
                      item.map((arrayData, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-lg-3">
                          <div className="card mt-3" style={{ width: '16rem', maxHeight: '360px' }}>
                            <img
                              src={arrayData.img}
                              className="card-img-top"
                              alt={arrayData.name}
                              style={{ height: '120px', objectFit: 'fill' }}
                            />
                            <div className="card-body">
                              <h5 className="card-title">{arrayData.name}</h5>
                              <div className="container w-100 p-0" style={{ height: '38px' }}>
                                <span className="m-1">Qty: {arrayData.qty}</span>
                                <span className="m-1">Size: {arrayData.size}</span>
                                <span className="d-inline ms-2 h-100 w-20 fs-5">₹{arrayData.price}/-</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </React.Fragment>
                ))}
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
