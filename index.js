const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const uao = require("uao-js");
const { Telnet } = require("telnet-client");
const { ansiToPre } = require("ansi-to-pre");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

// WebSocket Server
wss.on("connection", async (ws) => {
  console.log("Client connected");

  const telnetClient = new Telnet();

  const params = {
    host: "bs2.io",
    port: 23,
    negotiationMandatory: false,
    timeout: 1500,
  };
  await telnetClient.connect(params);
  await telnetClient.exec("\n"); // initial response

  let buffer = Buffer.alloc(0); // 缓冲区用于暂存未处理的数据

  telnetClient.on("data", async (data) => {
    buffer = Buffer.concat([buffer, data]); // 将新接收到的数据追加到缓冲区

    // 尝试解码缓冲区中的数据
    decodeBuffer(buffer)
      .then((parseData) => {
        parseData = ansiToPre(parseData);
        ws.send(parseData);
      })
      .catch((error) => {
        console.error("Decode error:", error);
      });
  });

  ws.on("message", (message) => {
    // If connected to ptt.cc, send message
    if (message === "/q") {
      ws.on("close", () => {
        console.log("Client disconnected");
        telnetClient.end();
      });
    } else {
      telnetClient.send(message);
    }
  });
});

// 解码缓冲区中的数据
function decodeBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const binaryString = buffer.toString("binary");
    uao
      .decode(binaryString)
      .then((parseData) => {
        resolve(parseData);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
