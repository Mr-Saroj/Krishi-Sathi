
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Call Spring Boot admin web login API
      const response = await api.post("/auth/weblogin", {
        email,
        password,
      });

      const { fullName, role } = response.data;

      // The backend sets the HttpOnly accessToken cookie.
      // Do not try to read or manually save the JWT here.

      if (role === "ADMIN") {
        // Optional: keep non-sensitive user information in memory
        // or your existing authentication context if needed.
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Access denied. Admin account required.");
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;

        if (status === 401) {
          setError("Invalid email or password.");
        } else if (status === 403) {
          setError("You are not authorized to access this account.");
        } else {
          setError(
            err.response.data?.message ||
              "Login failed. Please try again."
          );
        }
      } else {
        setError(
          "Unable to connect to the server. Please try again."
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
