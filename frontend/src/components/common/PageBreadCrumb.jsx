import { Link } from "react-router-dom";

export default function PageBreadcrumb({ pageTitle, items }) {
  // ← NẾU KHÔNG CÓ items → DÙNG LAYOUT CŨ
  if (!items) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {pageTitle}
        </h2>
        <nav>
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                to="/dashboard"
              >
                Dashboard
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">
              {pageTitle}
            </li>
          </ol>
        </nav>
      </div>
    );
  }

  // ← NẾU CÓ items → DÙNG LAYOUT MỚI (LINH HOẠT HƠN)
  return (
    <div className="mb-6">
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {item.path ? (
              <Link 
                to={item.path} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
          </span>
        ))}
      </nav>
      {pageTitle && (
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      )}
    </div>
  );
}