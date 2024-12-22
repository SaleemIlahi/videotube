import fetch from "node-fetch";

const location = async (req) => {
  const apiKey = process.env.GEO_LOCATION;
  const ipGeoUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`;
  const userAgentUrl = `https://api.ipgeolocation.io/user-agent?apiKey=${apiKey}`;
  const userAgent = req.headers["user-agent"];

  const [ipGeoResponse, userAgentResponse] = await Promise.all([
    fetch(ipGeoUrl),
    fetch(userAgentUrl, {
      headers: {
        "User-Agent": userAgent,
      },
    }),
  ]);

  const [ipGeoData, userAgentData] = await Promise.all([
    ipGeoResponse.json(),
    userAgentResponse.json(),
  ]);
  return { ipGeoData, userAgentData };
};

export { location };
