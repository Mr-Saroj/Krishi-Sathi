import React from 'react';
import { useNotFound } from '../../hooks/notFoundHooks';

const NotFound = () => {
  const { attemptedPath, goBack } = useNotFound();

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface px-4 py-10">
      <div className="neu-raised w-full max-w-xl rounded-3xl p-8 text-center sm:p-12">
        <div className="neu-inset mx-auto flex h-20 w-20 items-center justify-center rounded-full text-secondary">
          <span className="material-symbols-outlined text-4xl">travel_explore</span>
        </div>

        <p className="mt-6 text-7xl font-extrabold tracking-tight text-primary sm:text-8xl">404</p>
        <h1 className="mt-3 text-xl font-extrabold text-primary sm:text-2xl">Page not found</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
          The page you are looking for does not exist, was moved, or the address was mistyped.
        </p>

        <p className="neu-inset mx-auto mt-5 max-w-full overflow-x-auto whitespace-nowrap rounded-xl px-4 py-2.5 text-xs text-outline">
          {attemptedPath}
        </p>

        <button
          type="button"
          onClick={goBack}
          className="neu-btn-primary mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to last page
        </button>
      </div>
    </main>
  );
};

export default NotFound;