import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
  role: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
