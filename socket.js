const dgram = require("dgram");
const PORT = 6000;
const HOST = "localhost";

module.exports = function (agent, teamName, version) {
  // Создание сокета
  const socket = dgram.createSocket({
    type: "udp4",
  });

  socket.on("message", (msg, info) => {
    agent.msgGot(msg);
  });

  socket.sendMsg = function (msg) {
    socket.send(Buffer.from(msg), PORT, HOST, (err, bytes) => {
      if (err) throw err;
    });
  };
  agent.teamName = teamName;
  agent.setSocket(socket);
  console.log(`(init ${teamName} (version ${version}) ${agent.type})`);
  socket.sendMsg(`(init ${teamName} (version ${version}) ${agent.type})`);
};
