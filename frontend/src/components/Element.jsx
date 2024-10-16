import React, { useState } from "react";
import S from "../styles/element.module.scss";

const Label = (data) => {
  const { label } = data;
  return <div className={S.element_label}>{label}</div>;
};

const Text = (props) => {
  const { data, set, get } = props;
  return (
    <div className={S.field_box}>
      <input
        style={data?.style}
        name={data.name}
        type="text"
        value={get(data.name) || ""}
        onChange={(e) => set(data.name, e.target.value)}
        placeholder={data?.placeholder}
      />
    </div>
  );
};

const Email = (props) => {
  const { data, set, get } = props;
  return (
    <div className={S.field_box}>
      <input
        style={data?.style}
        name={data.name}
        type="email"
        value={get(data.name) || ""}
        onChange={(e) => set(data.name, e.target.value)}
        placeholder={data?.placeholder}
      />
    </div>
  );
};

const Password = (props) => {
  const { data, set, get } = props;
  return (
    <div className={S.field_box}>
      <input
        style={data?.style}
        name={data.name}
        type="password"
        value={get(data.name) || ""}
        onChange={(e) => set(data.name, e.target.value)}
        placeholder={data?.placeholder}
      />
    </div>
  );
};

const File = (props) => {
  const { data, set, get } = props;
  const [imageSrc, setImageSrc] = useState(null);
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
      set(data.name, e.target.files[0]);
    } else {
      setImageSrc(null);
    }
  };
  return (
    <div className={S.field_box + " " + S.file}>
      <input
        style={data?.style}
        name={data.name}
        type="file"
        id={data.name}
        onChange={handleImagePreview}
        accept="image/* ,video/*"
      />
      <label className={S.file_placeholder} htmlFor={data.name}>
        {imageSrc ? (
          <img src={imageSrc} alt="image preview" />
        ) : (
          data?.placeholder
        )}
      </label>
    </div>
  );
};

const Button = (props) => {
  const { data, set } = props;
  return (
    <button
      name={data.name}
      className={S.button}
      onClick={(e) => set(e, data.name)}
    >
      {data.text}
    </button>
  );
};

const Element = (props) => {
  const { data } = props;
  return (
    <div className={S.element_container}>
      {data?.label && <Label {...data} />}
      {(data?.type === "text" && <Text {...props} />) ||
        (data?.type === "password" && <Password {...props} />) ||
        (data?.type === "email" && <Email {...props} />) ||
        (data?.type === "file" && <File {...props} />) ||
        (data?.type === "button" && <Button {...props} />)}
    </div>
  );
};

export default Element;
