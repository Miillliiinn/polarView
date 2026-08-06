import { globalCache } from "../classCache";

function formatTime(isoCompactString: string): string {
  if (!isoCompactString) return "";

  const formattedIso = isoCompactString.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/,
    "$1-$2-$3T$4:$5:$6"
  );

  const date = new Date(formattedIso);
  if (isNaN(date.getTime())) return isoCompactString;

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ShowAllTrainsData() {
  const trains = globalCache.getSncfCache() || [];

  return (
    <ul>
      {trains.map((train: any) => (
        <li key={train.id}>
          id: {train.id} | nb: {train.trainNumber} | type: {train.type} | operator: {train.operator} | 
          departTime: {formatTime(train.departureTime)} | stationName: {train.stationName} | 
          long: {train.longitude} | lat: {train.latitude} | dir: {train.direction}
        </li>
      ))}
    </ul>
  );
}