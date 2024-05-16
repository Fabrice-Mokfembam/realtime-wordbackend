// server.js

import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import { Document } from "./models/document.js";

const app = express();
const corsOptions = {
  origin: "http://localhost:5174",
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-group", (name) => {
    socket.join(name);
    const document = findOrCreateDocument(name);
    io.to(name).emit("load-document", document.textContent);
    console.log("joined group", socket.id);

    socket.on("send-words", (words) => {
      io.to(name).emit("received-words", words);
      saveDocument(name, words); // Autosave the document
    });
  });
});

app.get("/", (req, res) => {
  res.send("yo");
});

async function findOrCreateDocument(name) {
  if (!name) return;

  const document = await Document.findOne({ name });
  if (document) return document;
  return await Document.create({ name, textContent: "" });
}

async function saveDocument(name, textContent) {
  try {
    const document = await Document.findOneAndUpdate(
      { name },
      { textContent },
      { new: true }
    );
    console.log("Document saved:", document);
  } catch (error) {
    console.log("Error saving document:", error);
  }
}

const connection = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://ThiagoFabrice:Thiago+123.@blogcluster.oorq86r.mongodb.net/documents`
    );
    console.log("connected to db");
  } catch (error) {
    console.log("error connecting to db", error);
  }
};

server.listen(5001, () => {
  console.log("running on port 5001");
  connection();
});