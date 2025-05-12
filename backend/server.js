require("dotenv").config();
const express = require("express");
const http = require("http");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const contractRoutes = require("./src/routes/contract.routes");
const contractTermsRoutes = require("./src/routes/contractTerms.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const projectsRoutes = require("./src/routes/project.routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡️ Socket.IO client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("⚡️ Socket.IO client disconnected:", socket.id);
  });
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

require("./src/middleware/auth.middleware");

app.get("/", (req, res) => {
  res.send("Freelancer Management Platform API is up");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/contract-terms", contractTermsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/projects", projectsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

module.exports = app;
