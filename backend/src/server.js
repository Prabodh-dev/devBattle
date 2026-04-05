const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");
const { createServer } = require("http");
const socketIO = require("socket.io");
const logger = require("./utils/logger");
const { initializeSocketIO } = require("./socket");
const redisClient = require("./config/redis");
dotenv.config();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http:
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
initializeSocketIO(io);
app.set("io", io);
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
const startServer = async () => {
  await connectDB();
  await connectRedis();
  httpServer.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
};
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});
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
