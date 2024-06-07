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
wss.on("connection", (ws) => {
  console.log("Client connected");

  const telnetClient = new Telnet();

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

  ws.on("close", () => {
    console.log("Client disconnected");
    telnetClient.end();
  });

  ws.on("message", async (message) => {
    try {
      if (message.toString().indexOf("telnet://") > -1) {
        const params = {
          host: message.toString().replace("telnet://", ""),
          port: 23,
          negotiationMandatory: false,
          timeout: 1500,
        };
        await telnetClient.connect(params);
        await telnetClient.exec("\n"); // initial response
        return;
      } else {
        console.log("Received from client:", message.toString()); // Logging the received message
        handleClientMessage(message, telnetClient);
      }
    } catch (e) {
      console.log(e);
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

function handleClientMessage(message, telnetClient) {
  const keyboardSequences = {
    ArrowUp: "\x1b[A",
    ArrowDown: "\x1b[B",
    ArrowRight: "\x1b[C",
    ArrowLeft: "\x1b[D",
    PageUp: "\x1b[5~",
    PageDown: "\x1b[6~",
    CtrlLeft: "\x1b[1;5D",
    CtrlRight: "\x1b[1;5C",
  };

  const sequence = keyboardSequences[message.toString()];
  if (sequence) {
    console.log("Sending sequence to Telnet:", sequence); // Logging the sequence being sent
    telnetClient.write(sequence, (error) => {
      if (error) {
        console.error("Telnet send error:", error);
      }
    });
  } else {
    telnetClient.send(message, (error) => {
      if (error) {
        console.error("Telnet send error:", error);
      }
    });
  }
}
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
