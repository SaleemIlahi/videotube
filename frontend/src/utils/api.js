const baseUrl = "http://localhost:8000/api/v1";

const postMethod = async (props) => {
  try {
    const { url, b } = props;
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: b,
    });

    const output = await res.json();
    return output;
  } catch (error) {}
};

export const register = async (b) => {
  try {
    const res = await postMethod({ url: `${baseUrl}/auth/register`, b });
    return res;
  } catch (error) {
    console.log(error);
  }
};
