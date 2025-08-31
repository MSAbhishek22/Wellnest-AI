import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { APIStatusChecker } from "./services/external-apis";

// Add startup logging
console.log("🚀 Starting WellNest.AI server...");
console.log("📍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔑 GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);
console.log("🔑 VITE_GROQ_API_KEY present:", !!process.env.VITE_GROQ_API_KEY);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("📝 Registering routes...");
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("❌ Server error:", err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      console.log("🔧 Setting up Vite for development...");
      await setupVite(app, server);
    } else {
      console.log("📦 Setting up static file serving for production...");
      serveStatic(app);
    }

    // Serve the app on the configured port
    // this serves both the API and the client.
    const port = parseInt(process.env.PORT || "3001");
    const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
    
    console.log(`🌐 Starting server on ${host}:${port}...`);
    
    server.listen({
      port,
      host,
    }, () => {
      console.log(`✅ Server successfully started on ${host}:${port}`);
      log(`serving on ${host}:${port}`);
      // Log API configuration status
      APIStatusChecker.logAPIStatus();
    });

    server.on('error', (error) => {
      console.error("❌ Server failed to start:", error);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
