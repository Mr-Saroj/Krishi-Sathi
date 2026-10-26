
import { useState } from "react";
import api from "../../../services/api";

const initialForm = {
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    aadhaar: "",
    pan: "",
    businessName: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    registrationNumber: "",
    productLicence: "",
    bankAccountName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
};

const initialFiles = {
    panDocument: null,
    supportingDocuments: null,
    bankProof: null,
};

export default function useRegister() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(initialForm);
    const [files, setFiles] = useState(initialFiles);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update text inputs
    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setMessage("");
        setSuccess(false);
    };

    // Update uploaded documents
    const updateFile = (name, file) => {
        setFiles((previous) => ({
            ...previous,
            [name]: file,
        }));

        setMessage("");
        setSuccess(false);
    };

    // Validate the current step
    const validateStep = () => {
        if (step === 0) {
            if (!form.fullName.trim()) {
                setMessage("Full name is required.");
                return false;
            }

            if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
                setMessage("Enter a valid 10-digit Indian mobile number.");
                return false;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
                setMessage("Enter a valid email address.");
                return false;
            }

            if (form.password.length < 8) {
                setMessage("Password must contain at least 8 characters.");
                return false;
            }

            if (form.password.length > 72) {
                setMessage("Password must not exceed 72 characters.");
                return false;
            }

            if (!/[A-Z]/.test(form.password)) {
                setMessage("Password must contain at least one uppercase letter.");
                return false;
            }

            if (!/[a-z]/.test(form.password)) {
                setMessage("Password must contain at least one lowercase letter.");
                return false;
            }

            if (!/\d/.test(form.password)) {
                setMessage("Password must contain at least one number.");
                return false;
            }

            if (form.password !== form.confirmPassword) {
                setMessage("Passwords do not match.");
                return false;
            }

            if (!/^[2-9]\d{11}$/.test(form.aadhaar.trim())) {
                setMessage("Enter a valid 12-digit Aadhaar number.");
                return false;
            }

            if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan.trim().toUpperCase())) {
                setMessage("Enter a valid PAN number, for example ABCDE1234F.");
                return false;
            }

            if (!files.panDocument) {
                setMessage("Please upload your PAN document.");
                return false;
            }
        }

        if (step === 1) {
            const requiredFields = [
                ["businessName", "Business/shop name"],
                ["businessType", "Business type"],
                ["address", "Business address"],
                ["city", "City/village"],
                ["state", "State"],
                ["pincode", "PIN code"],
                ["gstin", "GSTIN"],
                ["registrationNumber", "Business registration number"],
                ["productLicence", "Product license"],
            ];

            for (const [key, label] of requiredFields) {
                if (!form[key].trim()) {
                    setMessage(`${label} is required.`);
                    return false;
                }
            }

            if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) {
                setMessage("Enter a valid 6-digit PIN code.");
                return false;
            }

            if (
                !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
                    form.gstin.trim().toUpperCase()
                )
            ) {
                setMessage("Enter a valid GSTIN format.");
                return false;
            }

            if (!files.supportingDocuments) {
                setMessage("Please upload your supporting documents.");
                return false;
            }
        }

        if (step === 2) {
            if (!form.bankAccountName.trim()) {
                setMessage("Account holder name is required.");
                return false;
            }

            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim().toUpperCase())) {
                setMessage("Enter a valid IFSC code.");
                return false;
            }

            if (!/^\d{9,18}$/.test(form.accountNumber.trim())) {
                setMessage("Enter a valid bank account number.");
                return false;
            }

            if (
                form.accountNumber.trim() !==
                form.confirmAccountNumber.trim()
            ) {
                setMessage("Bank account numbers do not match.");
                return false;
            }

            if (!files.bankProof) {
                setMessage("Please upload your bank proof.");
                return false;
            }

            if (!accepted) {
                setMessage("Please confirm that your information is accurate.");
                return false;
            }
        }

        return true;
    };

    // Submit registration to Spring Boot
    const submitRegistration = async () => {
        setIsSubmitting(true);
        setMessage("");
        setSuccess(false);

        try {
            const data = new FormData();

            // Personal details
            data.append("fullName", form.fullName.trim());
            data.append("mobileNumber", form.mobile.trim());
            data.append("email", form.email.trim());
            data.append("password", form.password);
            data.append("aadhaarNumber", form.aadhaar.trim());
            data.append("panNumber", form.pan.trim().toUpperCase());

            // Business details
            data.append("businessName", form.businessName.trim());
            data.append("businessType", form.businessType.trim());
            data.append("businessAddress", form.address.trim());
            data.append("city", form.city.trim());
            data.append("state", form.state.trim());
            data.append("pinCode", form.pincode.trim());
            data.append("gstin", form.gstin.trim().toUpperCase());

            data.append(
                "businessRegistrationNumber",
                form.registrationNumber.trim()
            );

            data.append("productLicense", form.productLicence.trim());

            // Bank details
            data.append("accountHolderName", form.bankAccountName.trim());
            data.append("ifscCode", form.ifsc.trim().toUpperCase());
            data.append("accountNumber", form.accountNumber.trim());

            // Uploaded documents
            data.append("panDocument", files.panDocument);
            data.append("supportingDocuments", files.supportingDocuments);
            data.append("bankProof", files.bankProof);

            // Axios shared API instance
            // Do not JSON.stringify FormData or force application/json.
            const response = await api.post("/auth/webRegister", data);

            const result = response.data;

            setSuccess(true);
            setMessage(
                result?.message || "Seller registration submitted successfully."
            );
        } catch (error) {
            setSuccess(false);

            const status = error.response?.status;
            const serverMessage = error.response?.data?.message;

            if (status === 400) {
                setMessage(
                    serverMessage ||
                    "Invalid registration data. Please check your fields and documents."
                );
            } else if (status === 409) {
                setMessage(
                    serverMessage ||
                    "An account with these details may already exist."
                );
            } else if (error.response) {
                setMessage(
                    serverMessage ||
                    `Registration failed with status ${status}.`
                );
            } else {
                setMessage(
                    "Unable to connect to the server. Please try again."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Continue or submit on the last step
    const nextStep = async (event) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);

        if (isSubmitting || !validateStep()) {
            return;
        }

        if (step < 2) {
            setStep((current) => current + 1);
            return;
        }

        await submitRegistration();
    };

    // Return to the previous step
    const previousStep = () => {
        setMessage("");
        setSuccess(false);
        setStep((current) => Math.max(0, current - 1));
    };

    return {
        step,
        setStep,
        form,
        files,
        message,
        success,
        accepted,
        setAccepted,
        isSubmitting,
        updateField,
        updateFile,
        nextStep,
        previousStep,
    };
}
