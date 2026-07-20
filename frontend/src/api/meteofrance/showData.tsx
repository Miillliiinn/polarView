import { globalCache } from "../classCache";

export default function ShowAllMeteoFranceData()
{
  const meteoFrance = globalCache.getMfCache();

  return (
    <ul>
      {meteoFrance.map((mf: any) => (
        <li key={mf.department}>
          Département {mf.department} | couleur max: {mf.maxColorId}
          <ul>
            {mf.phenomenons.map((ph: any) => (
              <li key={ph.id}>
                Phénomène {ph.id} | couleur: {ph.colorId}
                <ul>
                  {ph.schedule.map((s: any, index: number) => (
                    <li key={index}>
                      {s.begin} → {s.end} (couleur: {s.color})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}