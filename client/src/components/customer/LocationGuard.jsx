import { useEffect, useState } from "react";

function LocationGuard({ children }) {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  /*
   * Restaurant location
   *
   * Replace these coordinates with your restaurant's
   * actual latitude and longitude.
   */
const RESTAURANT_LATITUDE = 27.6794783;
const RESTAURANT_LONGITUDE = 85.2340767;

const ALLOWED_RADIUS = 100;

  /*
   * Calculate distance between two GPS coordinates.
   */
  const calculateDistance = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
  ) => {
    const earthRadius = 6371000;

    const lat1 = (latitude1 * Math.PI) / 180;
    const lat2 = (latitude2 * Math.PI) / 180;

    const latitudeDifference =
      ((latitude2 - latitude1) * Math.PI) / 180;

    const longitudeDifference =
      ((longitude2 - longitude1) * Math.PI) / 180;

    const a =
      Math.sin(latitudeDifference / 2) *
        Math.sin(latitudeDifference / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(longitudeDifference / 2) *
        Math.sin(longitudeDifference / 2);

    const c =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  /*
   * Check customer's location.
   */
  const checkLocation = () => {
    setStatus("checking");
    setError("");

    if (!navigator.geolocation) {
      setStatus("error");
      setError(
        "Location services are not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const customerLatitude =
          position.coords.latitude;

        const customerLongitude =
          position.coords.longitude;

        const distance = calculateDistance(
          customerLatitude,
          customerLongitude,
          RESTAURANT_LATITUDE,
          RESTAURANT_LONGITUDE
        );

        console.log("Customer latitude:", customerLatitude);
        console.log("Customer longitude:", customerLongitude);
        console.log("Distance from restaurant:", distance);

        if (distance <= ALLOWED_RADIUS) {
          setStatus("allowed");
        } else {
          setStatus("outside");
        }
      },

      (locationError) => {
        console.error(
          "Location error:",
          locationError
        );

        if (locationError.code === 1) {
          setError(
            "Location permission is required to access the restaurant menu."
          );
        } else if (locationError.code === 2) {
          setError(
            "Unable to determine your location."
          );
        } else if (locationError.code === 3) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            "Unable to access your location."
          );
        }

        setStatus("error");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    checkLocation();
  }, []);

  /*
   * Checking location
   */
  if (status === "checking") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner}></div>

          <h2>
            Checking your location
          </h2>

          <p>
            Please allow location access to
            continue.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Location permission denied
   * or location unavailable.
   */
  if (status === "error") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <div style={styles.icon}>
            📍
          </div>

          <h2>
            Location Required
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={checkLocation}
            style={styles.button}
          >
            Try Again
          </button>

          <p style={styles.helpText}>
            Please enable location services in
            your browser settings and try again.
          </p>

        </div>
      </div>
    );
  }

  /*
   * Customer is outside restaurant.
   */
  if (status === "outside") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <div style={styles.icon}>
            🚫
          </div>

          <h2>
            You Are Not at the Restaurant
          </h2>

          <p>
            You must be at the restaurant to
            access the menu and place an order.
          </p>

          <button
            type="button"
            onClick={checkLocation}
            style={styles.button}
          >
            Check Location Again
          </button>

        </div>
      </div>
    );
  }

  /*
   * Customer is inside restaurant.
   */
  return children;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "35px 25px",
    textAlign: "center",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.08)",
  },

  icon: {
    fontSize: "55px",
    marginBottom: "15px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "locationSpin 1s linear infinite",
  },

  button: {
    width: "100%",
    padding: "12px 20px",
    marginTop: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  helpText: {
    marginTop: "15px",
    fontSize: "13px",
    color: "#6b7280",
  },
};

export default LocationGuard;