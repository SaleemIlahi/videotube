const baseUrl = "http://localhost:8000/api/v1";

const postMethod = async (props) => {
  try {
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
  } catch (error) {}
};

const getMethod = async (props) => {
  try {
    const { url } = props;
    const res = await fetch(url, {
      credentials: "include",
    });

    const output = await res.json();
    return output;
  } catch (error) {}
};

export const register = async (b) => {
  try {
    const res = await postMethod({
      url: `${baseUrl}/auth/register`,
      b,
      header: false,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const login = async (b, t) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

export const logout = async () => {
  try {
    const res = await postMethod({
      url: `${baseUrl}/auth/logout`,
      header: true,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
