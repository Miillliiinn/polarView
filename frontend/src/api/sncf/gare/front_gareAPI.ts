import { globalCache } from "../../classCache";
import api from "../../apiBridge";
import { useEffect } from "react";

const gareAPI = async () => {
  const apiResult = await api.get("trains/gare");
  return apiResult.data;
};

export function GareData()
{
  useEffect(() => {
    gareAPI()
      .then((data) => globalCache.setGareCache(data))
      .catch((err) => console.error("Erreur chargement cache gare :", err));

    const interval = setInterval(() => {
      gareAPI()
        .then((data) => globalCache.setGareCache(data))
        .catch((err) => console.error("Erreur rafraîchissement cache gare :", err));
    }, 600_000); // 10 min
    return () => clearInterval(interval);
  }, []);
}