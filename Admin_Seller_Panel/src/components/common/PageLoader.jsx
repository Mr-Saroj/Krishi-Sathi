// src/components/common/PageLoader.jsx

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="h-12 w-12 rounded-full border-4 border-green-100 border-t-green-700 animate-spin" />
    </div>
  );
}