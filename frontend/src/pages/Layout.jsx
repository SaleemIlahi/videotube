import React from "react";
import S from "../styles/layout.module.scss";
import { useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";

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
  return (
    <div className={S.layout_cnt}>
      <div className={S.layout_cnt_sidebar}>
        <Sidebar />
      </div>
      <div className={S.layout_cnt_content}>
        <div className={S.layout_cnt_content_header}></div>
        <div className={S.layout_cnt_content_body}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
