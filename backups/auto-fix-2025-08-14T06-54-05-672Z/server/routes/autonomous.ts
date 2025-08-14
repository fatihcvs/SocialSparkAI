import express from "express";
import { autonomousScheduler } from "../services/autonomousScheduler";
import { healthMonitor } from "../services/healthMonitor";
import { aiAnalyzer } from "../services/aiAnalyzer";
import { autoFixer } from "../services/autoFixer";
import { authenticateToken } from "../middlewares/auth";
import type { AuthRequest } from "../middlewares/auth";

const router = express.Router();

// Autonomous System Control Endpoints
router.get("/status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const systemStatus = autonomousScheduler.getStatus();
    res.json(systemStatus);
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "STATUS_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

router.post("/start", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Admin access required" }
      });
    }

    await autonomousScheduler.start();
    
    res.json({ 
      success: true, 
      message: "Autonomous system started successfully",
      status: autonomousScheduler.getStatus()
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "START_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

router.post("/stop", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Admin access required" }
      });
    }

    await autonomousScheduler.stop();
    
    res.json({ 
      success: true, 
      message: "Autonomous system stopped successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "STOP_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

router.put("/config", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Admin access required" }
      });
    }

    const config = req.body;
    autonomousScheduler.updateConfig(config);
    
    res.json({ 
      success: true, 
      message: "Configuration updated successfully",
      config: autonomousScheduler.getStatus().config
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "CONFIG_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// Health Monitoring Endpoints
router.get("/health", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const systemStatus = healthMonitor.getSystemStatus();
    const latestMetrics = healthMonitor.getLatestMetrics();
    const recentIssues = healthMonitor.getRecentIssues(24);
    
    res.json({
      status: systemStatus,
      metrics: latestMetrics,
      issues: recentIssues,
      critical: healthMonitor.getCriticalIssues()
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "HEALTH_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

router.post("/health/check", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const metrics = await healthMonitor.checkSystemMetrics();
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "HEALTH_CHECK_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// AI Analysis Endpoints
router.get("/analysis", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const history = aiAnalyzer.getAnalysisHistory();
    const critical = aiAnalyzer.getCriticalAnalyses();
    
    res.json({
      recent: history.slice(-10),
      critical,
      totalAnalyses: history.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "ANALYSIS_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

router.post("/analysis/run", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Admin access required" }
      });
    }

    const analysis = await aiAnalyzer.analyzeSystemHealth();
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "ANALYSIS_RUN_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// Auto-Fix Endpoints
router.get("/fixes", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const history = autoFixer.getFixHistory();
    const successful = autoFixer.getSuccessfulFixes();
    const recent = autoFixer.getRecentFixes(24);
    
    res.json({
      history: history.slice(-20),
      successful: successful.length,
      recent,
      successRate: successful.length / Math.max(history.length, 1)
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "FIXES_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

router.post("/fixes/execute", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Admin access required" }
      });
    }

    const { analysis } = req.body;
    
    if (!analysis) {
      return res.status(400).json({
        error: { code: "MISSING_ANALYSIS", message: "Analysis object required" }
      });
    }

    const result = await autoFixer.executeAutomaticFix(analysis);
    
    res.json({
      success: result.success,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "FIX_EXECUTE_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// System Dashboard Data
router.get("/dashboard", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const systemStatus = autonomousScheduler.getStatus();
    const healthData = healthMonitor.getSystemStatus();
    const recentAnalyses = aiAnalyzer.getAnalysisHistory().slice(-5);
    const recentFixes = autoFixer.getRecentFixes(24);
    const tasks = autonomousScheduler.getTasksStatus();
    
    const dashboard = {
      autonomous: {
        isActive: systemStatus.isActive,
        tasksCount: systemStatus.tasksCount,
        activeFixes: systemStatus.activeFixes
      },
      health: {
        status: healthData.status,
        uptime: healthData.uptime,
        criticalIssues: healthData.criticalIssues,
        metrics: healthData.metrics
      },
      analysis: {
        total: aiAnalyzer.getAnalysisHistory().length,
        recent: recentAnalyses.length,
        critical: aiAnalyzer.getCriticalAnalyses().length
      },
      fixes: {
        total: autoFixer.getFixHistory().length,
        successful: autoFixer.getSuccessfulFixes().length,
        recent: recentFixes.length,
        successRate: autoFixer.getSuccessfulFixes().length / Math.max(autoFixer.getFixHistory().length, 1)
      },
      tasks
    };
    
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "DASHBOARD_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

// Emergency Controls
router.post("/emergency/stop", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Admin access required" }
      });
    }

    await autonomousScheduler.stop();
    
    res.json({ 
      success: true, 
      message: "🚨 EMERGENCY STOP: Autonomous system halted immediately",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: { 
        code: "EMERGENCY_STOP_ERROR", 
        message: error instanceof Error ? error.message : String(error)
      } 
    });
  }
});

export default router;