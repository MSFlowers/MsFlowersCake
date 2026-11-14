"use client";

import { useEffect, useRef, useState } from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface CategoryPillTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  primaryCount?: number;
  activeColorClass?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  viewAllHref?: string;
}

export default function CategoryPillTabs({
  tabs,
  activeTab,
  onSelectTab,
  primaryCount = 6,
  activeColorClass = "bg-[#c8102e] text-white shadow-xs",
  viewAllLabel,
  onViewAll,
  viewAllHref,
}: CategoryPillTabsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If only 1 item would overflow into a dropdown, display it directly as a pill instead of an awkward 1-item menu
  const effectivePrimaryCount =
    tabs.length - primaryCount <= 1 ? tabs.length : primaryCount;
  const primaryTabs = tabs.slice(0, effectivePrimaryCount);
  const overflowTabs = tabs.slice(effectivePrimaryCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);
  const activeOverflowItem = overflowTabs.find((t) => t.id === activeTab);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-visible py-1 shrink-0">
      {/* Primary 1-Click Visible Pills */}
      {primaryTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSelectTab(tab.id);
            }}
            className={`shrink-0 text-xs 2xl:text-sm font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
              isActive
                ? activeColorClass
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 active:scale-95"
            }`}
          >
            {tab.label}
          </button>
        );
      })}

      {/* Overflow "More ▾" Pill Dropdown (Shown only when tabs exceed primaryCount) */}
      {overflowTabs.length > 0 && (
        <div ref={dropdownRef} className="relative inline-block text-left shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            className={`shrink-0 text-xs 2xl:text-sm font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isOverflowActive
                ? activeColorClass
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80"
            }`}
          >
            <span>
              {isOverflowActive && activeOverflowItem
                ? activeOverflowItem.label
                : "More"}
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.4}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Floating Dropdown Menu */}
          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 z-40 min-w-[190px] bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-1.5 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                More Categories
              </div>
              {overflowTabs.map((tab) => {
                const isSelected = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-[13px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-rose-50 text-[#c8102e]"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#c8102e]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Optional "View All" Link */}
      {viewAllLabel && (
        viewAllHref ? (
          <a
            href={viewAllHref}
            className="inline-flex items-center text-xs 2xl:text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors px-2 py-2 shrink-0 cursor-pointer"
          >
            <span>{viewAllLabel}</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center text-xs 2xl:text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors px-2 py-2 shrink-0 cursor-pointer"
          >
            <span>{viewAllLabel}</span>
          </button>
        )
      )}
    </div>
  );
}
