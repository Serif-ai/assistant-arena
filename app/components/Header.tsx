"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold">Assistant Arena</span>
          </div>
          <nav className="flex items-center space-x-8 ml-8">
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
        </div>
      </div>
    </header>
  );
} 