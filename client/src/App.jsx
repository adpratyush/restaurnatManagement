import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Customer pages
import CustomerMenu from "./pages/customer/CustomerMenu";
import Cart from "./pages/customer/Cart";
import OrderConfirmation from "./pages/customer/OrderConfirmation";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import Tables from "./pages/admin/Tables";
import Orders from "./pages/admin/Orders";
import Billing from "./pages/admin/Billing";
import MenuManagement from "./pages/admin/MenuManagement";

function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Restaurant Management System</h1>

      <p>
        Welcome to the restaurant management system
      </p>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <a href="/youdontknow">
          Admin Dashboard
        </a>

        <a href="/menu/table/1">
          Customer Menu
        </a>
      </div>
    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);

  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            HOME
        ====================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =====================================
            CUSTOMER
        ====================================== */}

        <Route
          path="/menu/table/:tableNumber"
          element={
            <CustomerMenu
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route
          path="/cart/table/:tableNumber"
          element={
            <Cart
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route
          path="/order-confirmation/:orderId"
          element={
            <OrderConfirmation />
          }
        />


        {/* =====================================
            ADMIN
        ====================================== */}

        <Route
          path="/youdontknow"
          element={
            <Dashboard />
          }
        />

        <Route
          path="/youdontknow/tables"
          element={
            <Tables />
          }
        />

        <Route
          path="/youdontknow/orders"
          element={
            <Orders />
          }
        />

        <Route
          path="/youdontknow/billing"
          element={
            <Billing />
          }
        />

        <Route
          path="/youdontknow/menu"
          element={
            <MenuManagement />
          }
        />


        {/* =====================================
            404
        ====================================== */}

        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <h1>404</h1>

              <p>
                Page not found
              </p>

              <a href="/">
                Go Home
              </a>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;