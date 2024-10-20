import React, { useState } from "react";
import { AuthContainer } from "./Login";
import { register } from "../utils/api";

const Register = () => {
  const [inputData, setInputData] = useState({
    username: "",
    password: "",
    email: "",
    fullname: "",
  });
  const [errorMsg, setErrorMsg] = useState(null);
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
      accept: "image/*",
      placeholder: "Upload Your Profile Image",
      flex: true,
      icon: "image_upload",
    },
    {
      type: "file",
      name: "cover_img",
      accept: "image/*",
      placeholder: "Upload Your Cover Image",
      flex: true,
      icon: "image_upload",
    },
  ];

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const handleSubmit = async (e, n) => {
    try {
      const emptyFieldsCheck = Object.entries(inputData).filter(
        ([k, v]) => v === ""
      );
      const emptyFieldsName = emptyFieldsCheck.map(([k, v]) => k).join(", ");
      if (emptyFieldsCheck.length > 0) {
        setErrorMsg(`${emptyFieldsName} are required fields! Please fill`);
        return;
      }

      if (!validateEmail(inputData.email)) {
        setErrorMsg(`Enter valid email id`);
        return;
      }
      if (inputData.username.length < 3) {
        setErrorMsg(`Username should have atleast 4 charaters`);
        return;
      }
      if (inputData.password.length < 3) {
        setErrorMsg(`Password should have atleast 4 charaters`);
        return;
      }
      const formData = new FormData();
      formData.append("fullname", inputData.fullname);
      formData.append("email", inputData.email);
      formData.append("username", inputData.username);
      formData.append("password", inputData.password);
      if (inputData.avatar) {
        formData.append("avatar", inputData.avatar[0]);
      }
      if (inputData.cover_img) {
        formData.append("coverImage", inputData.cover_img?.[0]);
      }
      const res = await register(formData);
      console.log(res);
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
        title="Sign Up"
        name="sign-up"
        submit={(e, n) => handleSubmit(e, n)}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
      />
    </>
  );
};

export default Register;
