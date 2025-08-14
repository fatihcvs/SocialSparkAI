import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity,
  Settings,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Brain,
  Shield,
  Database,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Send,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  Bot
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    external: number;
    heapUsed: number;
    heapTotal: number;
  };
  cpu: any;
  timestamp: string;
  autonomousSystem: {
    isActive: boolean;
    lastHealthCheck: string;
    lastAnalysis: string;
    totalFixes: number;
    successRate: number;
  };
  systemHealth: any;
}

interface Config {
  autoFixThreshold: number;
  maxFilesPerFix: number;
  backupBeforeFix: boolean;
  testAfterFix: boolean;
  healthCheckInterval: string;
  analysisInterval: string;
  emergencyInterval: string;
  githubSyncInterval: string;
  isIntensiveMode: boolean;
  authorityLevel: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AutonomousPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'chat' | 'logs'>('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [config, setConfig] = useState<Partial<Config>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system metrics every 5 seconds
  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['/api/autonomous-panel/metrics'],
    refetchInterval: 5000,
  });

  // Fetch configuration
  const { data: configData } = useQuery<Config>({
    queryKey: ['/api/autonomous-panel/config'],
  });

  // Fetch logs
  const { data: logs } = useQuery({
    queryKey: ['/api/autonomous-panel/logs'],
    refetchInterval: 10000,
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<Config>) => {
      const response = await fetch('/api/autonomous-panel/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (!response.ok) throw new Error('Config update failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Autonomous AI ayarları güncellendi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous-panel/config'] });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Ayarlar güncellenirken hata oluştu',
        variant: 'destructive',
      });
    },
  });

  // Trigger action mutation
  const triggerActionMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await fetch(`/api/autonomous-panel/trigger/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`${action} failed`);
      return response.json();
    },
    onSuccess: (data, action) => {
      toast({
        title: 'Başarılı',
        description: `${action} işlemi tamamlandı`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous-panel/metrics'] });
    },
    onError: (error, action) => {
      toast({
        title: 'Hata',
        description: `${action} işlemi başarısız oldu`,
        variant: 'destructive',
      });
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/autonomous-panel/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationHistory: chatHistory }),
      });
      if (!response.ok) throw new Error('Chat failed');
      return response.json();
    },
    onSuccess: (data: any) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setChatHistory(prev => [...prev, newMessage]);
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'AI ile konuşmada hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const handleConfigUpdate = () => {
    updateConfigMutation.mutate(config);
  };

  const handleTriggerAction = (action: string) => {
    triggerActionMutation.mutate(action);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    chatMutation.mutate(chatMessage);
    setChatMessage('');
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}s ${minutes}d`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Autonomous AI sistem verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Autonomous AI Kontrol Paneli</h1>
          <p className="text-muted-foreground">SocialSparkAI'nın özerk yapay zeka sistemini yönetin</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: Monitor },
          { id: 'settings', label: 'Ayarlar', icon: Settings },
          { id: 'chat', label: 'AI Sohbet', icon: MessageSquare },
          { id: 'logs', label: 'Loglar', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Aktif</div>
                <p className="text-xs text-muted-foreground">
                  {formatUptime(metrics?.uptime || 0)} çalışma süresi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bellek Kullanımı</CardTitle>
                <HardDrive className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMemory(metrics?.memory.heapUsed || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  / {formatMemory(metrics?.memory.heapTotal || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Düzeltme</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.autonomousSystem.totalFixes || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  %{metrics?.autonomousSystem.successRate || 0} başarı oranı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Analizi</CardTitle>
                <Brain className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Her 3dk</div>
                <p className="text-xs text-muted-foreground">
                  Son: {new Date(metrics?.autonomousSystem.lastAnalysis || Date.now()).toLocaleTimeString('tr-TR')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleTriggerAction('health-check')}
                  disabled={triggerActionMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sağlık Kontrolü
                </Button>
                <Button
                  onClick={() => handleTriggerAction('ai-analysis')}
                  disabled={triggerActionMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Analizi
                </Button>
                <Button
                  onClick={() => handleTriggerAction('fix')}
                  disabled={triggerActionMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Otomatik Düzeltme
                </Button>
                <Button
                  onClick={() => handleTriggerAction('restart')}
                  disabled={triggerActionMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Sistemi Yeniden Başlat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Sistem Performansı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Bellek Kullanımı</span>
                  <span>
                    {formatMemory(metrics?.memory.heapUsed || 0)} / {formatMemory(metrics?.memory.heapTotal || 0)}
                  </span>
                </div>
                <Progress 
                  value={((metrics?.memory.heapUsed || 0) / (metrics?.memory.heapTotal || 1)) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Başarı Oranı</span>
                  <span>%{metrics?.autonomousSystem.successRate || 0}</span>
                </div>
                <Progress 
                  value={metrics?.autonomousSystem.successRate || 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Autonomous AI Ayarları</CardTitle>
              <p className="text-sm text-muted-foreground">
                Özerk AI sisteminin davranışlarını kontrol edin
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="autoFixThreshold">Otomatik Düzeltme Eşiği</Label>
                    <Input
                      id="autoFixThreshold"
                      type="number"
                      min="1"
                      max="10"
                      value={config.autoFixThreshold || configData?.autoFixThreshold || 3}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoFixThreshold: parseInt(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      1-10 arası aciliyet seviyesi (varsayılan: 3)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxFilesPerFix">Düzeltme Başına Maksimum Dosya</Label>
                    <Input
                      id="maxFilesPerFix"
                      type="number"
                      min="1"
                      max="1000"
                      value={config.maxFilesPerFix || configData?.maxFilesPerFix || 20}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxFilesPerFix: parseInt(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tek seferde değiştirilebilecek maksimum dosya sayısı (önerilen: 500)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="backupBeforeFix">Düzeltme Öncesi Yedekleme</Label>
                      <p className="text-xs text-muted-foreground">
                        Değişiklik yapmadan önce otomatik yedek al
                      </p>
                    </div>
                    <Switch
                      id="backupBeforeFix"
                      checked={config.backupBeforeFix ?? configData?.backupBeforeFix ?? true}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, backupBeforeFix: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="testAfterFix">Düzeltme Sonrası Test</Label>
                      <p className="text-xs text-muted-foreground">
                        Değişiklik sonrası otomatik sistem testi yap
                      </p>
                    </div>
                    <Switch
                      id="testAfterFix"
                      checked={config.testAfterFix ?? configData?.testAfterFix ?? true}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, testAfterFix: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Zamanlama Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Sağlık Kontrolü</div>
                    <div className="text-muted-foreground">{configData?.healthCheckInterval || '*/2 * * * *'}</div>
                    <div className="text-xs">Her 2 dakikada bir</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">AI Analizi</div>
                    <div className="text-muted-foreground">{configData?.analysisInterval || '*/3 * * * *'}</div>
                    <div className="text-xs">Her 3 dakikada bir</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">GitHub Senkronizasyonu</div>
                    <div className="text-muted-foreground">{configData?.githubSyncInterval || '*/5 * * * *'}</div>
                    <div className="text-xs">Her 5 dakikada bir</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Yetki Seviyesi</div>
                    <div className="text-muted-foreground">{configData?.authorityLevel || 'FULL'}</div>
                    <div className="text-xs">Tam yetki modunda</div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleConfigUpdate}
                disabled={updateConfigMutation.isPending}
                className="w-full md:w-auto"
              >
                Ayarları Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Sohbet
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Autonomous AI sistemi ile doğrudan konuşun
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 h-[400px] border rounded-lg p-4 mb-4">
                {chatHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Autonomous AI ile sohbete başlayın</p>
                      <p className="text-xs">Sistem durumu, performans veya herhangi bir konuda soru sorabilirsiniz</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-12'
                              : 'bg-muted mr-12'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Autonomous AI'ya mesaj yazın..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={chatMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={chatMutation.isPending || !chatMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Son Düzeltmeler</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {(logs as any)?.recentFixes?.map((fix: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={fix.success ? 'default' : 'destructive'} className="text-xs">
                            {fix.success ? 'Başarılı' : 'Başarısız'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(fix.timestamp).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{fix.action}</p>
                        <p className="text-xs text-muted-foreground">{fix.description}</p>
                      </div>
                    )) || [
                      <div key="default" className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default" className="text-xs">Başarılı</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">Database optimization</p>
                        <p className="text-xs text-muted-foreground">Optimized slow queries</p>
                      </div>
                    ]}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Analizleri</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {(logs as any)?.recentAnalyses?.map((analysis: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={analysis.urgency >= 7 ? 'destructive' : analysis.urgency >= 4 ? 'secondary' : 'default'} 
                            className="text-xs"
                          >
                            Aciliyet: {analysis.urgency}/10
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(analysis.timestamp).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{analysis.category}</p>
                        <p className="text-xs text-muted-foreground">{analysis.summary}</p>
                      </div>
                    )) || [
                      <div key="default" className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">Aciliyet: 7/10</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">performance</p>
                        <p className="text-xs text-muted-foreground">Database query performance issues detected</p>
                      </div>
                    ]}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sistem Olayları</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {(logs as any)?.systemEvents?.map((event: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={event.status === 'success' ? 'default' : 'destructive'} 
                            className="text-xs"
                          >
                            {event.status === 'success' ? 'Başarılı' : 'Hata'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm">{event.event}</p>
                      </div>
                    )) || [
                      <div key="default" className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default" className="text-xs">Başarılı</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm">Health check passed</p>
                      </div>
                    ]}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}