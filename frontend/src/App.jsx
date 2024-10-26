import { Suspense, useLayoutEffect } from "react";
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
} from "react-router-dom";
import componentsMap from "./pages/ComponentMap";
import { useSelector, useDispatch } from "react-redux";
import { login } from "./utils/api";
import { LOGIN } from "./features/authSlice";

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

  if (!auth) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

const NonProtectedRoute = ({ children }) => {
  const auth = useSelector((state) => state.authReducer.auth);
  if (auth) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const Loading = () => {
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
  useLayoutEffect(() => {
    const isUserLoggedIn = async () => {
      const res = await login(undefined, "GET");
      if (res.statusCode === 200) {
        dispatch(LOGIN(res.data));
      }
    };
    isUserLoggedIn();
  }, [dispatch]);

  const auth = useSelector((state) => state.authReducer.auth);

  return (
    <div className={S.app}>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
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
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
