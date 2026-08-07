import { globalCache } from "../../classCache";
import api from "../../apiBridge";
import { useEffect } from "react";

const railAPI = async () => {
  const apiResult = await api.get("trains/rail");
  return apiResult.data;
};

export function RailData()
{
  useEffect(() => {
    railAPI()
      .then((data) => globalCache.setRailCache(data))
      .catch((err) => console.error("Erreur chargement cache rail :", err));

    const interval = setInterval(() => {
      railAPI()
        .then((data) => globalCache.setRailCache(data))
        .catch((err) => console.error("Erreur rafraîchissement cache rail :", err));
    }, 600_000); // 10 min
    return () => clearInterval(interval);
  }, []);
}