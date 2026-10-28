import React, { useMemo, useState } from 'react';
import ProductManagementSkeleton from '../Skeliton/ProductManagementSkeleton';
import { useSimulatedLoading, useToast } from '../hooks/useProductManagement';
import {
    CATEGORY_OPTIONS,
    INITIAL_CATALOG,
    money,
    inputBase,
} from '../utils/useProductManagementUtils';

const emptyForm = { id: '', category: CATEGORY_OPTIONS[0], name: '', brand: '', price: '' };

const ProductManagement = () => {
    const isLoading = useSimulatedLoading(650);
    const { toast, notify } = useToast(2800);

    const [catalog, setCatalog] = useState(INITIAL_CATALOG);
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');

    const visibleProducts = useMemo(() => {
        const q = query.trim().toLowerCase();
        return catalog.filter((p) => {
            const matchesQuery = [p.id, p.name, p.brand, p.category].some((v) =>
                v.toLowerCase().includes(q)
            );
            const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
            return matchesQuery && matchesCategory;
        });
    }, [catalog, query, categoryFilter]);

    const updateField = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        setError('');
    };

    const openForm = () => {
        setForm(emptyForm);
        setError('');
        setShowForm(true);
    };

    const saveProduct = (event) => {
        event.preventDefault();

        const id = form.id.trim().toUpperCase();
        const name = form.name.trim();
        const brand = form.brand.trim();
        const price = Number(form.price);

        if (!id || !name || !brand) {
            setError('Product ID, name and brand are required.');
            return;
        }
        if (!Number.isFinite(price) || price <= 0) {
            setError('Enter a valid price greater than 0.');
            return;
        }
        if (catalog.some((p) => p.id === id)) {
            setError('A product with this ID already exists.');
            return;
        }

        setCatalog((prev) => [{ id, category: form.category, name, brand, price }, ...prev]);
        setShowForm(false);
        setQuery('');
        setCategoryFilter('ALL');
        notify('Product added to catalog.');
    };

    if (isLoading) return <ProductManagementSkeleton />;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
                        Product Catalog
                    </h1>
                    <p className="mt-1 text-sm text-on-surface-variant">
                        Add catalog to the catalog and view all catalog items.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openForm}
                    className="neu-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Catalog
                </button>
            </div>

            {/* Catalog */}
            <section className="neu-raised overflow-hidden rounded-2xl">
                <div className="flex flex-col gap-3 border-b border-primary/10 p-4 sm:p-6 md:flex-row">
                    <div className={`${inputBase} flex items-center px-4 md:max-w-sm md:flex-1`}>
                        <span className="material-symbols-outlined mr-2 text-[20px] text-outline">
                            search
                        </span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by ID, name, brand..."
                            className="w-full bg-transparent outline-none placeholder:text-outline"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={`${inputBase} px-4`}
                    >
                        <option value="ALL">All categories</option>
                        {CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-outline">
                            <tr>
                                {['ID', 'Name', 'Category', 'Brand', 'Price'].map((h) => (
                                    <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-primary/10">
                            {visibleProducts.map((p) => (
                                <tr key={p.id} className="transition-colors hover:bg-primary/5">
                                    <td className="px-5 py-4 text-xs font-semibold text-outline">{p.id}</td>
                                    <td className="px-5 py-4 font-semibold text-primary">{p.name}</td>
                                    <td className="px-5 py-4 text-on-surface-variant">{p.category}</td>
                                    <td className="px-5 py-4 text-on-surface-variant">{p.brand}</td>
                                    <td className="px-5 py-4 font-semibold text-primary">{money(p.price)}</td>
                                </tr>
                            ))}

                            {visibleProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-14 text-center text-outline">
                                        No products found in the catalog.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Add product modal */}
            {showForm && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <div className="my-auto w-full max-w-xl rounded-2xl bg-surface p-5 shadow-2xl sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-extrabold text-primary">Add catalog</h2>
                                <p className="mt-1 text-sm text-on-surface-variant">
                                    Add a new item to the product catalog.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="neu-btn flex h-10 w-10 items-center justify-center rounded-xl"
                                aria-label="Close form"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={saveProduct} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Product ID</label>
                                    <input
                                        required
                                        value={form.id}
                                        onChange={updateField('id')}
                                        placeholder="PRODUCT01"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={updateField('category')}
                                        className={`${inputBase} w-full px-4`}
                                    >
                                        {CATEGORY_OPTIONS.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-primary">Product name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={updateField('name')}
                                    placeholder="Tomato Seeds"
                                    className={`${inputBase} w-full px-4`}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Brand</label>
                                    <input
                                        required
                                        value={form.brand}
                                        onChange={updateField('brand')}
                                        placeholder="AgroGrow"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.price}
                                        onChange={updateField('price')}
                                        placeholder="450"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-xs text-rose-600">{error}</p>}

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button type="submit" className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                                    Add to catalog
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className="neu-raised fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl px-5 py-3 text-sm font-semibold text-secondary"
                >
                    {toast}
                </div>
            )}
        </div>
    );
};

export default ProductManagement;