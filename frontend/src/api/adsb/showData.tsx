import { globalCache } from "../classCache";

const KIND_LABELS: Record<string, string> = {
  commercial: "Commercial",
  privateJet: "Jet privé",
  generalAviation: "Aviation générale",
  helicopter: "Hélicoptère",
  militaryHelicopter: "Hélico militaire",
  military: "Militaire",
  glider: "Planeur",
  balloon: "Ballon",
  uav: "Drone",
  groundVehicle: "Véhicule au sol",
  unknown: "Inconnu",
};

const KIND_COLORS: Record<string, string> = {
  commercial: "#2563eb",
  privateJet: "#7c3aed",
  generalAviation: "#0891b2",
  helicopter: "#16a34a",
  militaryHelicopter: "#b91c1c",
  military: "#b91c1c",
  glider: "#65a30d",
  balloon: "#ea580c",
  uav: "#4b5563",
  groundVehicle: "#78716c",
  unknown: "#9ca3af",
};

export default function ShowAllPlanesData()
{
    const planes = globalCache.getAdsbCache();

    return (
        <ul style={{ listStyle: "none", padding: 0 }}>
            {planes.map((plane: any) => (
                <li
                    key={plane.icao24}
                    style={{
                        border: "1px solid #e5e7eb",
                        borderLeft: `4px solid ${KIND_COLORS[plane.kind] ?? "#9ca3af"}`,
                        borderRadius: 6,
                        padding: "8px 12px",
                        marginBottom: 6,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <strong>
                            {plane.callsign?.trim() || plane.icao24}
                            {plane.registration ? ` (${plane.registration})` : ""}
                        </strong>
                        <span style={{ fontSize: 12, color: KIND_COLORS[plane.kind] ?? "#6b7280" }}>
                            {KIND_LABELS[plane.kind] ?? plane.kind ?? "?"}
                            {plane.isMilitary ? " · Militaire" : ""}
                        </span>
                    </div>

                    <div style={{ fontSize: 13, color: "#374151" }}>
                        {plane.typeLabel ?? plane.typeCode ?? "Type inconnu"}
                        {plane.engines ? ` · ${plane.engines} réacteur${plane.engines > 1 ? "s" : ""}` : ""}
                    </div>

                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        id: {plane.icao24}
                        {" | "}pays: {plane.originCountry ?? "—"}
                        {" | "}lon: {plane.longitude?.toFixed?.(3) ?? "?"}
                        {" | "}lat: {plane.latitude?.toFixed?.(3) ?? "?"}
                        {" | "}alt: {plane.onGround ? "au sol" : `${plane.altitude ?? "?"} ft`}
                        {" | "}cap: {plane.heading ?? "?"}°{" | "}vit: {plane.velocity ?? "?"} kt
                        {plane.verticalRate != null ? ` | vz: ${plane.verticalRate} ft/min` : ""}
                        {plane.squawk ? ` | squawk: ${plane.squawk}` : ""}
                    </div>

                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        source: {plane.source}
                        {plane.lastSeenSeconds != null ? ` · vu il y a ${plane.lastSeenSeconds.toFixed(1)}s` : ""}
                    </div>
                </li>
            ))}
        </ul>
    );
}