import { v4 as uuidv4 } from "uuid";

export default (_req, res) => {
  res.status(200).json({ uuid: uuidv4() });
};
