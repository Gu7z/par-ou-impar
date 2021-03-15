import { useRouter } from "next/router";
import { generateRooms } from "../utils";
import styles from "../styles/Home.module.css";

function Home() {
  const route = useRouter();

  const goToRoom = async () => {
    const room = await generateRooms();
    route.push(`/room/${room}`);
  };

  return (
    <div className={styles.container}>
      <h3>Gerar sala</h3>
      <div className={styles.generate_room_button} onClick={goToRoom}>
        Gerar
      </div>
    </div>
  );
}

export default Home;
