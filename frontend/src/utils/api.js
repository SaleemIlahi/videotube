const baseUrl = "http://localhost:8000/api/v1";

const postMethod = async (props) => {
  const { url, b, header } = props;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: header
      ? {
          "Content-Type": "application/json",
        }
      : {},
    body: b,
  });

  const output = await res.json();
  return output;
};

const getMethod = async (props) => {
  const { url } = props;
  const res = await fetch(url, {
    credentials: "include",
  });

  const output = await res.json();
  return output;
};

export const register = async (b) => {
  const res = await postMethod({
    url: `${baseUrl}/auth/register`,
    b,
    header: false,
  });
  return res;
};

export const login = async (b, t) => {
  if (t === "POST") {
    const res = await postMethod({
      url: `${baseUrl}/auth/login`,
      b,
      header: true,
    });
    return res;
  } else {
    const res = await getMethod({
      url: `${baseUrl}/auth/login`,
    });
    return res;
  }
};

export const logout = async () => {
  const res = await postMethod({
    url: `${baseUrl}/auth/logout`,
    header: true,
  });
  return res;
};

export const uploadVideo = async (b) => {
  const res = await postMethod({
    url: `${baseUrl}/video/upload`,
    b,
    header: false,
  });
  return res;
};

export const updateVideo = async (b) => {
  const res = await postMethod({
    url: `${baseUrl}/video/update`,
    b,
    header: true,
  });
  return res;
};

export const videosByUser = async () => {
  const res = await getMethod({
    url: `${baseUrl}/video/videos`,
  });
  return res;
};
