import React, { useState } from "react";
import S from "../styles/auth.module.scss";
import Element from "../components/Element";

export const AuthContainer = (props) => {
  const { data, setFields, getFields, title, name } = props;
  return (
    <div className={S.auth_container}>
      <div
        className={
          name === "sign-up"
            ? S.auth_container_body + " " + S.extend
            : S.auth_container_body
        }
      >
        <h1 className={S.auth_container_body_header}>{title}</h1>
        <div className={S.auth_container_body_box}>
          {data.map((o, i) => (
            <div key={i} className={S.auth_container_body_box_fields}>
              <Element
                data={o}
                set={(n, v) => setFields((prev) => ({ ...prev, [n]: v }))}
                get={(n) => getFields[n]}
              />
            </div>
          ))}
          <Element
            data={{ type: "button", name: name, text: title }}
            set={(e, n) => console.log(e, n)}
          />
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [inputData, setInputData] = useState({
    name: "",
    password: "",
  });
  const inputSchema = [
    {
      type: "text",
      name: "username",
      placeholder: "Username or Email",
    },
    {
      type: "password",
      name: "password",
      placeholder: "Password",
    },
  ];
  return (
    <>
      <AuthContainer
        setFields={setInputData}
        getFields={inputData}
        data={inputSchema}
        title="Sign In"
        name="sign-in"
      />
    </>
  );
};

export default Login;
