import { Plus } from "lucide-react";

function MenuItemCard({ item, onAdd }) {
  return (
    <>
      <style>
        {`
          .menu-item-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(15, 23, 42, 0.06);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            width: 100%;
          }

          .menu-item-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.1);
          }

          /* Image container */
          .menu-item-image-container {
            width: 100%;
            height: 180px;
            background: #f1f5f9;
            overflow: hidden;
            position: relative;
          }

          /* Food image */
          .menu-item-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          /* No image */
          .menu-item-no-image {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 45px;
          }

          /* Food information */
          .menu-item-content {
            padding: 16px;
          }

          .menu-item-category {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            padding: 5px 9px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .menu-item-name {
            margin: 0;
            font-size: 19px;
            font-weight: 700;
            color: #111827;
          }

          .menu-item-description {
            margin: 8px 0 14px;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;

            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .menu-item-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding-top: 12px;
            border-top: 1px solid #f1f5f9;
          }

          .menu-item-price {
            font-size: 18px;
            color: #111827;
            font-weight: 700;
          }

          .menu-item-add-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 8px 13px;
            border: none;
            border-radius: 7px;
            background: #2563eb;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .menu-item-add-button:hover {
            background: #1d4ed8;
          }

          .menu-item-add-button:active {
            transform: scale(0.97);
          }

          /* Mobile */
          @media (max-width: 600px) {
            .menu-item-image-container {
              height: 160px;
            }

            .menu-item-content {
              padding: 14px;
            }

            .menu-item-name {
              font-size: 17px;
            }

            .menu-item-price {
              font-size: 16px;
            }

            .menu-item-add-button {
              padding: 7px 10px;
            }
          }
        `}
      </style>

      <div className="menu-item-card">

        {/* Food Image */}
        <div className="menu-item-image-container">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="menu-item-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="menu-item-no-image">
              🍽️
            </div>
          )}
        </div>

        {/* Food Details */}
        <div className="menu-item-content">

          {item.category && (
            <div className="menu-item-category">
              {typeof item.category === "object"
                ? item.category?.name
                : ""}
            </div>
          )}

          <h3 className="menu-item-name">
            {item.name}
          </h3>

          <p className="menu-item-description">
            {item.description || "No description available."}
          </p>

          <div className="menu-item-footer">

            <strong className="menu-item-price">
              Rs.{" "}
              {Number(item.price || 0).toLocaleString()}
            </strong>

            <button
              type="button"
              className="menu-item-add-button"
              onClick={() => onAdd(item)}
            >
              <Plus size={18} />
              Add
            </button>

          </div>

        </div>
      </div>
    </>
  );
}

export default MenuItemCard;