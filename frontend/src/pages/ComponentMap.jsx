import { lazy } from "react";
const Home = lazy(() => import("./Home"));
const Subscriptions = lazy(() => import("./Subscriptions"));
const Playlist = lazy(() => import("./Playlist"));
const Tweets = lazy(() => import("./Tweets"));
const Studio = lazy(() => import("./Studio"));
const Analytics = lazy(() => import("./Analytics"));
const Users = lazy(() => import("./Users"));

const componentsMap = {
  Home,
  Subscriptions,
  Playlist,
  Tweets,
  Studio,
  Analytics,
  Users,
};

export default componentsMap;
