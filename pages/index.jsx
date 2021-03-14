import { useRouter } from "next/router";
import { generateRooms } from "../utils";
import styles from "../styles/Home.module.css";

function Home() {
  const route = useRouter();

  const goToRoom = async () => {
    const room = await generateRooms();
    route.push(`http://localhost:3000/room/${room}`);
  };

  return (
    <div className={styles.container}>
      <h3>Gerar sala</h3>
      <button onClick={goToRoom}>Gerar</button>
    </div>
  );
}

export default Home;
