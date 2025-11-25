import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  LogOut,
  TrendingUp,
  FileText,
  Calendar,
  Sparkles,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementCard } from "@/components/announcement-card";
import { useAuth } from "@/hooks/useAuth";
import type {
  Announcement,
  InsertAnnouncement,
  AnnouncementCategory,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated, loginUrl } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("General");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access the admin dashboard",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast, loginUrl]);

  // Fetch announcements
  const { data: announcements = [], refetch } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // Create/Update mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = editingId
        ? `/api/announcements/${editingId}`
        : "/api/announcements";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: editingId ? "Announcement updated" : "Announcement created",
        description: "Successfully saved the announcement",
      });
      resetForm();
      refetch();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to save announcement",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Announcement deleted",
        description: "Successfully deleted the announcement",
      });
      refetch();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please enter announcement content first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await apiRequest("POST", "/api/summarize", {
        text: content,
      });
      const data = await response;

      if (data.summary) {
        toast({
          title: "Summary generated",
          description: "AI summary has been created successfully",
        });
      } else if (data.message) {
        toast({
          title: "AI Unavailable",
          description: data.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    createMutation.mutate(formData);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setCategory(announcement.category);
    if (announcement.imageUrl) {
      setImagePreview(announcement.imageUrl);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("General");
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Announcements",
      value: announcements.length,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Academic",
      value: announcements.filter((a) => a.category === "Academic").length,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Events",
      value: announcements.filter((a) => a.category === "Events").length,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "General",
      value: announcements.filter((a) => a.category === "General").length,
      icon: Bell,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-b border-white/20 dark:border-gray-700/30 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Welcome, {user?.firstName || user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/board")}
                className="backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
                data-testid="button-view-board"
              >
                View Board
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                className="backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-lg bg-white/40 dark:bg-gray-900/40 border-white/20 dark:border-gray-700/30">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 mb-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Creation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-lg bg-white/40 dark:bg-gray-900/40 border-white/20 dark:border-gray-700/30 mb-8">
            <CardHeader className="border-b border-white/20 dark:border-gray-700/30 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">
                  {editingId ? "Edit Announcement" : "Create New Announcement"}
                </h2>
                {editingId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title"
                    className="mt-2 backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="flex gap-2 mt-2">
                    {(["Academic", "Events", "General"] as const).map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant={category === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategory(cat)}
                        className={
                          category !== cat
                            ? "backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
                            : ""
                        }
                        data-testid={`button-category-${cat.toLowerCase()}`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content">Content *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary || !content.trim()}
                      className="backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
                      data-testid="button-generate-summary"
                    >
                      {isGeneratingSummary ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate AI Summary
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter announcement content"
                    rows={6}
                    className="backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
                    data-testid="textarea-content"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image (optional)</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          data-testid="button-remove-image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border-white/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload image
                        </p>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          data-testid="input-image"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={createMutation.isPending}
                  className="w-full"
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Update Announcement
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Announcement
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-display font-bold mb-6">
            Recent Announcements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                index={index}
                isAdmin
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
