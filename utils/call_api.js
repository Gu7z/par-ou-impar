import apiCaller from "./api";

const generateRooms = async () => {
  const response = await apiCaller.get("/generate_rooms").catch(() => null);
  return response.data.uuid;
};

export { generateRooms };
