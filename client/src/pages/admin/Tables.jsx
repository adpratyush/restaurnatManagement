import { useEffect, useState } from "react";
import api from "../../services/api";

function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [form, setForm] = useState({
    tableNumber: "",
    name: "",
    capacity: 4,
  });

  const loadTables = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tables");

      setTables(response.data.data || []);
    } catch (err) {
      console.error("Load tables error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load tables."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      tableNumber: "",
      name: "",
      capacity: 4,
    });

    setEditingTable(null);
  };

  const openAddForm = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  const openEditForm = (table) => {
    setEditingTable(table);

    setForm({
      tableNumber: table.tableNumber || "",
      name: table.name || "",
      capacity: table.capacity || 4,
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    // Scroll smoothly to the form
    setTimeout(() => {
      document
        .getElementById("table-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
    setError("");
  };

  const saveTable = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.tableNumber.trim()) {
      setError("Table number is required.");
      return;
    }

    if (
      !form.capacity ||
      Number(form.capacity) < 1
    ) {
      setError("Capacity must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      const tableData = {
        tableNumber: form.tableNumber.trim(),
        name: form.name.trim(),
        capacity: Number(form.capacity),
      };

      if (editingTable) {
        await api.put(
          `/tables/${editingTable._id}`,
          tableData
        );

        setSuccess(
          `Table ${tableData.tableNumber} updated successfully.`
        );
      } else {
        await api.post(
          "/tables",
          tableData
        );

        setSuccess(
          `Table ${tableData.tableNumber} added successfully.`
        );
      }

      setShowForm(false);

      resetForm();

      await loadTables();
    } catch (err) {
      console.error("Save table error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save table."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTable = async (table) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Table ${table.tableNumber}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/tables/${table._id}`
      );

      setSuccess(
        `Table ${table.tableNumber} deleted successfully.`
      );

      await loadTables();
    } catch (err) {
      console.error("Delete table error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete table."
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>
          <p>Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ================================
          HEADER
      ================================= */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            Tables
          </h1>

          <p style={styles.subtitle}>
            Add and manage restaurant tables.
          </p>
        </div>

        <div style={styles.headerActions}>

          <button
            onClick={loadTables}
            style={styles.refreshButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "#ffffff";
            }}
          >
            ↻ Refresh
          </button>

          <button
            onClick={openAddForm}
            style={styles.addButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(37, 99, 235, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(37, 99, 235, 0.18)";
            }}
          >
            <span style={styles.addIcon}>
              +
            </span>

            Add Table
          </button>

        </div>

      </div>


      {/* ================================
          MESSAGES
      ================================= */}

      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div style={styles.successBox}>
          <span>✓</span>
          {success}
        </div>
      )}


      {/* ================================
          ADD / EDIT FORM
      ================================= */}

      {showForm && (
        <div
          id="table-form"
          style={{
            ...styles.formCard,
            ...(editingTable
              ? styles.editFormCard
              : styles.addFormCard),
          }}
        >

          {/* FORM HEADER */}

          <div style={styles.formHeader}>

            <div>

              <div style={styles.formTitleRow}>

                <div
                  style={{
                    ...styles.formIcon,
                    ...(editingTable
                      ? styles.editIcon
                      : styles.addFormIcon),
                  }}
                >
                  {editingTable
                    ? "✎"
                    : "+"}
                </div>

                <div>

                  <h2 style={styles.formTitle}>
                    {editingTable
                      ? "Edit Table"
                      : "Add New Table"}
                  </h2>

                  <p style={styles.formSubtitle}>
                    {editingTable
                      ? `Editing Table ${editingTable.tableNumber}`
                      : "Create a new restaurant table"}
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              style={styles.closeButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#fee2e2";
                e.currentTarget.style.color =
                  "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#f3f4f6";
                e.currentTarget.style.color =
                  "#6b7280";
              }}
            >
              ×
            </button>

          </div>


          {/* FORM */}

          <form onSubmit={saveTable}>

            <div style={styles.formGrid}>

              {/* TABLE NUMBER */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Table Number
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="tableNumber"
                  value={form.tableNumber}
                  onChange={handleChange}
                  placeholder="Example: 1"
                  required
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      editingTable
                        ? "#f59e0b"
                        : "#2563eb";

                    e.currentTarget.style.boxShadow =
                      editingTable
                        ? "0 0 0 3px rgba(245, 158, 11, 0.12)"
                        : "0 0 0 3px rgba(37, 99, 235, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "#d1d5db";

                    e.currentTarget.style.boxShadow =
                      "none";
                  }}
                />

              </div>


              {/* TABLE NAME */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Table Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Window Table"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      editingTable
                        ? "#f59e0b"
                        : "#2563eb";

                    e.currentTarget.style.boxShadow =
                      editingTable
                        ? "0 0 0 3px rgba(245, 158, 11, 0.12)"
                        : "0 0 0 3px rgba(37, 99, 235, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "#d1d5db";

                    e.currentTarget.style.boxShadow =
                      "none";
                  }}
                />

              </div>


              {/* CAPACITY */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Capacity
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      editingTable
                        ? "#f59e0b"
                        : "#2563eb";

                    e.currentTarget.style.boxShadow =
                      editingTable
                        ? "0 0 0 3px rgba(245, 158, 11, 0.12)"
                        : "0 0 0 3px rgba(37, 99, 235, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "#d1d5db";

                    e.currentTarget.style.boxShadow =
                      "none";
                  }}
                />

              </div>

            </div>


            {/* FORM ACTIONS */}

            <div style={styles.formActions}>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                style={styles.cancelButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "#ffffff";
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.saveButton,
                  ...(editingTable
                    ? styles.updateButton
                    : styles.createButton),
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingTable
                  ? "✓ Update Table"
                  : "+ Add Table"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* ================================
          EMPTY STATE
      ================================= */}

      {tables.length === 0 ? (

        <div style={styles.emptyBox}>

          <div style={styles.emptyIcon}>
            🪑
          </div>

          <h3 style={styles.emptyTitle}>
            No tables found
          </h3>

          <p style={styles.emptyText}>
            Add your first restaurant table
            to get started.
          </p>

          <button
            onClick={openAddForm}
            style={styles.emptyAddButton}
          >
            + Add Your First Table
          </button>

        </div>

      ) : (

        /* ================================
           TABLE GRID
        ================================= */

        <div style={styles.tableGrid}>

          {tables.map((table) => {

            const occupied =
              table.status === "occupied";

            return (

              <div
                key={table._id}
                style={{
                  ...styles.tableCard,
                  ...(occupied
                    ? styles.occupiedCard
                    : styles.availableCard),
                }}
              >

                {/* CARD TOP */}

                <div style={styles.cardTop}>

                  <div
                    style={{
                      ...styles.tableIcon,
                      background: occupied
                        ? "#fee2e2"
                        : "#dbeafe",
                    }}
                  >
                    🪑
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background: occupied
                        ? "#fee2e2"
                        : "#dcfce7",
                      color: occupied
                        ? "#b91c1c"
                        : "#15803d",
                    }}
                  >
                    <span
                      style={{
                        ...styles.statusDot,
                        background: occupied
                          ? "#ef4444"
                          : "#22c55e",
                      }}
                    />

                    {occupied
                      ? "OCCUPIED"
                      : "AVAILABLE"}
                  </span>

                </div>


                {/* TABLE INFO */}

                <h2 style={styles.tableNumber}>
                  Table {table.tableNumber}
                </h2>

                {table.name && (
                  <p style={styles.tableName}>
                    {table.name}
                  </p>
                )}

                <div style={styles.capacity}>
                  <span>
                    👥 Capacity
                  </span>

                  <strong>
                    {table.capacity}
                  </strong>
                </div>


                {/* ACTIONS */}

                <div style={styles.cardActions}>

                  <button
                    onClick={() =>
                      openEditForm(table)
                    }
                    style={styles.editButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "#fffbeb";
                      e.currentTarget.style.borderColor =
                        "#f59e0b";
                      e.currentTarget.style.color =
                        "#b45309";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "#ffffff";
                      e.currentTarget.style.borderColor =
                        "#e5e7eb";
                      e.currentTarget.style.color =
                        "#374151";
                    }}
                  >
                    ✎ Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteTable(table)
                    }
                    style={styles.deleteButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "#fef2f2";
                      e.currentTarget.style.borderColor =
                        "#fca5a5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "#ffffff";
                      e.currentTarget.style.borderColor =
                        "#fee2e2";
                    }}
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

  page: {
    padding: "30px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  refreshButton: {
    padding: "11px 18px",
    borderRadius: "9px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(37, 99, 235, 0.18)",
    transition: "all 0.2s ease",
  },

  addIcon: {
    fontSize: "19px",
    fontWeight: "400",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    minHeight: "300px",
    color: "#6b7280",
  },

  spinner: {
    width: "30px",
    height: "30px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    marginBottom: "12px",
    animation: "spin 1s linear infinite",
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "30px",
    transition: "all 0.25s ease",
  },

  addFormCard: {
    border: "1px solid #dbeafe",
    boxShadow:
      "0 8px 25px rgba(37, 99, 235, 0.08)",
  },

  editFormCard: {
    border: "2px solid #f59e0b",
    boxShadow:
      "0 8px 30px rgba(245, 158, 11, 0.12)",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  formTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  formIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "23px",
    fontWeight: "700",
  },

  addFormIcon: {
    background: "#dbeafe",
    color: "#2563eb",
  },

  editIcon: {
    background: "#fef3c7",
    color: "#d97706",
  },

  formTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#111827",
  },

  formSubtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },

  closeButton: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "8px",
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: "23px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "18px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "7px",
  },

  required: {
    color: "#ef4444",
    marginLeft: "3px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
    background: "#ffffff",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },

  cancelButton: {
    padding: "11px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  saveButton: {
    padding: "11px 22px",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  createButton: {
    background: "#2563eb",
    boxShadow:
      "0 4px 12px rgba(37, 99, 235, 0.18)",
  },

  updateButton: {
    background: "#d97706",
    boxShadow:
      "0 4px 12px rgba(217, 119, 6, 0.18)",
  },

  emptyBox: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "60px 30px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    color: "#111827",
  },

  emptyText: {
    color: "#6b7280",
    marginBottom: "20px",
  },

  emptyAddButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  tableGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    transition: "all 0.2s ease",
  },

  availableCard: {
    border: "1px solid #dbeafe",
    boxShadow:
      "0 4px 15px rgba(15, 23, 42, 0.04)",
  },

  occupiedCard: {
    border: "1px solid #fecaca",
    boxShadow:
      "0 4px 15px rgba(239, 68, 68, 0.06)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "17px",
  },

  tableIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "23px",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.4px",
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },

  tableNumber: {
    margin: 0,
    fontSize: "22px",
    color: "#111827",
  },

  tableName: {
    margin: "6px 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  capacity: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "18px",
    padding: "11px",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#6b7280",
    fontSize: "13px",
  },

  cardActions: {
    display: "flex",
    gap: "9px",
    marginTop: "18px",
    paddingTop: "15px",
    borderTop: "1px solid #f1f5f9",
  },

  editButton: {
    flex: 1,
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#374151",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  deleteButton: {
    flex: 1,
    padding: "10px",
    border: "1px solid #fee2e2",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#dc2626",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default Tables;