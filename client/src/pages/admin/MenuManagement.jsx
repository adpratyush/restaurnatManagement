import { useEffect, useState } from "react";
import api from "../../services/api";

function MenuManagement() {
  // =========================================================
  // Initial Form
  // =========================================================

  const initialForm = {
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    isAvailable: true,
    isFeatured: false,
  };

  // =========================================================
  // State
  // =========================================================

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState(initialForm);

  // =========================================================
  // Load Menu and Categories
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [menuResponse, categoryResponse] =
        await Promise.all([
          api.get("/menu-items"),
          api.get("/categories"),
        ]);

      setMenuItems(menuResponse.data?.data || []);
      setCategories(categoryResponse.data?.data || []);
    } catch (err) {
      console.error("Load menu error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // Form Change Handler
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // Reset Form
  // =========================================================

  const resetForm = () => {
    setForm({
      ...initialForm,
    });

    setEditingItem(null);
  };

  // =========================================================
  // Scroll to Form
  // =========================================================

  const scrollToForm = () => {
    setTimeout(() => {
      document
        .getElementById("menu-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =========================================================
  // Open Add Form
  // =========================================================

  const openAddForm = () => {
    resetForm();

    setError("");
    setSuccess("");
    setShowForm(true);

    scrollToForm();
  };

  // =========================================================
  // Open Edit Form
  // =========================================================

  const openEditForm = (item) => {
    setEditingItem(item);

    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      image: item.image || "",

      category:
        typeof item.category === "object"
          ? item.category?._id || ""
          : item.category || "",

      isAvailable:
        item.isAvailable !== false,

      isFeatured:
        item.isFeatured === true,
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    scrollToForm();
  };

  // =========================================================
  // Close Form
  // =========================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);

    resetForm();

    setError("");
  };

  // =========================================================
  // Save Menu Item
  // =========================================================

  const saveMenuItem = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const price = Number(form.price);

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name) {
      setError("Food name is required.");
      return;
    }

    if (
      form.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    // -----------------------------
    // Menu Data
    // -----------------------------

    const menuData = {
      name,
      description: form.description.trim(),
      price,
      image: form.image.trim(),
      category: form.category,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
    };

    try {
      setSaving(true);

      // -----------------------------
      // Update Existing Item
      // -----------------------------

      if (editingItem) {
        await api.put(
          `/menu-items/${editingItem._id}`,
          menuData
        );

        setSuccess(
          `${name} updated successfully.`
        );
      }

      // -----------------------------
      // Create New Item
      // -----------------------------

      else {
        await api.post(
          "/menu-items",
          menuData
        );

        setSuccess(
          `${name} added to the menu.`
        );
      }

      // -----------------------------
      // Reset and Reload
      // -----------------------------

      setShowForm(false);

      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "Save menu item error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save menu item."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Delete Menu Item
  // =========================================================

  const deleteMenuItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/menu-items/${item._id}`
      );

      setSuccess(
        `${item.name} deleted successfully.`
      );

      await loadData();
    } catch (err) {
      console.error(
        "Delete menu item error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete menu item."
      );
    }
  };

  // =========================================================
  // Toggle Availability
  // =========================================================

  const toggleAvailability = async (item) => {
    try {
      setError("");
      setSuccess("");

      const newStatus =
        !item.isAvailable;

      await api.put(
        `/menu-items/${item._id}`,
        {
          isAvailable: newStatus,
        }
      );

      setSuccess(
        `${item.name} is now ${
          newStatus
            ? "available"
            : "unavailable"
        }.`
      );

      await loadData();
    } catch (err) {
      console.error(
        "Availability update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update availability."
      );
    }
  };

  // =========================================================
  // Get Category Name
  // =========================================================

  const getCategoryName = (item) => {
    if (
      typeof item.category === "object"
    ) {
      return (
        item.category?.name ||
        "Uncategorized"
      );
    }

    return (
      categories.find(
        (category) =>
          category._id === item.category
      )?.name || "Uncategorized"
    );
  };

  // =========================================================
  // Loading Screen
  // =========================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />

          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Main UI
  // =========================================================

  return (
    <div style={styles.page}>

      {/* =====================================================
          Header
      ===================================================== */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            Menu Management
          </h1>

          <p style={styles.subtitle}>
            Add and manage restaurant food items.
          </p>
        </div>

        <div style={styles.headerActions}>

          <button
            type="button"
            onClick={loadData}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            style={styles.addButton}
          >
            <span style={styles.addIcon}>
              +
            </span>

            Add Food
          </button>

        </div>
      </div>

      {/* =====================================================
          Error Message
      ===================================================== */}

      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          Success Message
      ===================================================== */}

      {success && (
        <div style={styles.successBox}>
          <span>✓</span>

          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          Category Warning
      ===================================================== */}

      {categories.length === 0 && (
        <div style={styles.warningBox}>
          <strong>
            No categories found
          </strong>

          <p
            style={{
              margin: "6px 0 0",
            }}
          >
            Create a category before
            adding food items.
          </p>
        </div>
      )}

      {/* =====================================================
          Add / Edit Form
      ===================================================== */}

      {showForm && (
        <div
          id="menu-form"
          style={{
            ...styles.formCard,
            ...(editingItem
              ? styles.editForm
              : styles.addForm),
          }}
        >

          {/* Form Header */}

          <div style={styles.formHeader}>

            <div style={styles.formTitleRow}>

              <div
                style={{
                  ...styles.formIcon,

                  ...(editingItem
                    ? styles.editIcon
                    : styles.addFormIcon),
                }}
              >
                {editingItem
                  ? "✎"
                  : "+"}
              </div>

              <div>

                <h2 style={styles.formTitle}>
                  {editingItem
                    ? "Edit Food"
                    : "Add New Food"}
                </h2>

                <p style={styles.formSubtitle}>
                  {editingItem
                    ? `Editing ${editingItem.name}`
                    : "Add a new dish to your restaurant menu"}
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              style={styles.closeButton}
            >
              ×
            </button>

          </div>

          {/* Form */}

          <form onSubmit={saveMenuItem}>

            {/* Basic Information */}

            <div style={styles.formGrid}>

              {/* Food Name */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Food Name{" "}
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Chicken Momo"
                  required
                  style={styles.input}
                />

              </div>

              {/* Price */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Price{" "}
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <div style={styles.priceInput}>

                  <span style={styles.currency}>
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="180"
                    min="0"
                    step="0.01"
                    required
                    style={styles.priceField}
                  />

                </div>
              </div>

              {/* Category */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Category{" "}
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* Food Image */}

            <div style={styles.inputGroup}>

              <label style={styles.label}>
                Food Image URL
              </label>

              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/food.jpg"
                style={styles.input}
              />

            </div>

            {/* Description */}

            <div style={styles.inputGroup}>

              <label style={styles.label}>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the food item..."
                rows="4"
                style={styles.textarea}
              />

            </div>

            {/* Options */}

            <div
              style={styles.optionsContainer}
            >

              <label
                style={styles.checkboxLabel}
              >

                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={
                    form.isAvailable
                  }
                  onChange={handleChange}
                />

                <span>
                  Available for customers
                </span>

              </label>

              <label
                style={styles.checkboxLabel}
              >

                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={
                    form.isFeatured
                  }
                  onChange={handleChange}
                />

                <span>
                  Featured item
                </span>

              </label>

            </div>

            {/* Form Actions */}

            <div style={styles.formActions}>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  categories.length === 0
                }
                style={{
                  ...styles.saveButton,

                  ...(editingItem
                    ? styles.updateButton
                    : styles.createButton),

                  opacity:
                    saving ||
                    categories.length === 0
                      ? 0.6
                      : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingItem
                  ? "✓ Update Food"
                  : "+ Add Food"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =====================================================
          Empty Menu
      ===================================================== */}

      {menuItems.length === 0 ? (

        <div style={styles.emptyBox}>

          <div style={styles.emptyIcon}>
            🍽️
          </div>

          <h3 style={styles.emptyTitle}>
            No menu items found
          </h3>

          <p style={styles.emptyText}>
            Add your first food item to
            start building your menu.
          </p>

          {categories.length > 0 && (
            <button
              type="button"
              onClick={openAddForm}
              style={styles.emptyAddButton}
            >
              + Add Your First Food
            </button>
          )}

        </div>

      ) : (

        /* =====================================================
           Menu Grid
        ===================================================== */

        <div style={styles.menuGrid}>

          {menuItems.map((item) => {

            const categoryName =
              getCategoryName(item);

            return (
              <div
                key={item._id}
                style={styles.foodCard}
              >

                {/* Image */}

                <div
                  style={styles.imageContainer}
                >

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.foodImage}
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";

                        if (
                          e.currentTarget
                            .nextSibling
                        ) {
                          e.currentTarget
                            .nextSibling
                            .style.display =
                            "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    style={{
                      ...styles.noImage,
                      display: item.image
                        ? "none"
                        : "flex",
                    }}
                  >
                    🍽️
                  </div>

                  {/* Featured */}

                  {item.isFeatured && (
                    <span
                      style={
                        styles.featuredBadge
                      }
                    >
                      ⭐ Featured
                    </span>
                  )}

                  {/* Availability */}

                  <span
                    style={{
                      ...styles.availabilityBadge,

                      background:
                        item.isAvailable
                          ? "#dcfce7"
                          : "#fee2e2",

                      color:
                        item.isAvailable
                          ? "#15803d"
                          : "#b91c1c",
                    }}
                  >
                    {item.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>

                {/* Food Content */}

                <div style={styles.foodContent}>

                  {/* Category */}

                  <div
                    style={
                      styles.categoryBadge
                    }
                  >
                    {categoryName}
                  </div>

                  {/* Name */}

                  <h2
                    style={styles.foodName}
                  >
                    {item.name}
                  </h2>

                  {/* Description */}

                  <p
                    style={styles.description}
                  >
                    {item.description ||
                      "No description available."}
                  </p>

                  {/* Price */}

                  <div
                    style={styles.priceRow}
                  >
                    <strong
                      style={styles.price}
                    >
                      Rs.{" "}
                      {Number(
                        item.price || 0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  {/* Actions */}

                  <div
                    style={styles.foodActions}
                  >

                    {/* Availability */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleAvailability(
                          item
                        )
                      }
                      style={
                        item.isAvailable
                          ? styles.unavailableButton
                          : styles.availableButton
                      }
                    >
                      {item.isAvailable
                        ? "Disable"
                        : "Enable"}
                    </button>

                    {/* Edit */}

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(item)
                      }
                      style={
                        styles.editButton
                      }
                    >
                      ✎ Edit
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteMenuItem(item)
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      🗑
                    </button>

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

// =========================================================
// Styles
// =========================================================

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
  },

  refreshButton: {
    padding: "11px 18px",
    borderRadius: "9px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
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
      "0 4px 12px rgba(37, 99, 235, 0.2)",
  },

  addIcon: {
    fontSize: "19px",
  },

  errorBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
  },

  successBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
  },

  warningBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    borderRadius: "10px",
    padding: "15px 18px",
    marginBottom: "20px",
  },

  loadingBox: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  spinner: {
    width: "30px",
    height: "30px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    marginBottom: "12px",
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "30px",
  },

  addForm: {
    border: "1px solid #dbeafe",
    boxShadow:
      "0 8px 25px rgba(37, 99, 235, 0.08)",
  },

  editForm: {
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
    alignItems: "center",
    justifyContent: "center",
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
    color: "#6b7280",
    fontSize: "13px",
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
    marginBottom: "18px",
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
    outline: "none",
    background: "#ffffff",
  },

  priceInput: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    overflow: "hidden",
  },

  currency: {
    padding: "12px",
    background: "#f8fafc",
    color: "#6b7280",
    fontWeight: "600",
    borderRight:
      "1px solid #d1d5db",
  },

  priceField: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px",
    fontSize: "14px",
    minWidth: 0,
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },

  optionsContainer: {
    display: "flex",
    gap: "25px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "9px",
    marginTop: "5px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop:
      "1px solid #f1f5f9",
  },

  cancelButton: {
    padding: "11px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
  },

  saveButton: {
    padding: "11px 22px",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  createButton: {
    background: "#2563eb",
  },

  updateButton: {
    background: "#d97706",
  },

  emptyBox: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "60px 30px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "48px",
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

  menuGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "22px",
  },

  foodCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow:
      "0 4px 15px rgba(15, 23, 42, 0.04)",
  },

  imageContainer: {
    height: "190px",
    background: "#f1f5f9",
    position: "relative",
    overflow: "hidden",
  },

  foodImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "50px",
  },

  featuredBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  availabilityBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  foodContent: {
    padding: "18px",
  },

  categoryBadge: {
    display: "inline-block",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "9px",
  },

  foodName: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  description: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.5",
    minHeight: "40px",
    margin: "8px 0",
  },

  priceRow: {
    marginTop: "12px",
    marginBottom: "15px",
  },

  price: {
    fontSize: "20px",
    color: "#111827",
  },

  foodActions: {
    display: "flex",
    gap: "7px",
    paddingTop: "14px",
    borderTop:
      "1px solid #f1f5f9",
  },

  availableButton: {
    padding: "9px 10px",
    border:
      "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
    borderRadius: "7px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },

  unavailableButton: {
    padding: "9px 10px",
    border:
      "1px solid #fed7aa",
    background: "#fff7ed",
    color: "#c2410c",
    borderRadius: "7px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },

  editButton: {
    flex: 1,
    padding: "9px 10px",
    border:
      "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#374151",
    borderRadius: "7px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },

  deleteButton: {
    width: "40px",
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default MenuManagement;