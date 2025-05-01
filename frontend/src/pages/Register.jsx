import React, { useState } from "react";
import { AuthContainer } from "./Login";
import { register } from "../utils/api";
import { useAsyncHandler } from "../utils/asyncHandler.js";
import { useDispatch } from "react-redux";
import { ERROR } from "../features/errorSlice.js";
import S from "../styles/multistepform.module.scss";
import Element from "../components/Element";
import useMultiStepForm from "../utils/MultiStepForm.js";

const StepContainer = (props) => {
  const {
    steps,
    data,
    setFields,
    getFields,
    title,
    name,
    submit,
    errorMsg,
    setErrorMsg,
  } = props;
  const {
    RenderStep,
    currentIndex,
    totalStep,
    currentStep,
    next,
    back,
    isLastStep,
    isFirstStep,
  } = useMultiStepForm(steps);
  return (
    <div className={S.multiform_container}>
      <div className={S.multiform_container_body}>
        <h1 className={S.multiform_container_body_header}>{title}</h1>
        <div className={S.multiform_container_body_box}>{RenderStep}</div>
        <div className={S.multiform_container_body_button}>
          {!isFirstStep && (
            <div>
              <Element
                data={{ type: "button", name: "back", text: "Back" }}
                set={back}
              />
            </div>
          )}
          {!isLastStep && (
            <div>
              <Element
                data={{ type: "button", name: "next", text: "Next" }}
                set={next}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [inputData, setInputData] = useState({
    username: "",
    password: "",
    email: "",
    fullname: "",
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const dispatch = useDispatch();

  const step1 = [
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
  ];

  const step2 = [
    {
      type: "text",
      name: "otp",
      placeholder: "OTP",
    },
  ];

  const elementRender = (elementJson) => {
    let element = [];
    elementJson.forEach((o) => {
      element.push(
        <div style={{ margin: "10px 0", height: "35px" }}>
          <Element
            key={JSON.stringify(o)}
            data={o}
            set={(n, v) => {
              setErrorMsg(null);
              setInputData((prev) => ({ ...prev, [n]: v }));
            }}
            get={(n) => inputData[n]}
          />
        </div>
      );
    });
    return element;
  };

  let steps = [elementRender(step1), elementRender(step2)];

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

  const [handleSubmit] = useAsyncHandler(
    async (e, n) => {
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
        formData.append("avatar", inputData.avatar);
      }
      if (inputData.cover_img) {
        formData.append("coverImage", inputData.cover_img);
      }
      const res = await register(formData);
      return res;
    },
    {
      onSuccess: (res) => {
        if (res.statusCode === 200) {
          dispatch(
            ERROR({
              message: res.message,
              type: "success",
              timeline: true,
              status: true,
            })
          );
        } else if (res.statusCode >= 400 && res.statusCode <= 500) {
          setErrorMsg(res.message);
        } else {
          dispatch(
            ERROR({
              message: res.message,
              type: "danger",
              timeline: true,
              status: true,
            })
          );
        }
      },
    }
  );
  return (
    <>
      <StepContainer
        steps={steps}
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
