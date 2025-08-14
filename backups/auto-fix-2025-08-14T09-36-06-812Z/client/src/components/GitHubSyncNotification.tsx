import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitPullRequest, ExternalLink } from 'lucide-react';

export function GitHubSyncNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Check every 5 minutes for GitHub updates
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/autonomous/github-status');
        const data = await response.json();
        
        if (data.hasUpdates && !data.canAutoPull) {
          setShowNotification(true);
          setLastCheck(new Date());
        }
      } catch (error) {
        console.log('GitHub sync check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(checkInterval);
  }, []);

  if (!showNotification) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <GitPullRequest className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          🤖 Autonomous updates detected on GitHub. Manual sync required due to Replit restrictions.
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.open('https://github.com/your-repo', '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View GitHub
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNotification(false)}
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}