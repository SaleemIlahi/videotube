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

export const login = async (b) => {
  try {
    const res = await postMethod({
      url: `${baseUrl}/auth/login`,
      b,
      header: true,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
