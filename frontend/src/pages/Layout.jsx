import React, { useState } from "react";
import S from "../styles/layout.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../utils/api";
import { LOGOUT } from "../features/authSlice";

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
const Layout = () => {
  const [profileMenuActive, setProfileMenuActive] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userLogout = async () => {
    const res = await logout();
    if (res.statusCode === 200) {
      navigate("/", { replace: true });
      dispatch(LOGOUT());
    }
  };

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
            <div className={S.menu}>
              {profileMenuActive && (
                <ul className={S.list}>
                  {menuList.map((o) => (
                    <li key={o.id} onClick={o.fun}>
                      {o.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className={S.layout_cnt_content_body}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
