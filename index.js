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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-group", async (name) => {
    socket.join(name);
    console.log("joined group", socket.id);
     
    const newDoc = {
    name,
    textContent: '', 
  };
    const docs = await Document.findOne({ name }); 
    const loadData = Loader(docs);
    if (loadData === '') {
      const created = await Document.create(newDoc);
      console.log('created', created);
    } else {
      socket.emit('load-document', loadData);        
      console.log(loadData);  
    }  
    
 
    socket.on("send-words", (words) => {
      io.to(name).emit("received-words", words);
    
    });  

    socket.on('save-documents', async (data) => {
      const saved = await Document.findOneAndUpdate({ name }, { textContent: data }, { new: true });
      console.log(saved);
    })
  });
});

app.get("/", (req, res) => {  
  res.send("yo");
});    

function Loader(docs) { 
  if (docs) return docs.textContent;

  return '';
      
} 

// async function saveDocument(name, textContent) {
//   try {
//     const document = await Document.findOneAndUpdate(
//       { name },
//       { textContent },
//       { new: true }
//     );
//     console.log("Document saved:", document);
//   } catch (error) {
//     console.log("Error saving document:", error);
//   }
// }

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