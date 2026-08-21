import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function Cart({
  cart,
  setCart,
}) {
  const { tableNumber } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item._id !== id
      )
    );
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0) {
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      // Find the table using table number
      const tablesResponse =
        await api.get("/tables");

      const table = tablesResponse.data.data.find(
        (table) =>
          String(table.tableNumber) ===
          String(tableNumber)
      );

      if (!table) {
        throw new Error("Table not found");
      }

      const orderData = {
        tableId: table._id,

        items: cart.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
        })),

        notes,
      };

      const response = await api.post(
        "/orders",
        orderData
      );

      const order = response.data.data;

      // Clear cart
      setCart([]);

      // Go to confirmation
      navigate(
        `/order-confirmation/${order._id}`
      );

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>

        <button
          onClick={() =>
            navigate(
              `/menu/table/${tableNumber}`
            )
          }
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-header">

        <button
          onClick={() =>
            navigate(
              `/menu/table/${tableNumber}`
            )
          }
        >
          ← Back to Menu
        </button>

        <h1>Your Order</h1>

        <p>
          Table {tableNumber}
        </p>

      </div>


      {/* ITEMS */}

      <div className="cart-items">

        {cart.map((item) => (

          <div
            className="cart-item"
            key={item._id}
          >

            <div className="cart-item-info">

              <h3>
                {item.name}
              </h3>

              <p>
                Rs. {item.price}
              </p>

            </div>


            <div className="cart-item-actions">

              <div className="quantity-controls">

                <button
                  onClick={() =>
                    decreaseQuantity(
                      item._id
                    )
                  }
                >
                  <Minus size={16} />
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity(
                      item._id
                    )
                  }
                >
                  <Plus size={16} />
                </button>

              </div>

              <strong>
                Rs.{" "}
                {item.price *
                  item.quantity}
              </strong>

              <button
                className="delete-button"
                onClick={() =>
                  removeItem(item._id)
                }
              >
                <Trash2 size={18} />
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* NOTES */}

      <div className="order-notes">

        <label>
          Special instructions
        </label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Example: Less spicy, no onions..."
        />

      </div>


      {/* BILL */}

      <div className="cart-summary">

        <div>
          <span>Subtotal</span>

          <strong>
            Rs. {subtotal}
          </strong>
        </div>

        <div>
          <span>Total</span>

          <strong>
            Rs. {subtotal}
          </strong>
        </div>

      </div>


      {error && (
        <div className="cart-error">
          {error}
        </div>
      )}


      <button
        className="place-order-button"
        onClick={placeOrder}
        disabled={placingOrder}
      >
        {placingOrder
          ? "Placing Order..."
          : `PLACE ORDER • Rs. ${subtotal}`}
      </button>

    </div>
  );
}

export default Cart;