import S from "./styles/app.module.scss";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className={S.app}>
      {/* <Login /> */}
      <Register />
    </div>
  );
}

export default App;
