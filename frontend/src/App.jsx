import { Suspense, useEffect, useState } from "react";
import S from "./styles/app.module.scss";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import componentsMap from "./pages/ComponentMap";
import { useSelector, useDispatch } from "react-redux";
import { login } from "./utils/api";
import { LOGIN, HISTTORY } from "./features/authSlice";
import Watch from "./pages/Watch";
import { ErrorBoundary } from "react-error-boundary";
import ErrorBoundaries from "./components/ErrorBoundary";
import { useAsyncHandler } from "./utils/asyncHandler";

const NotFound = () => {
  return (
    <div className={S.notfound}>
      <div className={S.notfound_404}>404</div>
      <div className={S.notfound_page}>Page Not Found</div>
      <Link to="/" className={S.notfound_home}>
        Back to home
      </Link>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const auth = useSelector((state) => state.authReducer.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname;
  const search = location.search;
  const whiteListPath = ["/", "/sign-in", "/sign-up"];

  if (!auth) {
    if (whiteListPath.every((o) => o !== path)) {
      dispatch(HISTTORY(`${path}${search}`));
    }

    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

const NonProtectedRoute = ({ children }) => {
  const auth = useSelector((state) => state.authReducer);

  if (auth.auth) {
    if (auth.browserHistory) {
      return <Navigate to={auth.browserHistory} replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export const Loading = () => {
  return (
    <div className={S.loading_screen}>
      <div className={S.loading}>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isUserLoggedIn] = useAsyncHandler(async () => {
    const res = await login(undefined, "GET");
    if (res.statusCode === 200) {
      dispatch(LOGIN(res.data));
      setLoading(false);
    } else {
      setLoading(false);
    }
  });
  useEffect(() => {
    isUserLoggedIn();
  }, [dispatch]);

  const auth = useSelector((state) => state.authReducer.auth);

  return loading ? (
    <Loading />
  ) : (
    // <ErrorBoundary fallback={<ErrorBoundaries />}>
    <div className={S.app}>
      <Suspense fallback={<Loading />}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/watch"
                element={
                  <ProtectedRoute>
                    <Watch />
                  </ProtectedRoute>
                }
              />
              {auth?.routes?.map((route, i) => {
                const Component = componentsMap[route.component];
                return (
                  <Route
                    key={i}
                    path={route.id}
                    element={
                      <ProtectedRoute>
                        <Component />
                      </ProtectedRoute>
                    }
                  />
                );
              })}
            </Route>
            <Route
              path="/sign-in"
              element={
                <NonProtectedRoute>
                  <Login />
                </NonProtectedRoute>
              }
            />
            <Route
              path="/sign-up"
              element={
                <NonProtectedRoute>
                  <Register />
                </NonProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Suspense>
    </div>
    // </ErrorBoundary>
  );
}

export default App;
