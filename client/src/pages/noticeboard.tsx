import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, RefreshCw } from "lucide-react";
import { AnnouncementCard } from "@/components/announcement-card";
import { SearchFilterBar } from "@/components/search-filter-bar";
import type { Announcement, AnnouncementCategory } from "@shared/schema";

export default function Noticeboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    AnnouncementCategory | "All"
  >("All");
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Fetch announcements with auto-refresh
  const { data: announcements = [], isLoading, refetch } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", lastRefresh],
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || announcement.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.12, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Campus Noticeboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time updates and announcements
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Auto-refreshing</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Announcements Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl backdrop-blur-lg bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/30 animate-pulse"
              />
            ))}
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredAnnouncements.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-gray-400/20 to-gray-500/20 border border-gray-400/30">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2 text-foreground">
              No announcements found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search or filters"
                : "Check back soon for updates"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
