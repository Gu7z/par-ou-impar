import React, { useState, useEffect } from "react";
import socketIoClient from "socket.io-client";
import styles from "../../styles/Home.module.css";
import rommStyles from "../../styles/room.module.css";
import { CopyDataToClipboard } from "../../utils";

const WAITING_USERS = "Esperando Usuarios";
const WAITING_ANOTHER_USER = "Esperando outro Usuario";
const WAITING_RESPONSES = "Esperando Respostas";
const ENDPOINT = "https://par-ou-impar-api.vercel.app/";
const socket = socketIoClient(ENDPOINT, {
  withCredentials: true,
  autoConnect: 10000,
  transports: ["websocket"],
});

function Room({ id }) {
  const [userResponse, setUserResponse] = useState("");
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [isUsernameSetted, setIsUsernameSetted] = useState(false);
  const [isParSelected, setIsParSelected] = useState(false);
  const [isImparSelected, setIsImparSelected] = useState(false);
  const [message, setMessage] = useState("");
  const [canShowMessage, setCanShowMessage] = useState(false);
  const [winner, setWinner] = useState(WAITING_USERS);
  const [canWeStart, setCanWeStart] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [otherUserPoints, setOtherUserPoints] = useState(0);

  const clearMessageAndWinner = () => {
    setCanShowMessage(false);
  };

  const setUserMessage = () => {
    const WON = "Parabens, voce ganhou!";
    const LOSE = "Infelizmente não foi dessa vez! :c";

    if (winner) {
      if (winner === username) {
        setMessage(WON);
      } else {
        setMessage(LOSE);
      }
    }
  };

  const sendNick = (localUsername = "") => {
    const usernameToSend = localUsername || username;

    socket.emit("sendNick", { username: usernameToSend, id });
    setIsUsernameSetted(true);
  };

  useEffect(() => {
    const localUsername = localStorage.getItem("username") || username;
    if (localUsername) {
      setUsername(localUsername);
      sendNick(localUsername);

      socket.on(`setPoints-${id}`, (points) => {
        const { [localUsername]: userPointsFromServer, ...otherUser } = points;
        const otherUserPointsFromServer = Object.values(otherUser)[0];

        setUserPoints(userPointsFromServer);
        setOtherUserPoints(otherUserPointsFromServer);
      });
    }
  }, []);

  useEffect(() => {
    socket.on(`setUsers-${id}`, (users) => {
      setUsers(users);
    });

    socket.on(`start-${id}`, () => {
      setCanWeStart(true);
    });
  }, []);

  useEffect(() => {
    if (canShowMessage) {
      setUserMessage();
    } else {
      setWinner("");
      setMessage(WAITING_RESPONSES);
    }
  }, [canShowMessage]);

  useEffect(() => {
    if (canWeStart) {
      setMessage(WAITING_RESPONSES);

      socket.on(`winner-${id}`, (str) => {
        setWinner(str);
        setCanShowMessage(true);
        setUserResponse("");
        setIsParSelected(false);
        setIsImparSelected(false);
      });

      socket.on(`wait-${username}`, () => {
        setMessage(WAITING_ANOTHER_USER);
      });

      socket.on(`setPar-${id}`, (usernameFromSocket) => {
        if (usernameFromSocket !== username) {
          setIsParSelected(true);
          setIsImparSelected(false);
          clearMessageAndWinner();
        }
      });

      socket.on(`setImpar-${id}`, (usernameFromSocket) => {
        if (usernameFromSocket !== username) {
          setIsImparSelected(true);
          setIsParSelected(false);
          clearMessageAndWinner();
        }
      });
    }
  }, [canWeStart]);

  const sendResponse = () => {
    if (userResponse !== null) {
      const data = {
        username,
        response: userResponse,
        id,
      };

      socket.emit("sendUserResponse", data);
    }
  };

  const setImparOrPar = (str) => {
    if (userResponse !== null) {
      const isPar = str === "par" ? true : false;

      const data = {
        username,
        par: isPar,
        impar: !isPar,
        id,
      };

      socket.emit("setParOrImpar", data);
    }
  };

  return (
    <div className={styles.container}>
      <p
        className={rommStyles.copy_link}
        onClick={() => {
          CopyDataToClipboard(window.location);
        }}
      >
        Copiar o Link da sala
      </p>
      <p>Digite seu nick (permanente)</p>
      <input
        type="text"
        value={username}
        disabled={isUsernameSetted}
        onChange={(event) => {
          setUsername(event.target.value);
          localStorage.setItem("username", event.target.value);
        }}
        style={{
          marginBottom: 16,
        }}
      />
      {!isUsernameSetted && (
        <button
          onClick={() => {
            sendNick();
          }}
        >
          Enviar Nick
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={isParSelected}
          onChange={() => {
            setIsParSelected(true);
            setImparOrPar("par");
            clearMessageAndWinner();
          }}
          disabled={isImparSelected || !canWeStart}
          style={{
            marginRight: 8,
          }}
        />
        <p
          style={{
            marginRight: 16,
          }}
        >
          Par
        </p>
        <input
          type="checkbox"
          checked={isImparSelected}
          disabled={isParSelected || !canWeStart}
          onChange={() => {
            setIsImparSelected(true);
            setImparOrPar("impar");
            clearMessageAndWinner();
          }}
          style={{
            marginRight: 8,
          }}
        />
        <p>Impar</p>
      </div>
      {(isImparSelected || isParSelected) && (
        <div className={rommStyles.responses}>
          {[...Array(10).keys()].map((value) => {
            return (
              <div
                key={value}
                className={`${rommStyles.square} ${
                  userResponse && value + 1 === userResponse
                    ? rommStyles.square_selected
                    : rommStyles.square_not_selected
                }`}
                onClick={() => setUserResponse(value + 1)}
              >
                {value + 1}
              </div>
            );
          })}
        </div>
      )}
      <button
        onClick={() => {
          sendResponse();
        }}
      >
        Enviar
      </button>

      <h3>{message}</h3>

      <p>Usuários e pontuação: </p>
      <ul style={{ margin: 0 }}>
        {users.map((user) => {
          const userAndPoints =
            user === username
              ? `${user}: ${userPoints}`
              : `${user}: ${otherUserPoints}`;

          return <li key={user}>{userAndPoints}</li>;
        })}
      </ul>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;

  return {
    props: {
      id,
    },
  };
}

export default Room;
