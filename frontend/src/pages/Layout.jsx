import React, { useState, useEffect, useRef } from "react";
import S from "../styles/layout.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../utils/api";
import { LOGOUT } from "../features/authSlice";
import Icons from "../components/Icons";
import { useAsyncHandler } from "../utils/asyncHandler.js";
import { ERROR } from "../features/errorSlice.js";

const Sidebar = () => {
  const routes = useSelector((state) => state.authReducer.auth?.routes);

  return (
    <div className={S.sidebar_cnt}>
      <div className={S.sidebar_cnt_logo}></div>
      <div className={S.sidebar_cnt_menu}>
        {routes?.map((o) => (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? S.sidebar_cnt_menu_link + " " + S.sidebar_cnt_menu_link_active
                : S.sidebar_cnt_menu_link
            }
            key={o.id}
            to={o.path}
          >
            <div className={S.sidebar_cnt_menu_link_item}>{o.label}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

const TOAST = (props) => {
  const dispatch = useDispatch();
  const { message, type, timeline } = props;

  useEffect(() => {
    setTimeout(() => {
      dispatch(ERROR(null));
    }, 5000);
  }, []);
  return (
    <div className={S.toast_cnt + " " + S[type]}>
      <div className={S.toast_body}>
        <div className={S.message_box}>
          <Icons name={type} />
          <div className={S.message}>{message}</div>
        </div>
        <div className={S.close} onClick={() => dispatch(ERROR(null))}>
          <Icons name="close" />
        </div>
      </div>
      {timeline && <div className={S.timeline}></div>}
    </div>
  );
};

const Menu = (props) => {
  const { active, setActive, list } = props;
  const listRef = useRef(null);
  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target)) {
      setActive(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className={S.menu} ref={listRef}>
      {active && (
        <ul className={S.list}>
          {list.map((o) => (
            <li key={o.id} onClick={o.fun}>
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Layout = () => {
  const [profileMenuActive, setProfileMenuActive] = useState(false);
  const error = useSelector((state) => state.errorReducer.error);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userLogout] = useAsyncHandler(
    async () => {
      const res = await logout();
      return res;
    },
    {
      onSuccess: (res) => {
        if (res.statusCode === 200) {
          navigate("/", { replace: true });
          dispatch(LOGOUT());
        }
      },
    }
  );

  const menuList = [
    {
      id: "profile",
      name: "Profile",
      fun: () => console.log("first"),
    },
    {
      id: "logout",
      name: "Logout",
      fun: userLogout,
    },
  ];

  return (
    <div className={S.layout_cnt}>
      <div className={S.layout_cnt_sidebar}>
        <Sidebar />
      </div>
      <div className={S.layout_cnt_content}>
        <div className={S.layout_cnt_content_header}>
          <div></div>
          <div className={S.layout_cnt_content_header_profile}>
            <div
              className={S.avatar}
              onClick={() => setProfileMenuActive((p) => !p)}
            ></div>
            <Menu
              active={profileMenuActive}
              list={menuList}
              setActive={setProfileMenuActive}
            />
          </div>
        </div>
        <div className={S.layout_cnt_content_body}>
          <Outlet />
        </div>
      </div>
      {error && <TOAST {...error} />}
    </div>
  );
};

export default Layout;
