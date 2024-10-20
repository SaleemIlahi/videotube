import React from "react";
import S from "../styles/modal.module.scss";
import Icon from "../components/Icons";
function Modal(props) {
  const { title, close, Component } = props;
  return (
    <div className={S.modal_fullscreen}>
      <div className={S.modal_cnt}>
        <div className={S.modal_cnt_header}>
          <div className={S.modal_cnt_header_title}>{title}</div>
          <div className={S.modal_cnt_header_close} onClick={close}>
            <Icon name="close" />
          </div>
        </div>
        <div className={S.modal_cnt_body}>
          <Component />
        </div>
      </div>
    </div>
  );
}

export default Modal;
