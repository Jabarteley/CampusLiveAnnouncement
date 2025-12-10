import { motion } from "framer-motion";
import { Calendar, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Announcement } from "@shared/schema";
import { categoryColors } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
  isAdmin?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
}

export function AnnouncementCard({
  announcement,
  index = 0,
  isAdmin = false,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const colors = categoryColors[announcement.category];
  const timeAgo = formatDistanceToNow(new Date(announcement.createdAt), {
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={`group relative overflow-hidden backdrop-blur-lg bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-lg ${colors.glow} hover:shadow-2xl transition-all duration-300 rounded-2xl`}
        data-testid={`card-announcement-${announcement.id}`}
      >
        {/* Category Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge
            className={`${colors.badge} backdrop-blur-md border rounded-full px-3 py-1 text-xs font-medium`}
            data-testid={`badge-category-${announcement.id}`}
          >
            {announcement.category}
          </Badge>
        </div>

        <div className="p-6 md:p-8">
          {/* Image if present */}
          {announcement.imageUrl && (
            <div className="mb-6 -mx-6 -mt-6 md:-mx-8 md:-mt-8">
              <img
                src={announcement.imageUrl}
                alt={announcement.title}
                className="w-full h-48 md:h-56 object-cover rounded-t-2xl"
                data-testid={`img-announcement-${announcement.id}`}
              />
            </div>
          )}

          {/* Title */}
          <h3
            className="text-xl md:text-2xl font-display font-bold mb-3 pr-20 text-foreground"
            data-testid={`text-title-${announcement.id}`}
          >
            {announcement.title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span data-testid={`text-author-${announcement.id}`}>
                {announcement.authorName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span data-testid={`text-time-${announcement.id}`}>{timeAgo}</span>
            </div>

            {/* Event Date if present */}
            {announcement.eventDate?.from && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span data-testid={`text-event-date-${announcement.id}`}>
                  {announcement.eventDate.to
                    ? `${new Date(announcement.eventDate.from).toLocaleDateString()} - ${new Date(announcement.eventDate.to).toLocaleDateString()}`
                    : `On ${new Date(announcement.eventDate.from).toLocaleDateString()}`
                  }
                </span>
              </div>
            )}
          </div>

          {/* AI Summary if present */}
          {announcement.summary && (
            <div className="mb-4 p-4 rounded-xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  AI Summary
                </span>
              </div>
              <p
                className="text-sm text-foreground/90 leading-relaxed"
                data-testid={`text-summary-${announcement.id}`}
              >
                {announcement.summary}
              </p>
            </div>
          )}

          {/* Content Preview */}
          <p
            className="text-base text-foreground/80 leading-relaxed line-clamp-4"
            data-testid={`text-content-${announcement.id}`}
          >
            {announcement.content}
          </p>

          {/* Admin Actions */}
          {isAdmin && (onEdit || onDelete) && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-white/20 dark:border-gray-700/30">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
                  onClick={() => onEdit(announcement)}
                  data-testid={`button-edit-${announcement.id}`}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="backdrop-blur-sm"
                  onClick={() => onDelete(announcement.id)}
                  data-testid={`button-delete-${announcement.id}`}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}