import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
}

interface AdminPost {
  id: string;
  userId: string;
  caption: string;
  status: string;
  platform: string;
}

interface AdminIdea {
  id: string;
  userId: string;
  topic: string;
}

interface AdminSubscription {
  id: string;
  userId: string;
  status: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (user?.role !== "admin") {
    return <div>Yetkisiz</div>;
  }

  const { data: users = [] } = useQuery<AdminUser[]>({ queryKey: ["/api/admin/users"] });
  const { data: posts = [] } = useQuery<AdminPost[]>({ queryKey: ["/api/admin/posts"] });
  const { data: ideas = [] } = useQuery<AdminIdea[]>({ queryKey: ["/api/admin/ideas"] });
  const { data: subs = [] } = useQuery<AdminSubscription[]>({ queryKey: ["/api/admin/subscriptions"] });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Kullanıcı silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (err: any) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/posts/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Gönderi silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (err: any) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/ideas/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Fikir silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
    },
    onError: (err: any) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  const deleteSub = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/subscriptions/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Abonelik silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
    },
    onError: (err: any) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
        <TabsTrigger value="posts">Gönderiler</TabsTrigger>
        <TabsTrigger value="ideas">Fikirler</TabsTrigger>
        <TabsTrigger value="subs">Abonelikler</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td>{u.email}</td>
                    <td>{u.plan}</td>
                    <td>{u.role}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser.mutate(u.id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="posts">
        <Card>
          <CardHeader>
            <CardTitle>Gönderiler</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>ID</th>
                  <th>Kullanıcı</th>
                  <th>Platform</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td>{p.id}</td>
                    <td>{p.userId}</td>
                    <td>{p.platform}</td>
                    <td>{p.status}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePost.mutate(p.id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ideas">
        <Card>
          <CardHeader>
            <CardTitle>İçerik Fikirleri</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>ID</th>
                  <th>Kullanıcı</th>
                  <th>Konu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td>{i.id}</td>
                    <td>{i.userId}</td>
                    <td>{i.topic}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteIdea.mutate(i.id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subs">
        <Card>
          <CardHeader>
            <CardTitle>Abonelikler</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>ID</th>
                  <th>Kullanıcı</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td>{s.id}</td>
                    <td>{s.userId}</td>
                    <td>{s.status}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSub.mutate(s.id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

