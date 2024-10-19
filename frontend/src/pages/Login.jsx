import React, { useState } from "react";
import S from "../styles/auth.module.scss";
import Element from "../components/Element";
import { login } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LOGIN } from "../features/authSlice.js";

export const AuthContainer = (props) => {
  const {
    data,
    setFields,
    getFields,
    title,
    name,
    submit,
    errorMsg,
    setErrorMsg,
  } = props;
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
          {errorMsg && (
            <div className={S.auth_container_body_err}>{errorMsg}</div>
          )}
          <div className={S.auth_container_body_box_fields}>
            {data.map((o, i) => (
              <div
                key={i}
                className={
                  o?.flex
                    ? S.auth_container_body_box_fields_item + " " + S.flex
                    : S.auth_container_body_box_fields_item
                }
              >
                <Element
                  data={o}
                  set={(n, v) => {
                    setErrorMsg(null);
                    setFields((prev) => ({ ...prev, [n]: v }));
                  }}
                  get={(n) => getFields[n]}
                />
              </div>
            ))}
          </div>
          <div className={S.auth_container_body_box_button}>
            <Element
              data={{ type: "button", name: name, text: title }}
              set={(e, n) => submit(e, n)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [inputData, setInputData] = useState({
    username: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState(null);
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e, n) => {
    try {
      const emptyFieldsCheck = Object.entries(inputData).filter(
        ([k, v]) => v === ""
      );
      const emptyFieldsName = emptyFieldsCheck.map(([k, v]) => k).join(", ");
      if (emptyFieldsCheck.length > 0) {
        setErrorMsg(`${emptyFieldsName} is required fields`);
        return;
      }
      const res = await login(JSON.stringify(inputData), "POST");
      if (res.statusCode === 200) {
        dispatch(LOGIN(res.data));
        navigate("/home");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <AuthContainer
        setFields={setInputData}
        getFields={inputData}
        data={inputSchema}
        title="Sign In"
        name="sign-in"
        submit={(e, n) => handleSubmit(e, n)}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
      />
    </>
  );
};

export default Login;
