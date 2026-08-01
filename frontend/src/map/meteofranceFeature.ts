import api from "../api/apiBridge";

export async function applyVigilanceColors(map: maplibregl.Map) {
  try {
    const res = await api.get('/weather');
    const data = res.data;

    for (const dept of data) {
      const code = dept.department;

      // Ignore FRA (national) et les zones maritimes (ex: "1410", "3410")
      if (!code || code === 'FRA' || code.length !== 2) continue;

      // Ignore si pas de couleur valide
      if (typeof dept.maxColorId !== 'number') continue;

      map.setFeatureState(
        { source: 'departements', id: code },
        { couleur: dept.maxColorId }
      );
    }
  } catch (err) {
    console.error('Erreur récupération vigilance:', err);
  }
}