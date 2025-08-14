import { Router } from "express";
import { execSync } from "child_process";

const router = Router();

// Check GitHub sync status
router.get("/github-status", async (req, res) => {
  try {
    // Check for remote updates
    execSync('git fetch origin', { stdio: 'pipe' });
    
    const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
    
    const hasUpdates = localCommit !== remoteCommit;
    
    // Check if auto-pull is possible (always false due to Replit restrictions)
    const canAutoPull = false;
    
    // Get latest remote commit info if there are updates
    let latestCommit = null;
    if (hasUpdates) {
      try {
        latestCommit = execSync('git log origin/main -1 --pretty=format:"%h - %s (%an, %ar)"', { encoding: 'utf8' });
      } catch (error) {
        latestCommit = "Could not fetch commit info";
      }
    }
    
    res.json({
      hasUpdates,
      canAutoPull,
      localCommit: localCommit.substring(0, 7),
      remoteCommit: remoteCommit.substring(0, 7),
      latestCommit,
      lastChecked: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("GitHub status check failed:", error.message);
    res.status(500).json({
      error: "Failed to check GitHub status",
      hasUpdates: false,
      canAutoPull: false,
      message: error.message
    });
  }
});

export default router;