const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");
const { createServer } = require("http");
const socketIO = require("socket.io");
const logger = require("./utils/logger");
const { initializeSocketIO } = require("./socket");
const redisClient = require("./config/redis");

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = socketIO(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Initialize Socket.IO handlers
initializeSocketIO(io);

// Make io accessible to routes
app.set("io", io);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Redis Connected");
  } catch (error) {
    logger.error(`Redis Connection Error: ${error.message}`);
    logger.warn(
      "Backend will continue without Redis - some features may be limited",
    );
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  await connectRedis();

  httpServer.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  httpServer.close(async () => {
    await mongoose.connection.close();
    await redisClient.quit();
    logger.info("Process terminated");
  });
});

startServer();

module.exports = { httpServer, io };
