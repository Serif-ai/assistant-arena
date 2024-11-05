"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  return (
    <>
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-8">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">Assistant Arena</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === "/"
                    ? "border-b-2 border-blue-500 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Assistant Arena
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === "/about"
                    ? "border-b-2 border-blue-500 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                About Us
              </Link>
            </nav>

            <button
              className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`px-2 py-2 rounded-md text-base font-medium transition-colors ${
                pathname === "/"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setIsDrawerOpen(false)}
            >
              Assistant Arena
            </Link>
            <Link
              href="/about"
              className={`px-2 py-2 rounded-md text-base font-medium transition-colors ${
                pathname === "/about"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setIsDrawerOpen(false)}
            >
              About Us
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
