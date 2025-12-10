import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "@shared/schema";
import { categoryColors } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementDetailModal({
  announcement,
  isOpen,
  onClose,
}: AnnouncementDetailModalProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser || !isOpen || !announcement) {
    return null;
  }

  const colors = categoryColors[announcement.category];
  const timeAgo = formatDistanceToNow(new Date(announcement.createdAt), {
    addSuffix: true,
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div
          className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl shadow-2xl z-10`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: { 
              type: "spring", 
              duration: 0.6 
            } 
          }}
          exit={{ 
            scale: 0.9, 
            opacity: 0, 
            y: 20,
            transition: { 
              duration: 0.3 
            } 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Close Button */}
            <div className="flex justify-between items-start mb-4">
              <Badge
                className={`${colors.badge} backdrop-blur-md border rounded-full px-4 py-1.5 text-sm font-medium`}
              >
                {announcement.category}
              </Badge>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:text-white/80 hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                {announcement.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{announcement.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{timeAgo}</span>
                </div>
                
                {/* Event Date if present */}
                {announcement.eventDate?.from && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {announcement.eventDate.to
                        ? `${new Date(announcement.eventDate.from).toLocaleDateString()} - ${new Date(announcement.eventDate.to).toLocaleDateString()}`
                        : `On ${new Date(announcement.eventDate.from).toLocaleDateString()}`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Image if present */}
            {announcement.imageUrl && (
              <div className="mb-6">
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            )}

            {/* AI Summary if present */}
            {announcement.summary && (
              <div className="mb-6 p-5 rounded-xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    AI Summary
                  </span>
                </div>
                <p className="text-base text-foreground/90 leading-relaxed">
                  {announcement.summary}
                </p>
              </div>
            )}

            {/* Full Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}