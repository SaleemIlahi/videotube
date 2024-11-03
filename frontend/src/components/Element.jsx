import React, { useState, useRef, useEffect } from "react";
import S from "../styles/element.module.scss";
import Icons from "./Icons";

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
  const [url, setUrl] = useState(null);
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUrl(() => ({
          src: reader.result,
          file: file,
        }));

        set(data.name, e.target.files[0], reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setUrl(null);
    }
  };

  useEffect(() => {
    setUrl({
      src: get(data.name),
    });
  }, []);
  return (
    <div style={data.style} className={S.field_box + " " + S.file}>
      <input
        style={data?.style}
        name={data.name}
        type="file"
        id={data.name}
        onChange={handleImagePreview}
        accept={data.accept}
        disabled={data?.disabled ?? false}
      />
      {data.accept === "video/mp4" && url?.src ? (
        <div className={S.video_preview}>
          <video>
            <source src={url.src} />
          </video>
        </div>
      ) : (
        <label
          className={
            data.accept === "image/*" && url?.src
              ? S.file_upload + " " + S.file_upload_after
              : S.file_upload
          }
          htmlFor={data.name}
          style={
            data?.accept === "image/*"
              ? url?.src && {
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  backgroundImage: `url(${url?.src})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundBlendMode: "overlay",
                  borderRadius: "5px",
                }
              : {}
          }
        >
          {data.icon && (
            <div className={S.file_icon}>
              <Icons name={data.icon} />
            </div>
          )}
          <div className={S.file_placeholder}>{data?.placeholder}</div>
        </label>
      )}
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

const Textarea = (props) => {
  const { data, set, get } = props;

  return (
    <div className={S.field_box}>
      <div className={S.textarea}>
        <textarea
          className={S.content}
          onChange={(e) => set(data.name, e.target.value)}
          placeholder={data.placeholder}
          value={get(data.name)}
        ></textarea>
        {data.characterLimit && (
          <div className={S.character_count}>
            {get(data.name)?.length || 0} /{data.characterLimit}
          </div>
        )}
      </div>
    </div>
  );
};

const MultiSelect = (props) => {
  const { data, set, get } = props;
  const optionRef = useRef(null);
  const [search, setSearch] = useState(null);
  const [optionsData, setOpitonsData] = useState(data.options);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [listValue, setListValue] = useState([]);
  const handleClickOutside = (event) => {
    if (optionRef.current && !optionRef.current.contains(event.target)) {
      setOptionsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setOpitonsData(
      search
        ? data.options.filter((val) =>
            val.name.toString()?.toLowerCase().includes(search)
          )
        : data.options
    );
  }, [search]);

  const handleCheckValue = (e) => {
    let value = e.target.getAttribute("data-name");
    let id = e.target.id;
    let checked = e.target.checked;
    if (checked) {
      setListValue((l) => [...l, { id, name: value }]);
    } else {
      setListValue((l) => l.filter((o) => o.id !== id));
    }
  };

  const handleListAdd = () => {
    set(data.name, listValue);
    setOptionsOpen(false);
  };
  return (
    <div className={S.multiselect_cnt}>
      <div
        className={S.value_selected}
        onClick={() => setOptionsOpen((o) => !o)}
      >
        {get(data.name).length > 0 ? (
          <div className={S.value}>
            {get(data.name)?.length > 1
              ? get(data.name)?.length + " " + data.name
              : get(data.name)?.[0]?.name}
          </div>
        ) : (
          <div className={S.placeholder}>{data.placeholder}</div>
        )}
        <div className={S.arrow}>
          <Icons name="down_arrow" />
        </div>
      </div>
      {optionsOpen && (
        <div className={S.dropdown} ref={optionRef}>
          <div className={S.search}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search"
            />
            <Icons name="search" />
          </div>
          <div className={S.options}>
            {optionsData.length > 0 ? (
              optionsData?.map((o, i) => (
                <div
                  key={o.id}
                  htmlFor={o.id}
                  className={S.options_items}
                  data-id={o.id}
                >
                  <label htmlFor={o.id} class={S.custom_checkbox}>
                    <input
                      onChange={handleCheckValue}
                      id={o.id}
                      name={data.name}
                      data-name={o.name}
                      checked={listValue?.some((c) => c.id === o.id)}
                      type="checkbox"
                    />
                    <span></span>
                    {o.name}
                  </label>
                </div>
              ))
            ) : (
              <div className={S.no_option_found}>No options found</div>
            )}
          </div>
          <div className={S.footer}>
            <button onClick={handleListAdd}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Element = (props) => {
  const { data } = props;
  return (
    data.type && (
      <div className={S.element_container}>
        {data?.label && <Label {...data} />}
        {(data?.type === "text" && <Text {...props} />) ||
          (data?.type === "password" && <Password {...props} />) ||
          (data?.type === "email" && <Email {...props} />) ||
          (data?.type === "file" && <File {...props} />) ||
          (data?.type === "textarea" && <Textarea {...props} />) ||
          (data?.type === "multiselect" && <MultiSelect {...props} />) ||
          (data?.type === "button" && <Button {...props} />)}
      </div>
    )
  );
};

export default Element;
