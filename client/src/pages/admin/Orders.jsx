import { useEffect, useState } from "react";
import api from "../../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

      setOrders(response.data.data || []);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="page-header">

        <div>
          <h1>Orders</h1>

          <p>
            View and manage restaurant orders
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="refresh-button"
        >
          Refresh
        </button>

      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {orders.length === 0 ? (

        <div className="empty-box">

          <h3>
            No orders found
          </h3>

          <p>
            Customer orders will appear here.
          </p>

        </div>

      ) : (

        <div className="orders-grid">

          {orders.map((order) => (

            <div
              key={order._id}
              className="order-card"
            >

              <div className="order-header">

                <div>

                  <small>
                    TABLE
                  </small>

                  <h2>
                    {order.tableNumber}
                  </h2>

                </div>

                <span>
                  {order.status}
                </span>

              </div>

              <div className="order-number">
                {order.orderNumber}
              </div>

              <div className="order-items">

                {order.items.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="order-item"
                    >

                      <span>
                        {item.name} ×{" "}
                        {item.quantity}
                      </span>

                      <strong>
                        Rs. {item.total}
                      </strong>

                    </div>

                  )
                )}

              </div>

              <div className="order-total">

                <strong>
                  Total
                </strong>

                <strong>
                  Rs. {order.total}
                </strong>

              </div>

              <div
                style={{
                  padding: "15px",
                }}
              >

                <p>
                  Payment:{" "}
                  <strong>
                    {order.paymentStatus}
                  </strong>
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Orders;