import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import api from "../../../services/api";

import {
  getSellerStats,
  filterSellers,
} from "../utils/sellerManagementUtils";

const PAGE_SIZE = 15;

const mapStatus = (loginAccess) => {
  switch (loginAccess?.toUpperCase()) {
    case "APPROVED":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    case "SUSPENDED":
      return "SUSPENDED";
    default:
      return "PENDING";
  }
};

// Convert the backend account response to the frontend format.
const mapSeller = (seller) => ({
  id: seller.sellerId,
  owner: seller.fullName || "",
  email: seller.email || "",
  mobileNumber: seller.mobileNumber || "",
  shopName: seller.fullName || "Seller",
  city: "",
  state: "",
  appliedOn: "",
  status: mapStatus(seller.loginAccess),
  documents: [],
  perf: {
    orders: 0,
    totalSales: 0,
  },
  complaints: [],
  note: "",
});

// Add business profile details when the detail API returns them.
const mapSellerDetails = (response) => {
  const profile = response.businessDetails || {};

  return {
    id: response.sellerId,
    owner: response.fullName || "",
    email: response.email || "",
    mobileNumber: response.mobileNumber || "",
    shopName: profile.businessName || profile.shopName || response.fullName || "Seller",
    city: profile.city || "",
    state: profile.state || "",
    appliedOn: profile.createdAt || "",
    status: mapStatus(response.loginAccess),

    // Adjust these mappings to match your SellerProfile model.
    documents: profile.documents || [],

    perf: {
      orders: profile.orders || 0,
      totalSales: profile.totalSales || 0,
    },

    complaints: profile.complaints || [],
    note: "",
    businessDetails: profile,
  };
};

const useSellerManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [sellers, setSellers] = useState([]);
  const [tab, setTab] = useState("applications");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);

  // Fetch pending applications from Spring Boot.
  const fetchPendingSellers = useCallback(async (cursor = null) => {
    try {
      setError("");

      const response = await api.get("/admin/sellers/pending", {
        params: cursor ? { cursor } : {},
      });

      const page = response.data;

      const incomingSellers = (page.content || []).map(mapSeller);

      setSellers((previous) => {
        if (!cursor) {
          return incomingSellers;
        }

        // Avoid duplicate sellers when loading another page.
        const existingIds = new Set(previous.map((seller) => seller.id));

        return [
          ...previous,
          ...incomingSellers.filter(
            (seller) => !existingIds.has(seller.id)
          ),
        ];
      });

      setNextCursor(page.nextCursor || null);
      setHasNext(Boolean(page.hasNext));
    } catch (err) {
      console.error("Failed to fetch pending sellers:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load seller applications."
      );
    }
  }, []);

  // Initial API request.
  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);

      try {
        await fetchPendingSellers();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [fetchPendingSellers]);

  // Fetch the next page when needed.
  const loadMore = useCallback(async () => {
    if (!hasNext || !nextCursor) {
      return;
    }

    await fetchPendingSellers(nextCursor);
  }, [fetchPendingSellers, hasNext, nextCursor]);

  // Fetch complete seller details by seller ID.
  const openSeller = useCallback(async (sellerId) => {
    setIsDetailLoading(true);
    setError("");

    try {
      const response = await api.get(`/admin/sellers/${sellerId}`);

      const sellerDetails = mapSellerDetails(response.data);

      setSelectedSeller(sellerDetails);

      return sellerDetails;
    } catch (err) {
      console.error("Failed to fetch seller details:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load seller details."
      );

      setToast("Failed to load seller details.");

      return null;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const closeSeller = useCallback(() => {
    setSelectedSeller(null);
  }, []);

  // Approve or reject through the backend.
  const updateSellerApproval = useCallback(
    async (sellerId, decision) => {
      try {
        setError("");

        const response = await api.patch(
          `/admin/sellers/${sellerId}/approval`,
          {
            loginAccess: decision,
          }
        );

        const updatedSeller = mapSeller(response.data);

        // Update the frontend only after the backend succeeds.
        setSellers((previous) =>
          previous.map((seller) =>
            seller.id === sellerId
              ? { ...seller, ...updatedSeller }
              : seller
          )
        );

        if (selectedSeller?.id === sellerId) {
          setSelectedSeller((previous) =>
            previous
              ? {
                  ...previous,
                  status: decision,
                }
              : null
          );
        }

        setToast(
          decision === "APPROVED"
            ? "Seller approved successfully."
            : "Seller application rejected."
        );

        // The pending applications API should no longer return this seller.
        if (decision === "APPROVED" || decision === "REJECTED") {
          setSellers((previous) =>
            previous.filter((seller) => seller.id !== sellerId)
          );

          setSelectedSeller((previous) =>
            previous?.id === sellerId ? null : previous
          );
        }

        return true;
      } catch (err) {
        console.error("Failed to update seller approval:", err);

        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Unable to update seller approval."
        );

        setToast("Failed to update seller approval.");

        return false;
      }
    },
    [selectedSeller?.id]
  );

  const approve = useCallback(
    (sellerId) => updateSellerApproval(sellerId, "APPROVED"),
    [updateSellerApproval]
  );

  const reject = useCallback(
    (sellerId, reason) => updateSellerApproval(sellerId, "REJECTED"),
    [updateSellerApproval]
  );

  // These actions need additional backend endpoints.
  const suspend = useCallback(() => {
    setToast("Seller suspension API is not connected yet.");
  }, []);

  const reinstate = useCallback(() => {
    setToast("Seller reinstatement API is not connected yet.");
  }, []);

  const resolveComplaint = useCallback(() => {
    setToast("Complaint resolution API is not connected yet.");
  }, []);

  // These statistics currently describe the sellers loaded by this API,
  // not all sellers in the database.
  const stats = useMemo(
    () => getSellerStats(sellers),
    [sellers]
  );

  const visibleSellers = useMemo(
    () => filterSellers(sellers, { tab, query, status }),
    [sellers, tab, query, status]
  );

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(""), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  return {
    isLoading,
    isDetailLoading,
    error,

    tab,
    setTab,

    query,
    setQuery,

    status,
    setStatus,

    stats,
    visibleSellers,
    selectedSeller,

    openSeller,
    closeSeller,

    toast,

    nextCursor,
    hasNext,
    loadMore,

    actions: {
      approve,
      reject,
      suspend,
      reinstate,
      resolveComplaint,
    },
  };
};

export default useSellerManagement;