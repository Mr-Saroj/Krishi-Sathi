// src/pages/public/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const steps = [
    { title: "Account & Identity", subtitle: "Verify your identity" },
    { title: "Business Details", subtitle: "Business information" },
    { title: "Bank & Review", subtitle: "Payout setup" },
];

// Pressed-in (inset) input; focus shows a green outline
const inputClass =
    "neu-inset mt-2 w-full rounded-xl border-0 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60";

function Field({ label, required, hint, children }) {
    return (
        <div className="min-w-0">
            <label className="text-sm font-semibold text-primary">
                {label}
                {required && <span className="ml-1 text-error">*</span>}
            </label>
            {children}
            {hint && (
                <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{hint}</p>
            )}
        </div>
    );
}

function TextField({
    label,
    name,
    value,
    onChange,
    required = false,
    placeholder,
    type = "text",
    hint,
    maxLength,
}) {
    return (
        <Field label={label} required={required} hint={hint}>
            <input
                className={inputClass}
                name={name}
                value={value}
                onChange={onChange}
                type={type}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                autoComplete="off"
            />
        </Field>
    );
}

function FileField({ label, name, onChange, hint }) {
    const [fileName, setFileName] = useState("");

    return (
        <Field label={label} hint={hint}>
            <label className="neu-inset-sm mt-2 flex cursor-pointer items-center gap-3 rounded-xl p-3.5 transition hover:text-secondary">
                <span className="neu-raised-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-secondary">
                    ↑
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-on-surface">
                        {fileName || "Choose document"}
                    </span>
                    <span className="mt-1 block text-xs text-on-surface-variant">
                        PDF, JPG or PNG
                    </span>
                </span>
                <input
                    className="sr-only"
                    type="file"
                    name={name}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setFileName(file?.name || "");
                        onChange(name, file);
                    }}
                />
            </label>
        </Field>
    );
}

