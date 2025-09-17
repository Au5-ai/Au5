import Link from "next/link";
import React, { JSX, useState } from "react";

type Custom404Props = {
  errorCode?: string;
  title?: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: {
    label: string;
    href?: string | null;
    onClick?: (() => void) | null;
  };
  showSearch?: boolean;
  className?: string;
};

export default function Custom404({
  errorCode = "404",
  title = "Not Found",
  description = "Looks like you've ventured into the unknown digital realm.",
  primaryAction = { label: "Return Home", href: "/" },
  showSearch = false,
  className = "",
}: Custom404Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="w-full max-w-md text-center">
        <h1
          className={`text-6xl font-bold tracking-tighter sm:text-7xl minimal`}>
          {errorCode}
        </h1>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {showSearch && (
          <form onSubmit={handleSearch} className="pt-4">
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 block px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search our site..."
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Search
              </button>
            </div>
          </form>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href={primaryAction.href}
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            prefetch={false}>
            {primaryAction.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
