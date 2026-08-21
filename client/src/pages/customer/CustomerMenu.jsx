import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import api from "../../services/api";
import MenuItemCard from "../../components/customer/MenuItemCard";
import LocationGuard from "../../components/customer/LocationGuard";

function CustomerMenuContent({ cart, setCart }) {
  const { tableNumber } = useParams();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Fetch menu items and categories
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [menuResponse, categoryResponse] =
          await Promise.all([
            api.get("/menu-items/available"),
            api.get("/categories"),
          ]);

        setMenuItems(menuResponse.data.data || []);
        setCategories(categoryResponse.data.data || []);
      } catch (err) {
        console.error("Error loading menu:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load menu. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /*
   * Add item to cart
   */
  const addToCart = (item) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  /*
   * Number of items in cart
   */
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  /*
   * Total cart price
   */
  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  /*
   * Filter menu items by category
   */
  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => {
          const categoryId =
            typeof item.category === "object"
              ? item.category?._id
              : item.category;

          return categoryId === selectedCategory;
        });

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="page-center">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="page-center">
        <div className="error-container">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">

      {/* =========================
          HEADER
      ========================== */}

      <header className="customer-header">

        <div className="restaurant-info">

          <h1>Our Restaurant</h1>

          <p>
            Table {tableNumber}
          </p>

        </div>

        <button
          className="cart-button"
          onClick={() =>
            navigate(`/cart/table/${tableNumber}`)
          }
        >
          <ShoppingCart size={20} />

          <span>
            Cart ({cartCount})
          </span>
        </button>

      </header>


      {/* =========================
          CATEGORY NAVIGATION
      ========================== */}

      <div className="category-container">

        <button
          className={
            selectedCategory === "all"
              ? "category-button active"
              : "category-button"
          }
          onClick={() =>
            setSelectedCategory("all")
          }
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            className={
              selectedCategory === category._id
                ? "category-button active"
                : "category-button"
            }
            onClick={() =>
              setSelectedCategory(category._id)
            }
          >
            {category.name}
          </button>
        ))}

      </div>


      {/* =========================
          MENU
      ========================== */}

      <main className="menu-container">

        <div className="menu-heading">

          <h2>
            {selectedCategory === "all"
              ? "Our Menu"
              : categories.find(
                  (category) =>
                    category._id === selectedCategory
                )?.name || "Menu"}
          </h2>

          <p>
            Choose your favorite dishes
          </p>

        </div>


        {filteredItems.length === 0 ? (

          <div className="empty-menu">

            <h3>
              No items available
            </h3>

            <p>
              There are currently no items
              available in this category.
            </p>

          </div>

        ) : (

          <div className="menu-items-grid">

            {filteredItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onAdd={addToCart}
              />
            ))}

          </div>

        )}

      </main>


      {/* =========================
          CART BOTTOM BAR
      ========================== */}

      {cartCount > 0 && (

        <div className="cart-bar">

          <div className="cart-bar-info">

            <strong>
              {cartCount}{" "}
              {cartCount === 1
                ? "item"
                : "items"}
            </strong>

            <span>
              Rs. {cartTotal}
            </span>

          </div>

          <button
            onClick={() =>
              navigate(
                `/cart/table/${tableNumber}`
              )
            }
          >
            <ShoppingCart size={20} />

            View Cart
          </button>

        </div>

      )}

    </div>
  );
}


/*
 * Customer Menu
 *
 * The LocationGuard checks the customer's
 * location before allowing the menu to open.
 */
function CustomerMenu({ cart, setCart }) {
  return (
    <LocationGuard>
      <CustomerMenuContent
        cart={cart}
        setCart={setCart}
      />
    </LocationGuard>
  );
}

export default CustomerMenu;