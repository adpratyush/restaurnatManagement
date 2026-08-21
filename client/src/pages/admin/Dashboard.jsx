import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function Dashboard() {

  const [tables, setTables] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const loadDashboard = async () => {

    try {

      setLoading(true);

      setError("");


      const [
        tablesResponse,
        ordersResponse,
      ] = await Promise.all([
        api.get("/tables"),
        api.get("/orders"),
      ]);


      setTables(
        tablesResponse.data.data || []
      );


      setOrders(
        ordersResponse.data.data || []
      );


    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Unable to load dashboard data."
      );


    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="admin-page">

        <div className="loading-box">

          Loading dashboard...

        </div>

      </div>
    );
  }


  // =====================================================
  // CALCULATIONS
  // =====================================================

  const totalTables =
    tables.length;


  const availableTables =
    tables.filter(
      (table) =>
        table.status ===
        "available"
    ).length;


  const occupiedTables =
    tables.filter(
      (table) =>
        table.status ===
        "occupied"
    ).length;


  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    );


  const completedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "completed"
    );


  const unpaidOrders =
    orders.filter(
      (order) =>
        order.paymentStatus ===
        "unpaid" &&
        order.status !==
        "cancelled"
    );


  const paidOrders =
    orders.filter(
      (order) =>
        order.paymentStatus ===
        "paid"
    );


  const totalSales =
    paidOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );


  const unpaidAmount =
    unpaidOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );


  // =====================================================
  // RECENT ORDERS
  // =====================================================

  const recentOrders =
    [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 8);


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-page">


      {/* =================================================
          HEADER
      ================================================== */}

      <div className="page-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Overview of your restaurant.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={
            loadDashboard
          }
        >
          Refresh
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="error-box">

          {error}

        </div>

      )}


      {/* =================================================
          MAIN STATISTICS
      ================================================== */}

      <div className="stats-grid">


        {/* TOTAL TABLES */}

        <div className="stat-card">

          <div className="stat-icon">
            🪑
          </div>

          <div>

            <p>
              Total Tables
            </p>

            <h2>
              {totalTables}
            </h2>

          </div>

        </div>


        {/* AVAILABLE */}

        <div className="stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>

            <p>
              Available Tables
            </p>

            <h2>
              {availableTables}
            </h2>

          </div>

        </div>


        {/* OCCUPIED */}

        <div className="stat-card">

          <div className="stat-icon">
            🔴
          </div>

          <div>

            <p>
              Occupied Tables
            </p>

            <h2>
              {occupiedTables}
            </h2>

          </div>

        </div>


        {/* PENDING ORDERS */}

        <div className="stat-card">

          <div className="stat-icon">
            🧾
          </div>

          <div>

            <p>
              Pending Orders
            </p>

            <h2>
              {pendingOrders.length}
            </h2>

          </div>

        </div>

      </div>


      {/* =================================================
          SALES STATISTICS
      ================================================== */}

      <div className="stats-grid">


        {/* SALES */}

        <div className="stat-card">

          <div className="stat-icon">
            💰
          </div>

          <div>

            <p>
              Total Collected
            </p>

            <h2>
              Rs.{" "}
              {totalSales.toLocaleString()}
            </h2>

          </div>

        </div>


        {/* UNPAID */}

        <div className="stat-card">

          <div className="stat-icon">
            💵
          </div>

          <div>

            <p>
              Unpaid Amount
            </p>

            <h2>
              Rs.{" "}
              {unpaidAmount.toLocaleString()}
            </h2>

          </div>

        </div>


        {/* COMPLETED */}

        <div className="stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>

            <p>
              Completed Orders
            </p>

            <h2>
              {completedOrders.length}
            </h2>

          </div>

        </div>


        {/* PAID */}

        <div className="stat-card">

          <div className="stat-icon">
            💳
          </div>

          <div>

            <p>
              Paid Orders
            </p>

            <h2>
              {paidOrders.length}
            </h2>

          </div>

        </div>

      </div>


      {/* =================================================
          QUICK ACTIONS
      ================================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Manage your restaurant.
            </p>

          </div>

        </div>


        <div className="quick-actions">


          <Link
            to="/admin/orders"
            className="quick-action-card"
          >

            <span>
              🧾
            </span>

            <strong>
              Orders
            </strong>

            <small>
              Manage customer orders
            </small>

          </Link>


          <Link
            to="/admin/tables"
            className="quick-action-card"
          >

            <span>
              🪑
            </span>

            <strong>
              Tables
            </strong>

            <small>
              Manage restaurant tables
            </small>

          </Link>


          <Link
            to="/admin/billing"
            className="quick-action-card"
          >

            <span>
              💰
            </span>

            <strong>
              Billing
            </strong>

            <small>
              Manage cash payments
            </small>

          </Link>


          <Link
            to="/admin/menu"
            className="quick-action-card"
          >

            <span>
              🍽️
            </span>

            <strong>
              Menu
            </strong>

            <small>
              Manage menu items
            </small>

          </Link>

        </div>

      </div>


      {/* =================================================
          TABLE STATUS
      ================================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Table Status
            </h2>

            <p>
              Current restaurant table
              availability.
            </p>

          </div>

        </div>


        <div className="table-status-grid">

          {tables.map(
            (table) => (

              <div
                className={`table-status-card ${
                  table.status
                }`}
                key={
                  table._id
                }
              >

                <div>

                  <span>
                    Table
                  </span>

                  <strong>
                    {table.tableNumber}
                  </strong>

                </div>


                <span
                  className={`table-status-badge ${
                    table.status
                  }`}
                >
                  {table.status ===
                  "available"
                    ? "Available"
                    : "Occupied"}
                </span>

              </div>

            )
          )}

        </div>

      </div>


      {/* =================================================
          RECENT ORDERS
      ================================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Recent Orders
            </h2>

            <p>
              Latest restaurant orders.
            </p>

          </div>


          <Link
            to="/admin/orders"
            className="section-link"
          >
            View All
          </Link>

        </div>


        {recentOrders.length ===
        0 ? (

          <div className="empty-box">

            <h3>
              No orders yet
            </h3>

            <p>
              Customer orders will
              appear here.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Table
                  </th>

                  <th>
                    Total
                  </th>


                  <th>
                    Payment
                  </th>

                  <th>
                    Date , Time
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentOrders.map(
                  (order) => (

                    <tr
                      key={
                        order._id
                      }
                    >

                      <td>

                        <strong>
                          {
                            order.orderNumber
                          }
                        </strong>

                      </td>


                      <td>

                        Table{" "}

                        {
                          order.tableNumber
                        }

                      </td>


                      <td>

                        <strong>
                          Rs.{" "}

                          {Number(
                            order.total ||
                            0
                          ).toLocaleString()}
                        </strong>

                      </td>




                      <td>

                        <span
                          className={`payment-badge ${
                            order.paymentStatus
                          }`}
                        >
                          {
                            order.paymentStatus
                          }
                        </span>

                      </td>


                      <td>

                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString()
                          : "-"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;