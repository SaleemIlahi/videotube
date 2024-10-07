import React, { useState } from "react";
import { AuthContainer } from "./Login";

const Register = () => {
  const [inputData, setInputData] = useState({
    name: "",
    password: "",
  });
  const inputSchema = [
    {
      type: "text",
      name: "username",
      placeholder: "Username",
    },
    {
      type: "text",
      name: "fullname",
      placeholder: "Full Name",
    },
    {
      type: "email",
      name: "email",
      placeholder: "Email Id",
    },
    {
      type: "password",
      name: "password",
      placeholder: "Password",
    },
    {
      type: "file",
      name: "avatar",
      placeholder: "Upload Avatar",
    },
    {
      type: "file",
      name: "cover_img",
      placeholder: "Upload Cover Image",
    },
  ];
  return (
    <>
      <AuthContainer
        setFields={setInputData}
        getFields={inputData}
        data={inputSchema}
        title="Sign Up"
        name="sign-up"
      />
    </>
  );
};

export default Register;
