import { useEffect, useState } from "react";
import api from "../../services/api";

function Billing() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [payingId, setPayingId] =
    useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);


  // =================================================
  // LOAD ORDERS
  // =================================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/orders");

      setOrders(
        response.data.data || []
      );

    } catch (error) {
      console.error(
        "Billing load error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load billing data."
      );

    } finally {
      setLoading(false);
    }
  };


  // =================================================
  // LOAD WHEN PAGE OPENS
  // =================================================

  useEffect(() => {
    loadOrders();
  }, []);


  // =================================================
  // MARK AS PAID
  // =================================================

  const markAsPaid = async (orderId) => {

    const confirmPayment =
      window.confirm(
        "Confirm that you received the cash payment for this order?"
      );


    if (!confirmPayment) {
      return;
    }


    try {

      setPayingId(orderId);


      await api.patch(
        `/payments/${orderId}/pay`
      );


      setSelectedOrder(null);


      await loadOrders();


      alert(
        "Payment recorded successfully."
      );


    } catch (error) {

      console.error(
        "Payment error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to record payment."
      );

    } finally {

      setPayingId(null);
    }
  };


  // =================================================
  // LOADING
  // =================================================

  if (loading) {

    return (
      <div className="admin-page">

        <div className="loading-box">
          Loading billing...
        </div>

      </div>
    );
  }


  // =================================================
  // FILTER ORDERS
  // =================================================

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


  // =================================================
  // TOTALS
  // =================================================

  const unpaidAmount =
    unpaidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );


  const paidAmount =
    paidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );


  // =================================================
  // PAGE
  // =================================================

  return (
    <div className="admin-page">


      {/* ===========================================
          HEADER
      ============================================ */}

      <div className="page-header">

        <div>

          <h1>
            Billing
          </h1>

          <p>
            Manage restaurant bills and
            cash payments.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={loadOrders}
        >
          Refresh
        </button>

      </div>


      {/* ===========================================
          ERROR
      ============================================ */}

      {error && (

        <div className="error-box">
          {error}
        </div>

      )}


      {/* ===========================================
          BILLING STATISTICS
      ============================================ */}

      <div className="stats-grid">


        <div className="stat-card">

          <div className="stat-icon">
            💵
          </div>

          <div>

            <p>
              Unpaid Bills
            </p>

            <h2>
              {unpaidOrders.length}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🧾
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


        <div className="stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>

            <p>
              Paid Bills
            </p>

            <h2>
              {paidOrders.length}
            </h2>

          </div>

        </div>


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
              {paidAmount.toLocaleString()}
            </h2>

          </div>

        </div>

      </div>


      {/* ===========================================
          UNPAID BILLS
      ============================================ */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Unpaid Bills
            </h2>

            <p>
              Cash payments waiting to be
              collected.
            </p>

          </div>

        </div>


        {unpaidOrders.length === 0 ? (

          <div className="empty-box">

            <h3>
              No unpaid bills
            </h3>

            <p>
              All current bills have been
              paid.
            </p>

          </div>

        ) : (

          <div className="orders-grid">

            {unpaidOrders.map(
              (order) => (

                <div
                  className="order-card"
                  key={order._id}
                >


                  {/* ==========================
                      HEADER
                  =========================== */}

                  <div className="order-header">

                    <div>

                      <small>
                        TABLE
                      </small>

                      <h2>
                        {order.tableNumber}
                      </h2>

                    </div>


                    <span
                      className="payment-status unpaid"
                    >
                      UNPAID
                    </span>

                  </div>


                  {/* ==========================
                      ORDER NUMBER
                  =========================== */}

                  <div className="order-number">

                    <strong>
                      {order.orderNumber}
                    </strong>

                    <br />

                    <span>
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </span>

                  </div>


                  {/* ==========================
                      ITEMS
                  =========================== */}

                  <div className="order-items">

                    {order.items?.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="order-item"
                          key={
                            `${item.menuItem}-${index}`
                          }
                        >

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <div>
                              {
                                item.quantity
                              }{" "}
                              × Rs.{" "}
                              {Number(
                                item.price
                              ).toLocaleString()}
                            </div>

                          </div>


                          <strong>
                            Rs.{" "}
                            {Number(
                              item.total
                            ).toLocaleString()}
                          </strong>

                        </div>

                      )
                    )}

                  </div>


                  {/* ==========================
                      TOTAL
                  =========================== */}

                  <div className="order-total">

                    <span>
                      Total Bill
                    </span>

                    <strong>
                      Rs.{" "}
                      {Number(
                        order.total
                      ).toLocaleString()}
                    </strong>

                  </div>


                  {/* ==========================
                      PAYMENT METHOD
                  =========================== */}

                  <div
                    style={{
                      padding:
                        "12px 20px",

                      borderBottom:
                        "1px solid #e5e7eb",

                      display:
                        "flex",

                      justifyContent:
                        "space-between",
                    }}
                  >

                    <span>
                      Payment Method
                    </span>

                    <strong>
                      Cash
                    </strong>

                  </div>


                  {/* ==========================
                      ACTIONS
                  =========================== */}

                  <div
                    style={{
                      padding:
                        "15px 20px",
                    }}
                  >

                    <button
                      className="pay-button"
                      disabled={
                        payingId ===
                        order._id
                      }
                      onClick={() =>
                        markAsPaid(
                          order._id
                        )
                      }
                    >

                      {payingId ===
                      order._id
                        ? "Processing..."
                        : "Mark as Paid"}

                    </button>


                    <button
                      onClick={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                      style={{
                        width:
                          "100%",

                        marginTop:
                          "10px",

                        padding:
                          "11px",

                        border:
                          "1px solid #d1d5db",

                        borderRadius:
                          "8px",

                        background:
                          "white",

                        cursor:
                          "pointer",

                        fontWeight:
                          "600",
                      }}
                    >
                      View Bill
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ===========================================
          PAID BILLS
      ============================================ */}

      <div
        className="dashboard-section"
        style={{
          marginTop:
            "30px",
        }}
      >

        <div className="section-header">

          <div>

            <h2>
              Paid Bills
            </h2>

            <p>
              Recently completed cash
              payments.
            </p>

          </div>

        </div>


        {paidOrders.length === 0 ? (

          <div className="empty-box">

            <p>
              No paid bills yet.
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
                    Method
                  </th>

                  <th>
                    Paid At
                  </th>

                </tr>

              </thead>


              <tbody>

                {paidOrders.map(
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
                            order.total
                          ).toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        Cash
                      </td>

                      <td>
                        {order.paidAt
                          ? new Date(
                              order.paidAt
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


      {/* ===========================================
          BILL MODAL
      ============================================ */}

      {selectedOrder && (

        <div
          style={{
            position:
              "fixed",

            inset:
              "0",

            background:
              "rgba(0, 0, 0, 0.5)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            zIndex:
              "1000",

            padding:
              "20px",
          }}
        >

          <div
            style={{
              background:
                "white",

              borderRadius:
                "12px",

              width:
                "100%",

              maxWidth:
                "500px",

              maxHeight:
                "90vh",

              overflowY:
                "auto",

              padding:
                "25px",
            }}
          >

            {/* ==============================
                BILL HEADER
            =============================== */}

            <div
              style={{
                textAlign:
                  "center",

                borderBottom:
                  "1px dashed #d1d5db",

                paddingBottom:
                  "20px",

                marginBottom:
                  "20px",
              }}
            >

              <h2>
                Restaurant Bill
              </h2>

              <p>
                {selectedOrder.orderNumber}
              </p>

              <p>
                Table{" "}
                {
                  selectedOrder.tableNumber
                }
              </p>

            </div>


            {/* ==============================
                ITEMS
            =============================== */}

            {selectedOrder.items?.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    padding:
                      "8px 0",
                  }}
                >

                  <div>

                    <strong>
                      {item.name}
                    </strong>

                    <div
                      style={{
                        fontSize:
                          "13px",

                        color:
                          "#6b7280",
                      }}
                    >
                      {item.quantity}
                      {" × "}
                      Rs.{" "}
                      {Number(
                        item.price
                      ).toLocaleString()}
                    </div>

                  </div>


                  <strong>
                    Rs.{" "}
                    {Number(
                      item.total
                    ).toLocaleString()}
                  </strong>

                </div>

              )
            )}


            {/* ==============================
                TOTAL
            =============================== */}

            <div
              style={{
                borderTop:
                  "1px dashed #d1d5db",

                marginTop:
                  "15px",

                paddingTop:
                  "15px",

                display:
                  "flex",

                justifyContent:
                  "space-between",

                fontSize:
                  "20px",
              }}
            >

              <strong>
                Total
              </strong>

              <strong>
                Rs.{" "}
                {Number(
                  selectedOrder.total
                ).toLocaleString()}
              </strong>

            </div>


            {/* ==============================
                CLOSE
            =============================== */}

            <button
              onClick={() =>
                setSelectedOrder(
                  null
                )
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "25px",

                padding:
                  "12px",

                border:
                  "none",

                borderRadius:
                  "8px",

                background:
                  "#111827",

                color:
                  "white",

                fontWeight:
                  "700",

                cursor:
                  "pointer",
              }}
            >
              Close
            </button>


            {/* ==============================
                PAY
            =============================== */}

            {selectedOrder.paymentStatus ===
              "unpaid" && (

              <button
                className="pay-button"
                disabled={
                  payingId ===
                  selectedOrder._id
                }
                onClick={() =>
                  markAsPaid(
                    selectedOrder._id
                  )
                }
                style={{
                  marginTop:
                    "10px",
                }}
              >

                {payingId ===
                selectedOrder._id
                  ? "Processing..."
                  : "Cash Received — Mark as Paid"}

              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Billing;