import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnnouncementCategory } from "@shared/schema";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: AnnouncementCategory | "All";
  onCategoryChange: (category: AnnouncementCategory | "All") => void;
}

const categories: Array<AnnouncementCategory | "All"> = [
  "All",
  "Academic",
  "Events",
  "General",
];

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: SearchFilterBarProps) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 h-12 backdrop-blur-md bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-primary/50"
              data-testid="input-search"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Button
                  key={category}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-4 transition-all ${
                    isSelected
                      ? "shadow-lg"
                      : "backdrop-blur-md bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50"
                  }`}
                  data-testid={`button-filter-${category.toLowerCase()}`}
                >
                  {category}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
