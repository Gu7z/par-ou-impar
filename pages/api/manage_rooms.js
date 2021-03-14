import { Server } from "socket.io";

const ioHandler = (_req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    const dataBase = {};

    io.on("connection", (socket) => {
      socket.on("sendNick", ({ username, id }) => {
        if (!dataBase[id]) {
          dataBase[id] = {};
          dataBase[id]["points"] = {};
          dataBase[id]["choice"] = {};
          dataBase[id]["response"] = {};
          dataBase[id]["users"] = [];
        }

        dataBase[id]["points"][username] = 0;
        dataBase[id]["choice"][username] = "";
        dataBase[id]["response"][username] = null;

        const nameIsNotSetted = !dataBase[id]["users"].includes(username);

        if (nameIsNotSetted) {
          dataBase[id]["users"].push(username);
        }

        const users = dataBase[id]["users"];

        socket.broadcast.emit(`setUsers-${id}`, users);

        if (users.length === 2) {
          socket.broadcast.emit(`start-${id}`, true);
        }
      });

      socket.on("setParOrImpar", (data) => {
        const { username, par, impar, id } = data;

        const otherUser = dataBase[id]["users"].find(
          (user) => user !== username
        );

        if (par) {
          dataBase[id]["choice"][username] = "par";
          dataBase[id]["choice"][otherUser] = "impar";
          socket.broadcast.emit(`setImpar-${id}`, username);
        }

        if (impar) {
          dataBase[id]["choice"][username] = "impar";
          dataBase[id]["choice"][otherUser] = "par";
          socket.broadcast.emit(`setPar-${id}`, username);
        }
      });

      socket.on("sendUserResponse", (data) => {
        const { username, response, id } = data;

        dataBase[id]["response"][username] = response;

        let bothHaveResponded = true;
        for (const [, eachResponse] of Object.entries(
          dataBase[id]["response"]
        )) {
          if (eachResponse === null) {
            bothHaveResponded = false;
            break;
          }
        }

        if (
          Object.keys(dataBase[id]["response"]).length === 2 &&
          bothHaveResponded
        ) {
          let calc = 0;

          for (const eachResponse of Object.values(dataBase[id]["response"])) {
            calc += eachResponse;
          }
          calc = calc % 2 === 0 ? "par" : "impar";

          for (const nick of Object.keys(dataBase[id]["response"])) {
            dataBase[id]["response"][nick] = null;
          }

          let winner = "";

          for (const [name, choice] of Object.entries(dataBase[id]["choice"])) {
            if (choice === calc) {
              winner = name;
            }
          }

          socket.broadcast.emit(`winner-${id}`, winner);
        } else {
          socket.broadcast.emit(`wait-${username}`, "Guenta ae meu camarada");
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
