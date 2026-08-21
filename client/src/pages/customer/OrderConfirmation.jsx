import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function OrderConfirmation() {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/orders/${orderId}`
        );

        setOrder(response.data.data);
      } catch (err) {
        console.error("Error fetching order:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="page-center">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-center">
        <div className="error-container">

          <h2>
            Order Not Found
          </h2>

          <p>
            {error ||
              "We couldn't find this order."}
          </p>

          <button
            className="retry-button"
            onClick={() =>
              navigate("/")
            }
          >
            Go Home
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">

      <div className="confirmation-card">

        {/* Success icon */}

        <div className="success-icon">
          ✓
        </div>


        {/* Title */}

        <h1>
          Order Placed!
        </h1>

        <p>
          Your order has been sent
          to the restaurant.
        </p>


        {/* Order number */}

        <div className="order-number">

          <span>
            Order Number
          </span>

          <strong>
            {order.orderNumber ||
              order._id}
          </strong>

        </div>


        {/* Table */}

        <div className="confirmation-table">

          <span>
            Table
          </span>

          <strong>
            {order.tableNumber ||
              order.table?.tableNumber ||
              "—"}
          </strong>

        </div>


        {/* Payment */}

        <div className="confirmation-status">

          <span>
            Payment
          </span>

          <strong>
            UNPAID
          </strong>

        </div>


        {/* Total */}

        <div className="confirmation-total">

          <span>
            Total
          </span>

          <strong>
            Rs.{" "}
            {order.total || 0}
          </strong>

        </div>


        {/* Payment information */}

        <div className="payment-message">

          <strong>
            Please pay at the counter
          </strong>

          <p>
            Payment will be collected
            by restaurant staff.
          </p>

        </div>


        {/* Back to menu */}

        <button
          onClick={() =>
            navigate(
              `/menu/table/${
                order.tableNumber ||
                order.table?.tableNumber
              }`
            )
          }
        >
          Back to Menu
        </button>

      </div>

    </div>
  );
}

export default OrderConfirmation;