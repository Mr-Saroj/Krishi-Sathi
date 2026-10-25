
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import RegisterSkeleton from "./Skeliton/RegisterSkeleton";


export default function Register() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <RegisterSkeleton />;
    }

    return (
        <main className="min-h-screen bg-surface px-4 pb-12 pt-12 sm:px-6 sm:pt-14 lg:pt-22">
            <div className="mx-auto max-w-5xl">
                {/* Page heading */}
                <header className="mb-8 text-center sm:mb-10">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                        <Link
                            to="/"
                            className="neu-raised flex h-20 w-20 items-center justify-center rounded-3xl"
                        >
                            <img
                                src="/dashboard_icon.png"
                                alt="Krishi Sathi AI"
                                className="h-12 w-12 object-contain"
                            />
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        Become a seller
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-on-surface-variant sm:text-base">
                        Register your farming business and connect with more customers
                        through Krishi Sathi AI.
                    </p>
                </header>

                {/* Registration form */}
                <RegisterForm />

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
