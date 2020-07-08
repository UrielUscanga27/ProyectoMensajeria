import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import NotFound from "./pages/404/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/login/Login";
import PrivateRoute from "./pages/routing-helper/PrivateRoute";
import CssBaseline from "@material-ui/core/CssBaseline";

const App = () => {
  return (
    <Router>
      <CssBaseline />
      <Switch>
        <Route exact path="/login" component={Login} />
        <PrivateRoute
          exact
          path="/dashboard"
          component={Dashboard}
          titulo={"Aplicación de mensajería"}
        />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;
