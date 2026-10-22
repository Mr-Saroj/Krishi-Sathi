import React, { useState } from 'react';
import ProductManagementSkeleton from '../Skeliton/ProductManagementSkeleton';
import {
    useSimulatedLoading,
    useToast,
    useProductStats,
    useVisibleProducts,
} from '../hooks/useProductManagement';
import {
    INITIAL_CATEGORIES,
    INITIAL_BRANDS,
    INITIAL_PRODUCTS,
    INITIAL_COMPLAINTS,
    money,
    statusStyles,
    inputBase,
    slugify,
    parseAttributes,
} from '../utils/useProductManagementUtils';

const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${statusStyles[status] || 'bg-primary/5 text-on-surface-variant'
            }`}
    >
        {status}
    </span>
);

const ProductManagement = () => {
    const isLoading = useSimulatedLoading(650);
    const { toast, notify } = useToast(2800);

    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
    const [brands, setBrands] = useState(INITIAL_BRANDS);

    const [tab, setTab] = useState('products');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState('');

    const [showProductForm, setShowProductForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        category: 'Seeds',
        brand: '',
        price: '',
        stock: '',
        attributes: '',
    });

    const [newBrand, setNewBrand] = useState('');

    const stats = useProductStats(products, complaints);
    const visibleProducts = useVisibleProducts({
        products,
        complaints,
        query,
        statusFilter,
        categoryFilter,
        tab,
    });

    const updateProduct = (id, patch, message) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        );
        if (message) notify(message);
    };

    const approveProduct = (id) => {
        updateProduct(id, { status: 'APPROVED' }, 'Product listing approved.');
    };

    const rejectProduct = (id) => {
        updateProduct(id, { status: 'REJECTED' }, 'Product listing rejected.');
    };

    const removeProduct = (id) => {
        const confirmed = window.confirm(
            'Remove this listing? It will no longer appear in active product listings.'
        );
        if (!confirmed) return;

        updateProduct(
            id,
            { status: 'REMOVED', priceChangePending: false },
            'Product listing removed.'
        );
        setSelectedProduct(null);
    };

    const reviewPrice = (id, approved) => {
        setProducts((prev) =>
            prev.map((p) => {
                if (p.id !== id) return p;

                return {
                    ...p,
                    previousPrice: approved ? p.price : p.previousPrice,
                    priceChangePending: false,
                };
            })
        );

        notify(approved ? 'Price change approved.' : 'Price change rejected.');
    };

    const resolveComplaint = (id) => {
        setComplaints((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, status: 'RESOLVED' } : c
            )
        );
        notify('Complaint marked as resolved.');
    };

    const addCategory = (event) => {
        event.preventDefault();

        const name = categoryName.trim();
        if (!name) {
            setCategoryError('Enter a category name.');
            return;
        }

        if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
            setCategoryError('This category already exists.');
            return;
        }

        setCategories((prev) => [
            ...prev,
            {
                id: Math.max(0, ...prev.map((c) => c.id)) + 1,
                name,
                slug: slugify(name),
                count: 0,
                status: 'ACTIVE',
            },
        ]);

        setCategoryName('');
        setCategoryError('');
        setShowCategoryForm(false);
        notify('Category created.');
    };

    const toggleCategory = (id) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
                    : c
            )
        );
        notify('Category status updated.');
    };

    const addBrand = (event) => {
        event.preventDefault();
        const brand = newBrand.trim();

        if (!brand) return;

        if (brands.some((b) => b.toLowerCase() === brand.toLowerCase())) {
            notify('This brand already exists.');
            return;
        }

        setBrands((prev) => [...prev, brand]);
        setNewBrand('');
        notify('Brand added.');
    };

    const openProductForm = () => {
        setProductForm({
            name: '',
            category: categories.find((c) => c.status === 'ACTIVE')?.name || 'Seeds',
            brand: brands[0] || '',
            price: '',
            stock: '',
            attributes: '',
        });
        setShowProductForm(true);
    };

    const saveProduct = (event) => {
        event.preventDefault();

        const name = productForm.name.trim();
        const price = Number(productForm.price);
        const stock = Number(productForm.stock);

        if (!name || !Number.isFinite(price) || price <= 0 ||
            !Number.isInteger(stock) || stock < 0) {
            notify('Enter a product name, valid price and non-negative stock.');
            return;
        }

        const attributes = parseAttributes(productForm.attributes);

        const id = `PRD-${Date.now().toString().slice(-6)}`;

        setProducts((prev) => [
            {
                id,
                name,
                category: productForm.category,
                brand: productForm.brand.trim() || 'Unbranded',
                seller: 'Admin-created listing',
                price,
                previousPrice: price,
                stock,
                status: 'PENDING',
                attributes,
                complaints: 0,
                priceChangePending: false,
                image: 'inventory_2',
            },
            ...prev,
        ]);

        setShowProductForm(false);
        setTab('products');
        setStatusFilter('ALL');
        setCategoryFilter('ALL');
        setQuery('');
        notify('Product created and submitted for approval.');
    };

    if (isLoading) {
        return <ProductManagementSkeleton />;
    }

    const tabs = [
        ['products', 'All products'],
        ['categories', 'Categories & brands'],
        ['priceChanges', `Price reviews (${products.filter((p) => p.priceChangePending && p.status !== 'REMOVED').length})`],
        ['complaints', `Complaints (${complaints.filter((c) => c.status === 'OPEN').length})`],
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
                        Product & Category Management
                    </h1>
                    <p className="mt-1 text-sm text-on-surface-variant">
                        Approve listings, manage categories and brands, review prices and handle complaints.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openProductForm}
                    className="neu-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add product
                </button>
            </div>

            {/* Stats */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Total Listings', value: stats.total, icon: 'inventory_2', color: 'text-violet-600', sub: 'ALL PRODUCTS' },
                    { label: 'Pending Approval', value: stats.pending, icon: 'pending_actions', color: 'text-amber-600', sub: 'NEEDS REVIEW' },
                    { label: 'Approved Products', value: stats.approved, icon: 'verified', color: 'text-emerald-600', sub: 'LIVE LISTINGS' },
                    { label: 'Items Needing Review', value: stats.issues, icon: 'report_problem', color: 'text-rose-600', sub: 'PRICES & ISSUES' },
                ].map((item) => (
                    <div key={item.label} className="neu-raised rounded-2xl p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-on-surface-variant">{item.label}</p>
                                <p className="mt-3 text-2xl font-extrabold text-primary">
                                    {item.value}
                                </p>
                                <p className="mt-2 text-[10px] font-bold tracking-wider text-outline">
                                    {item.sub}
                                </p>
                            </div>
                            <div className={`neu-inset flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                                <span className="material-symbols-outlined text-2xl">
                                    {item.icon}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Main management area */}
            <section className="neu-raised overflow-hidden rounded-2xl">
                {/* Tabs */}
                <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:p-6">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {tabs.map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setTab(key);
                                    setStatusFilter('ALL');
                                }}
                                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${tab === key
                                        ? 'neu-raised-sm text-primary'
                                        : 'text-on-surface-variant hover:text-primary'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab !== 'categories' && (
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className={`${inputBase} flex items-center px-4 md:max-w-sm md:flex-1`}>
                                <span className="material-symbols-outlined mr-2 text-[20px] text-outline">
                                    search
                                </span>
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search product, brand, seller..."
                                    className="w-full bg-transparent outline-none placeholder:text-outline"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                                className={`${inputBase} px-4`}
                            >
                                <option value="ALL">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className={`${inputBase} px-4`}
                            >
                                <option value="ALL">All statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Products and price reviews */}
                {(tab === 'products' || tab === 'priceChanges') && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-outline">
                                <tr>
                                    {[
                                        'Product',
                                        'Category / Brand',
                                        'Price',
                                        'Stock',
                                        'Status',
                                        'Actions',
                                    ].map((heading) => (
                                        <th key={heading} className="px-5 py-4 font-semibold">
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-primary/10">
                                {visibleProducts.map((product) => (
                                    <tr key={product.id} className="transition-colors hover:bg-primary/5">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="neu-inset flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-secondary">
                                                    <span className="material-symbols-outlined text-xl">
                                                        {product.image}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary">{product.name}</p>
                                                    <p className="mt-1 text-xs text-outline">
                                                        {product.id} · {product.seller}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-primary">{product.category}</p>
                                            <p className="mt-1 text-xs text-on-surface-variant">{product.brand}</p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-primary">{money(product.price)}</p>
                                            {product.priceChangePending && (
                                                <p className="mt-1 text-xs text-amber-600">
                                                    Previously {money(product.previousPrice)}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-on-surface-variant">
                                            {product.stock} units
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge status={product.status} />
                                            {product.complaints > 0 && (
                                                <p className="mt-2 text-xs text-rose-600">
                                                    {product.complaints} complaint(s)
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProduct(product)}
                                                    title="View product details and attributes"
                                                    className="neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-primary"
                                                >
                                                    View
                                                </button>

                                                {tab === 'priceChanges' ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => reviewPrice(product.id, true)}
                                                            className="neu-btn-primary rounded-lg px-3 py-2 text-xs font-semibold"
                                                        >
                                                            Approve price
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => reviewPrice(product.id, false)}
                                                            className="neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-rose-600"
                                                        >
                                                            Reject price
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {product.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => approveProduct(product.id)}
                                                                    className="neu-btn-primary rounded-lg px-3 py-2 text-xs font-semibold"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => rejectProduct(product.id)}
                                                                    className="neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-rose-600"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => removeProduct(product.id)}
                                                            className="neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-rose-600"
                                                        >
                                                            Remove
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {visibleProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center text-outline">
                                            No products found for this view.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Category and brand management */}
                {tab === 'categories' && (
                    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-bold text-primary">Product categories</h2>
                                    <p className="mt-1 text-xs text-on-surface-variant">
                                        Organize products into catalog categories.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryForm((value) => !value)}
                                    className="neu-btn-primary whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold"
                                >
                                    + Add category
                                </button>
                            </div>

                            {showCategoryForm && (
                                <form onSubmit={addCategory} className="neu-inset space-y-3 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-primary">
                                        Category name
                                    </label>
                                    <input
                                        autoFocus
                                        value={categoryName}
                                        onChange={(event) => {
                                            setCategoryName(event.target.value);
                                            setCategoryError('');
                                        }}
                                        placeholder="e.g. Pesticides"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                    {categoryError && (
                                        <p className="text-xs text-rose-600">{categoryError}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <button type="submit" className="neu-btn-primary rounded-lg px-4 py-2 text-xs font-semibold">
                                            Save category
                                        </button>
                                        <button type="button" onClick={() => setShowCategoryForm(false)} className="neu-btn rounded-lg px-4 py-2 text-xs">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="neu-raised flex items-center justify-between gap-3 rounded-xl p-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="neu-inset flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-secondary">
                                                <span className="material-symbols-outlined">category</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-primary">{category.name}</p>
                                                <p className="mt-1 text-xs text-on-surface-variant">
                                                    {products.filter((p) => p.category === category.name && p.status !== 'REMOVED').length} listings · {category.slug}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <StatusBadge status={category.status} />
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category.id)}
                                                className="neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-primary"
                                            >
                                                {category.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Brands */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-bold text-primary">Brand management</h2>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    Maintain the brands available for product listings.
                                </p>
                            </div>

                            <form onSubmit={addBrand} className="flex gap-2">
                                <input
                                    value={newBrand}
                                    onChange={(event) => setNewBrand(event.target.value)}
                                    placeholder="Enter brand name"
                                    className={`${inputBase} min-w-0 flex-1 px-4`}
                                />
                                <button type="submit" className="neu-btn-primary rounded-xl px-4 py-2 text-xs font-semibold">
                                    Add brand
                                </button>
                            </form>

                            <div className="space-y-3">
                                {brands.map((brand) => (
                                    <div key={brand} className="neu-raised flex items-center justify-between rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-secondary">sell</span>
                                            <span className="text-sm font-semibold text-primary">{brand}</span>
                                        </div>
                                        <span className="text-xs text-on-surface-variant">
                                            {products.filter((p) => p.brand === brand && p.status !== 'REMOVED').length} products
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="neu-inset rounded-xl p-4">
                                <p className="text-sm font-semibold text-primary">Product attributes</p>
                                <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                                    Attributes are stored per listing, such as weight, crop, material, length and product type. Open any product using View to inspect its attributes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product complaints */}
                {tab === 'complaints' && (
                    <div className="space-y-3 p-4 sm:p-6">
                        {complaints
                            .filter((complaint) => {
                                const product = products.find((p) => p.id === complaint.productId);
                                return (
                                    product &&
                                    product.status !== 'REMOVED' &&
                                    complaint.status === 'OPEN' &&
                                    [
                                        product.name,
                                        product.id,
                                        product.brand,
                                        product.seller,
                                        complaint.reason,
                                    ].some((value) => value.toLowerCase().includes(query.toLowerCase())) &&
                                    (categoryFilter === 'ALL' || product.category === categoryFilter)
                                );
                            })
                            .map((complaint) => {
                                const product = products.find((p) => p.id === complaint.productId);
                                if (!product) return null;

                                return (
                                    <div key={complaint.id} className="neu-raised flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-primary">{product.name}</p>
                                                <StatusBadge status={complaint.status} />
                                            </div>
                                            <p className="mt-2 text-sm text-on-surface-variant">{complaint.reason}</p>
                                            <p className="mt-1 text-xs text-outline">
                                                {complaint.id} · {product.id} · {product.seller}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProduct(product)}
                                                className="neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-primary"
                                            >
                                                View product
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => resolveComplaint(complaint.id)}
                                                className="neu-btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
                                            >
                                                Resolve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(product.id)}
                                                className="neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-rose-600"
                                            >
                                                Remove listing
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                        {complaints.filter((c) => c.status === 'OPEN').length === 0 && (
                            <p className="py-12 text-center text-sm text-outline">
                                All product complaints have been resolved.
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Product details panel */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[80] flex justify-end bg-black/40">
                    <button
                        type="button"
                        aria-label="Close product details"
                        onClick={() => setSelectedProduct(null)}
                        className="absolute inset-0 cursor-default"
                    />

                    <aside className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-surface p-5 shadow-2xl sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-outline">
                                    Product details
                                </p>
                                <h2 className="mt-2 text-xl font-extrabold text-primary">
                                    {selectedProduct.name}
                                </h2>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    {selectedProduct.id}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProduct(null)}
                                className="neu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="neu-inset mt-6 flex h-32 items-center justify-center rounded-2xl text-secondary">
                            <span className="material-symbols-outlined text-5xl">
                                {selectedProduct.image}
                            </span>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Listing status</span>
                            <StatusBadge status={selectedProduct.status} />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {[
                                ['Price', money(selectedProduct.price)],
                                ['Stock', `${selectedProduct.stock} units`],
                                ['Category', selectedProduct.category],
                                ['Brand', selectedProduct.brand],
                                ['Seller', selectedProduct.seller],
                                ['Previous price', money(selectedProduct.previousPrice)],
                            ].map(([label, value]) => (
                                <div key={label} className="neu-raised rounded-xl p-3">
                                    <p className="text-xs text-outline">{label}</p>
                                    <p className="mt-2 break-words text-sm font-semibold text-primary">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h3 className="font-bold text-primary">Product attributes</h3>
                            <div className="mt-3 space-y-2">
                                {Object.entries(selectedProduct.attributes).map(([key, value]) => (
                                    <div key={key} className="flex justify-between gap-4 border-b border-primary/10 py-2 text-sm">
                                        <span className="text-on-surface-variant">{key}</span>
                                        <span className="text-right font-medium text-primary">{value}</span>
                                    </div>
                                ))}
                                {Object.keys(selectedProduct.attributes).length === 0 && (
                                    <p className="text-sm text-outline">No attributes added.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-2">
                            {selectedProduct.status === 'PENDING' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            approveProduct(selectedProduct.id);
                                            setSelectedProduct(null);
                                        }}
                                        className="neu-btn-primary rounded-xl px-4 py-3 text-sm font-semibold"
                                    >
                                        Approve listing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            rejectProduct(selectedProduct.id);
                                            setSelectedProduct(null);
                                        }}
                                        className="neu-btn rounded-xl px-4 py-3 text-sm font-semibold text-rose-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {selectedProduct.status !== 'REMOVED' && (
                                <button
                                    type="button"
                                    onClick={() => removeProduct(selectedProduct.id)}
                                    className="neu-btn rounded-xl px-4 py-3 text-sm font-semibold text-rose-600"
                                >
                                    Remove listing
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {/* Add product modal */}
            {showProductForm && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <div className="my-auto w-full max-w-xl rounded-2xl bg-surface p-5 shadow-2xl sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-extrabold text-primary">Add product</h2>
                                <p className="mt-1 text-sm text-on-surface-variant">
                                    New products will require admin approval.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowProductForm(false)}
                                className="neu-btn flex h-10 w-10 items-center justify-center rounded-xl"
                                aria-label="Close form"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={saveProduct} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-primary">Product name</label>
                                <input
                                    required
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    placeholder="Enter product name"
                                    className={`${inputBase} w-full px-4`}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Category</label>
                                    <select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className={`${inputBase} w-full px-4`}
                                    >
                                        {categories.filter((c) => c.status === 'ACTIVE').map((c) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Brand</label>
                                    <input
                                        list="product-brand-options"
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                        placeholder="Enter brand"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                    <datalist id="product-brand-options">
                                        {brands.map((brand) => <option key={brand} value={brand} />)}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        placeholder="450"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-primary">Stock quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                        placeholder="100"
                                        className={`${inputBase} w-full px-4`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-primary">
                                    Attributes
                                </label>
                                <input
                                    value={productForm.attributes}
                                    onChange={(e) => setProductForm({ ...productForm, attributes: e.target.value })}
                                    placeholder="Weight: 500 g, Crop: Tomato, Type: Hybrid"
                                    className={`${inputBase} w-full px-4`}
                                />
                                <p className="mt-2 text-xs text-outline">
                                    Separate attributes with commas and use Key: Value format.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button type="submit" className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                                    Create listing
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProductForm(false)}
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

            <div className="h-2 sm:h-4" />
        </div>
    );
};

export default ProductManagement;