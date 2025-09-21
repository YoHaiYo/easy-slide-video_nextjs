"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* 🧭 네비게이션 바 */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold text-green-600 flex items-center"
        >
          <i className="fas fa-video mr-2"></i>Easy Slide Video
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center space-x-4 text-sm md:text-base">
          <button className="hover:text-green-500 text-gray-600">
            <i className="fas fa-info-circle mr-1"></i>사용법
          </button>
          <button className="hover:text-green-500 text-gray-600">
            <i className="fas fa-question-circle mr-1"></i>도움말
          </button>
        </div>

        {/* 모바일 햄버거 아이콘 */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars text-2xl text-green-600"></i>
          </button>
        </div>
      </nav>

      {/* 📱 모바일 메뉴 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-2 py-4 border-b border-gray-200 bg-white">
          <button className="hover:text-green-500 text-gray-600">
            <i className="fas fa-info-circle mr-1"></i>사용법
          </button>
          <button className="hover:text-green-500 text-gray-600">
            <i className="fas fa-question-circle mr-1"></i>도움말
          </button>
        </div>
      )}
    </>
  );
}
