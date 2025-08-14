import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Brain, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Square,
  RotateCcw,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AutonomousStatus {
  isActive: boolean;
  tasksCount: number;
  activeFixes: number;
  systemHealth: {
    status: string;
    uptime: boolean;
    criticalIssues: number;
  };
  tasks: Record<string, any>;
}

interface HealthMetrics {
  timestamp: string;
  apiHealth: boolean;
  dbHealth: boolean;
  responseTime: number;
  memoryUsage: number;
  activeUsers: number;
}

interface Analysis {
  severity: string;
  summary: string;
  urgency: number;
  autoFixable: boolean;
  timestamp: string;
}

interface Fix {
  success: boolean;
  action: string;
  description: string;
  timestamp: string;
  changes: string[];
}

export default function AutonomousMonitor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch autonomous system status
  const { data: status, isLoading: statusLoading } = useQuery<AutonomousStatus>({
    queryKey: ["/api/autonomous/status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch health metrics
  const { data: healthData } = useQuery<{metrics?: any, issues?: any[]}>({
    queryKey: ["/api/autonomous/health"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch analysis history
  const { data: analysisData } = useQuery<{recent?: any[]}>({
    queryKey: ["/api/autonomous/analysis"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch fix history
  const { data: fixData } = useQuery<{recent?: any[], history?: any[]}>({
    queryKey: ["/api/autonomous/fixes"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Start/Stop system mutations
  const startMutation = useMutation({
    mutationFn: () => apiRequest("/api/autonomous/start", "POST"),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Autonomous sistem başlatıldı" });
      queryClient.invalidateQueries({ queryKey: ["/api/autonomous/status"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Sistem başlatılamadı", variant: "destructive" });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("/api/autonomous/stop", "POST"),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Autonomous sistem durduruldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/autonomous/status"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Sistem durdurulamadı", variant: "destructive" });
    }
  });

  // Manual health check
  const healthCheckMutation = useMutation({
    mutationFn: () => apiRequest("/api/autonomous/health/check", "POST"),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Sistem kontrolü tamamlandı" });
      queryClient.invalidateQueries({ queryKey: ["/api/autonomous/health"] });
    }
  });

  // Manual AI analysis
  const analysisMutation = useMutation({
    mutationFn: () => apiRequest("/api/autonomous/analysis/run", "POST"),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "AI analizi başlatıldı" });
      queryClient.invalidateQueries({ queryKey: ["/api/autonomous/analysis"] });
    }
  });

  // Normalize possibly undefined query results
  const issues = healthData?.issues ?? [];
  const analysisRecent = analysisData?.recent ?? [];
  const recentFixes = fixData?.recent ?? [];
  const fixHistory = fixData?.history ?? [];

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Autonomous AI Monitoring</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🤖 Autonomous AI Monitoring</h2>
          <p className="text-muted-foreground">Sistem otomatik olarak kendini izler ve iyileştirir</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => healthCheckMutation.mutate()}
            disabled={healthCheckMutation.isPending}
            variant="outline"
            size="sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            {healthCheckMutation.isPending ? "Kontrol Ediliyor..." : "Sistem Kontrolü"}
          </Button>
          <Button
            onClick={() => analysisMutation.mutate()}
            disabled={analysisMutation.isPending}
            variant="outline"
            size="sm"
          >
            <Brain className="w-4 h-4 mr-2" />
            {analysisMutation.isPending ? "Analiz Ediliyor..." : "AI Analizi"}
          </Button>
          {status?.isActive ? (
            <Button
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              variant="destructive"
              size="sm"
            >
              <Square className="w-4 h-4 mr-2" />
              {stopMutation.isPending ? "Durduruluyor..." : "Durdur"}
            </Button>
          ) : (
            <Button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              variant="default"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {startMutation.isPending ? "Başlatılıyor..." : "Başlat"}
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sistem Durumu</p>
                <div className="flex items-center mt-2">
                  {status?.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className="text-lg font-semibold">
                    {status?.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif Görevler</p>
                <p className="text-2xl font-bold mt-2">{status?.tasksCount || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif Düzeltmeler</p>
                <p className="text-2xl font-bold mt-2">{status?.activeFixes || 0}</p>
              </div>
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sistem Sağlığı</p>
                <Badge className={`mt-2 ${getStatusColor(status?.systemHealth?.status || 'unknown')}`}>
                  {status?.systemHealth?.status || 'Bilinmiyor'}
                </Badge>
              </div>
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="health">Sistem Sağlığı</TabsTrigger>
          <TabsTrigger value="analysis">AI Analizleri</TabsTrigger>
          <TabsTrigger value="fixes">Otomatik Düzeltmeler</TabsTrigger>
          <TabsTrigger value="tasks">Görev Planlaması</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistem Performansı</CardTitle>
                <CardDescription>Son sistem metrikleri</CardDescription>
              </CardHeader>
              <CardContent>
                {healthData?.metrics ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>API Sağlığı</span>
                        <span>{healthData.metrics.apiHealth ? "✅" : "❌"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Veritabanı Sağlığı</span>
                        <span>{healthData.metrics.dbHealth ? "✅" : "❌"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Yanıt Süresi</span>
                        <span>{healthData.metrics.responseTime}ms</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(healthData.metrics.responseTime / 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Bellek Kullanımı</span>
                        <span>{healthData.metrics.memoryUsage.toFixed(1)} MB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(healthData.metrics.memoryUsage / 5, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Veri yükleniyor...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>Autonomous sistem son aktiviteleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFixes.length > 0 ? (
                    recentFixes.slice(0, 5).map((fix: Fix, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        {fix.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fix.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(fix.timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {fix.action}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Henüz aktivite yok</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Sağlık Durumu</CardTitle>
              <CardDescription>Detaylı sistem metrikleri ve sorunlar</CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length > 0 ? (
                <div className="space-y-4">
                  {issues.map((issue: any, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{issue.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {issue.component} - {new Date(issue.timestamp).toLocaleString('tr-TR')}
                            </p>
                          </div>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Sistem Sağlıklı</h3>
                  <p className="text-muted-foreground">Herhangi bir sorun tespit edilmedi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analizleri</CardTitle>
              <CardDescription>ChatGPT tarafından yapılan sistem analizleri</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisRecent.length > 0 ? (
                <div className="space-y-4">
                  {analysisRecent.map((analysis: Analysis, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{analysis.summary}</h4>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(analysis.severity)}>
                            {analysis.severity}
                          </Badge>
                          <Badge variant="outline">
                            Aciliyet: {analysis.urgency}/10
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{new Date(analysis.timestamp).toLocaleString('tr-TR')}</span>
                        {analysis.autoFixable && (
                          <Badge variant="secondary">Otomatik Düzeltilebilir</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Henüz AI analizi yapılmadı
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Otomatik Düzeltmeler</CardTitle>
              <CardDescription>Sistem tarafından yapılan otomatik düzeltmeler</CardDescription>
            </CardHeader>
            <CardContent>
              {fixHistory.length > 0 ? (
                <div className="space-y-4">
                  {fixHistory.map((fix: Fix, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {fix.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <h4 className="font-medium">{fix.description}</h4>
                        </div>
                        <Badge variant="outline">{fix.action}</Badge>
                      </div>
                      {fix.changes?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Yapılan Değişiklikler:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {fix.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(fix.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Henüz otomatik düzeltme yapılmadı
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Görev Planlaması</CardTitle>
              <CardDescription>Autonomous sistem görev programları</CardDescription>
            </CardHeader>
            <CardContent>
              {status?.tasks ? (
                <div className="space-y-4">
                  {Object.entries(status.tasks).map(([taskName, task]: [string, any]) => (
                    <div key={taskName} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium capitalize">{taskName.replace('_', ' ')}</h4>
                        <div className="flex items-center gap-2">
                          {task.isRunning ? (
                            <Badge className="bg-green-100 text-green-800">Çalışıyor</Badge>
                          ) : (
                            <Badge variant="outline">Bekliyor</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Program: </span>
                          <span className="font-mono">{task.schedule}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Son Çalışma: </span>
                          <span>{task.lastRun ? new Date(task.lastRun).toLocaleString('tr-TR') : 'Henüz çalışmadı'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Toplam Çalışma: </span>
                          <span>{task.runCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Başarı Oranı: </span>
                          <span>{(task.successRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Görev bilgileri yükleniyor...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}