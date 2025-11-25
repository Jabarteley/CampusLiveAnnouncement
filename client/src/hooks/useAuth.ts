import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Handle 401 Unauthorized - user is not logged in
  const isUnauthorized = error?.message?.includes("401");

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isUnauthorized,
    loginUrl: "/api/login",
  };
}