export default function Register() {
    const [step, setStep] = useState(0);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        mobile: "",
        email: "",
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
    });

    const [files, setFiles] = useState({});

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setMessage("");
        setSuccess(false);
    };

    const updateFile = (name, file) => {
        setFiles((previous) => ({ ...previous, [name]: file }));
    };

    const nextStep = (event) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);

        if (step === 0) {
            if (!/^\d{10}$/.test(form.mobile)) {
                setMessage("Enter a valid 10-digit mobile number.");
                return;
            }

            if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar)) {
                setMessage("Check the Aadhaar number format.");
                return;
            }

            if (
                form.pan &&
                !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan.toUpperCase())
            ) {
                setMessage("Enter a valid PAN format, for example ABCDE1234F.");
                return;
            }
        }

        if (step === 1) {
            if (!/^\d{6}$/.test(form.pincode)) {
                setMessage("Enter a valid 6-digit PIN code.");
                return;
            }
        }

        if (step === 2) {
            if (form.accountNumber !== form.confirmAccountNumber) {
                setMessage("Bank account numbers do not match.");
                return;
            }

            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.toUpperCase())) {
                setMessage("Enter a valid IFSC code.");
                return;
            }

            if (!accepted) {
                setMessage("Please accept the declaration before continuing.");
                return;
            }

            // UI only: connect your registration API here.
            // Use FormData to submit form fields and files securely.
            setSuccess(true);
            setMessage(
                "Your details passed the UI checks. Backend registration is not connected yet."
            );
            return;
        }

        setStep((current) => current + 1);
    };

    const previousStep = () => {
        setMessage("");
        setSuccess(false);
        setStep((current) => Math.max(0, current - 1));
    };

    return (
        <main className="min-h-screen bg-surface px-4 pb-12 pt-12 sm:px-6 sm:pt-14 lg:pt-22">
            <div className="mx-auto max-w-5xl">
                {/* Page heading */}
                <header className="mb-8 text-center sm:mb-10">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                        <a
                            href="/"
                            className="neu-raised flex h-20 w-20 items-center justify-center rounded-3xl"
                        >
                            <img
                                src="/dashboard_icon.png"
                                alt="Krishi Sathi AI"
                                className="h-12 w-12 object-contain"
                            />
                        </a>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        Become a seller
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-on-surface-variant sm:text-base">
                        Register your farming business and connect with more customers
                        through Krishi Sathi AI.
                    </p>
                </header>

                {/* Registration card */}
                <section className="neu-raised overflow-hidden rounded-3xl">
                    {/* Stepper */}
                    <div className="border-b border-primary/10 px-5 py-6 sm:px-10 sm:py-8">
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold text-primary">
                                    Seller registration
                                </p>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    Complete all three steps to register.
                                </p>
                            </div>

                            <span className="neu-inset-sm shrink-0 rounded-full px-4 py-1.5 text-xs font-bold text-secondary">
                                Step {step + 1} of 3
                            </span>
                        </div>

                        {/* Circular steps */}
                        <div className="relative grid grid-cols-3">
                            {/* Connector track (inset) with green progress */}
                            <div className="neu-inset-sm absolute left-[16.66%] right-[16.66%] top-[17px] h-1.5 overflow-hidden rounded-full">
                                <div
                                    className="h-full rounded-full bg-secondary transition-all duration-500"
                                    style={{
                                        width: step === 0 ? "0%" : step === 1 ? "50%" : "100%",
                                    }}
                                />
                            </div>

                            {steps.map((item, index) => {
                                const active = index === step;
                                const completed = index < step;

                                return (
                                    <button
                                        key={item.title}
                                        type="button"
                                        onClick={() => {
                                            if (index < step) {
                                                setStep(index);
                                                setMessage("");
                                                setSuccess(false);
                                            }
                                        }}
                                        disabled={index >= step}
                                        className="relative z-10 flex min-w-0 flex-col items-center text-center disabled:cursor-default"
                                    >
                                        <span
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                                active
                                                    ? "neu-btn-primary scale-110"
                                                    : completed
                                                    ? "neu-raised-sm text-secondary"
                                                    : "neu-inset-sm text-outline"
                                            }`}
                                        >
                                            {completed ? (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    className="h-5 w-5"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                >
                                                    <path
                                                        d="m5 12 4 4L19 6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : (
                                                index + 1
                                            )}
                                        </span>

                                        <span
                                            className={`mt-3 max-w-full px-1 text-xs font-bold sm:text-sm ${
                                                active || completed
                                                    ? "text-primary"
                                                    : "text-on-surface-variant"
                                            }`}
                                        >
                                            {item.title}
                                        </span>

                                        <span className="mt-1 hidden text-xs text-outline sm:block">
                                            {item.subtitle}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form content */}
                    <form onSubmit={nextStep} className="px-5 py-7 sm:px-10 sm:py-9">
                        {/* STEP 1 */}
                        {step === 0 && (
                            <div>
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                                        Step 01
                                    </span>
                                    <h2 className="mt-1 text-xl font-bold text-primary sm:text-2xl">
                                        Account & identity
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                                        Enter your contact details and identity information.
                                    </p>
                                </div>

                                <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                                    <TextField
                                        label="Full name"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={updateField}
                                        required
                                        placeholder="Enter your full name"
                                    />

                                    <TextField
                                        label="Mobile number"
                                        name="mobile"
                                        value={form.mobile}
                                        onChange={updateField}
                                        required
                                        type="tel"
                                        maxLength={10}
                                        placeholder="10-digit mobile number"
                                        hint="OTP verification requires backend integration."
                                    />

                                    <TextField
                                        label="Email address"
                                        name="email"
                                        value={form.email}
                                        onChange={updateField}
                                        type="email"
                                        placeholder="you@example.com"
                                        hint="Recommended for account recovery and communication."
                                    />

                                    <TextField
                                        label="Aadhaar number"
                                        name="aadhaar"
                                        value={form.aadhaar}
                                        onChange={updateField}
                                        type="password"
                                        maxLength={12}
                                        placeholder="Enter only if required"
                                        hint="Collect only when legally necessary and with appropriate safeguards."
                                    />

                                    <TextField
                                        label="PAN number"
                                        name="pan"
                                        value={form.pan}
                                        onChange={(event) =>
                                            updateField({
                                                target: {
                                                    name: "pan",
                                                    value: event.target.value.toUpperCase(),
                                                },
                                            })
                                        }
                                        maxLength={10}
                                        placeholder="ABCDE1234F"
                                        hint="Recommended; required where applicable."
                                    />

                                    <FileField
                                        label="PAN document"
                                        name="panDocument"
                                        onChange={updateFile}
                                        hint="Upload if required for seller verification."
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 1 && (
                            <div>
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                                        Step 02
                                    </span>
                                    <h2 className="mt-1 text-xl font-bold text-primary sm:text-2xl">
                                        Business details
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                                        Tell us about your business and order pickup location.
                                    </p>
                                </div>

                                <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                                    <TextField
                                        label="Business / shop name"
                                        name="businessName"
                                        value={form.businessName}
                                        onChange={updateField}
                                        required
                                        placeholder="Enter business name"
                                    />

                                    <Field label="Business type" required>
                                        <select
                                            className={inputClass}
                                            name="businessType"
                                            value={form.businessType}
                                            onChange={updateField}
                                            required
                                        >
                                            <option value="">Select business type</option>
                                            <option value="farmer">Individual farmer</option>
                                            <option value="sole-proprietor">Sole proprietor</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="company">Company / LLP</option>
                                            <option value="cooperative">Cooperative / FPO</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </Field>

                                    <div className="md:col-span-2">
                                        <TextField
                                            label="Business / pickup address"
                                            name="address"
                                            value={form.address}
                                            onChange={updateField}
                                            required
                                            placeholder="House, street, village or locality"
                                        />
                                    </div>

                                    <TextField
                                        label="City / village"
                                        name="city"
                                        value={form.city}
                                        onChange={updateField}
                                        required
                                        placeholder="Enter city or village"
                                    />

                                    <TextField
                                        label="State"
                                        name="state"
                                        value={form.state}
                                        onChange={updateField}
                                        required
                                        placeholder="Enter state"
                                    />

                                    <TextField
                                        label="PIN code"
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={updateField}
                                        required
                                        maxLength={6}
                                        placeholder="6-digit PIN code"
                                    />

                                    <TextField
                                        label="GSTIN"
                                        name="gstin"
                                        value={form.gstin}
                                        onChange={(event) =>
                                            updateField({
                                                target: {
                                                    name: "gstin",
                                                    value: event.target.value.toUpperCase(),
                                                },
                                            })
                                        }
                                        maxLength={15}
                                        placeholder="If applicable"
                                        hint="Required where applicable."
                                    />

                                    <TextField
                                        label="Business registration number"
                                        name="registrationNumber"
                                        value={form.registrationNumber}
                                        onChange={updateField}
                                        placeholder="If applicable"
                                    />

                                    <TextField
                                        label="Product-specific licence"
                                        name="productLicence"
                                        value={form.productLicence}
                                        onChange={updateField}
                                        placeholder="If applicable"
                                        hint="Certain regulated products may require a licence."
                                    />

                                    <FileField
                                        label="Business registration proof"
                                        name="businessProof"
                                        onChange={updateFile}
                                        hint="Upload when applicable."
                                    />

                                    <FileField
                                        label="Product licence document"
                                        name="licenceDocument"
                                        onChange={updateFile}
                                        hint="Upload when required for the products you sell."
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 2 && (
                            <div>
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                                        Step 03
                                    </span>
                                    <h2 className="mt-1 text-xl font-bold text-primary sm:text-2xl">
                                        Bank details & review
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                                        Add your payout details and review your registration.
                                    </p>
                                </div>

                                <div className="neu-inset mb-7 flex gap-3 rounded-2xl p-4">
                                    <span className="neu-raised-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg">
                                        🔒
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-primary">
                                            Secure payout details
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                                            Bank details are needed before payouts. Your backend
                                            should protect sensitive information and restrict access.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                                    <TextField
                                        label="Account holder name"
                                        name="bankAccountName"
                                        value={form.bankAccountName}
                                        onChange={updateField}
                                        required
                                        placeholder="Name as per bank records"
                                    />

                                    <TextField
                                        label="IFSC code"
                                        name="ifsc"
                                        value={form.ifsc}
                                        onChange={(event) =>
                                            updateField({
                                                target: {
                                                    name: "ifsc",
                                                    value: event.target.value.toUpperCase(),
                                                },
                                            })
                                        }
                                        required
                                        maxLength={11}
                                        placeholder="e.g. SBIN0001234"
                                    />

                                    <TextField
                                        label="Bank account number"
                                        name="accountNumber"
                                        value={form.accountNumber}
                                        onChange={updateField}
                                        required
                                        type="password"
                                        placeholder="Enter account number"
                                    />

                                    <TextField
                                        label="Confirm account number"
                                        name="confirmAccountNumber"
                                        value={form.confirmAccountNumber}
                                        onChange={updateField}
                                        required
                                        type="password"
                                        placeholder="Re-enter account number"
                                    />

                                    <div className="md:col-span-2">
                                        <FileField
                                            label="Cancelled cheque / bank proof"
                                            name="bankProof"
                                            onChange={updateFile}
                                            hint="Recommended to verify bank details; follow your payout provider's requirements."
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-primary/10 pt-6">
                                    <h3 className="mb-4 text-base font-bold text-primary">
                                        Review your details
                                    </h3>

                                    <div className="neu-inset grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
                                        {[
                                            ["Full name", form.fullName],
                                            ["Mobile number", form.mobile],
                                            ["Email", form.email],
                                            ["Business name", form.businessName],
                                            [
                                                "Business location",
                                                [form.city, form.state, form.pincode]
                                                    .filter(Boolean)
                                                    .join(", "),
                                            ],
                                            ["Bank account holder", form.bankAccountName],
                                        ].map(([label, value]) => (
                                            <div key={label} className="min-w-0">
                                                <p className="text-xs text-on-surface-variant">{label}</p>
                                                <p className="mt-1 break-words text-sm font-semibold text-on-surface">
                                                    {value || "Not entered"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-on-surface-variant">
                                        <input
                                            type="checkbox"
                                            checked={accepted}
                                            onChange={(event) => setAccepted(event.target.checked)}
                                            className="mt-1 h-4 w-4 accent-secondary"
                                        />
                                        <span>
                                            I confirm that the information provided is accurate and
                                            agree to the seller registration terms and applicable
                                            verification requirements.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Feedback */}
                        {message && (
                            <div
                                role="status"
                                className={`neu-inset mt-6 rounded-xl px-4 py-3 text-sm font-medium ${
                                    success ? "text-secondary" : "text-error"
                                }`}
                            >
                                {message}
                            </div>
                        )}

                        {/* Bottom navigation */}
                        <div className="mt-8 flex flex-col-reverse gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            {step === 0 ? (
                                <Link
                                    to="/"
                                    className="neu-btn rounded-xl px-5 py-3 text-center text-sm font-semibold text-on-surface-variant"
                                >
                                    ← Back to home
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={previousStep}
                                    className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-on-surface"
                                >
                                    ← Previous
                                </button>
                            )}

                            <button
                                type="submit"
                                className="neu-btn-primary rounded-xl px-7 py-3 text-sm font-bold"
                            >
                                {step === 2 ? "Submit registration →" : "Continue →"}
                            </button>
                        </div>
                    </form>
                </section>

                <p className="mt-6 text-center text-sm text-on-surface-variant">
                    Already have a seller account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-secondary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}