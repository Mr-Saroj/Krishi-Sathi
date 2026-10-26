
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function useLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Call Spring Boot web login API
      const response = await api.post("/auth/weblogin", {
        email,
        password,
      });

      const { role } = response.data;

      // Backend sets the HttpOnly accessToken cookie.
      // Do not manually save the JWT in frontend JavaScript.

      if (role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "SELLER") {
        navigate("/seller-dashboard", { replace: true });
      } else {
        setError("Access denied. Unsupported account role.");
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;

        if (status === 401) {
          setError("Invalid email or password.");
        } else if (status === 403) {
          setError(
            "You are not authorized to access this account."
          );
        } else {
          setError(
            err.response.data?.message ||
              "Login failed. Please try again."
          );
        }
      } else {
        setError(
          "Unable to connect to the server. Please check your connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    showPassword,
    loading,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  };
}
