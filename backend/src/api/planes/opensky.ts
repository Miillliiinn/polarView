const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const STATES_URL = 'https://opensky-network.org/api/states/all?lamin=37.5&lamax=55.5&lomin=-9.0&lomax=13.0';

/**
 * Encapsule le token OAuth2 OpenSky (récupération + cache mémoire + refresh).
 * Instancier une seule fois (ex: en champ privé du service) pour profiter du cache.
 */
export class OpenskyTokenManager {
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private clientId: string, private clientSecret: string) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!res.ok) {
      throw new Error(`Erreur récupération token OAuth2 : ${res.status}`);
    }

    const data = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = now + (data.expires_in - 30) * 1000;

    return this.accessToken as string;
  }
}

export async function fetchOpenskyStates(tokenManager: OpenskyTokenManager) {
  try {
    const token = await tokenManager.getAccessToken();

    const apiResult = await fetch(STATES_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!apiResult.ok) {
      throw new Error(`Opensky Network repond avec un statut : ${apiResult.status}`);
    }

    const data = await apiResult.json();
    const state = data.states || [];

    console.log("✈️  OpenSky Api request ✈️");
    //console.log(apiResult.headers);
    return state
      .filter((f: any) => f[5] !== null && f[6] !== null)
      .map((f: any) => ({
        icao24: f[0],
        callsign: f[1]?.trim(),
        country: f[2],
        longitude: f[5],
        latitude: f[6],
        altitude: f[7] || f[13] || 0,
        onGround: !!f[8],
        heading: f[10] || 0,
        velocity: f[9] || 0,
        verticalRate: f[11] ?? null,
        squawk: f[14] ?? null,
        category: f[17] ?? 0,
      }));
  }
  catch (e) {
    console.error("Error 'fetchOpenskyStates()' : ", e);
    return [];
  }
}
