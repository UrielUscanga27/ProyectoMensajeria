import React, { useState, useEffect } from "react";
import useLocalStorage from "react-use-localstorage";
import { Button } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import axios from "axios";

const Dashboard = ({ history }) => {
  const [token, setToken] = useLocalStorage("timestamp", null);
  const [user, setUser] = useLocalStorage("user", null);
  const [userAdmin, setUserAdmin] = useState(null);

  const [listaUsuarios, setListaUsuarios] = useState([]);

  const BASEURL = "https://matrix.imperiomonarcas.com";
  const ENDPOINT_USER = "/_synapse/admin/v2/users";

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    setToken("");
    history.replace("/login");
  };

  useEffect(() => {
    setUserAdmin(JSON.parse(user));
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${BASEURL}${ENDPOINT_USER}`, config);
      if (response.data.total > 0) {
        setListaUsuarios(response.data.users);
      }
    } catch (error) {
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }

  return (
    <div>
      <div>
        <h1>Dashboard</h1>
        <h5>Usuario Administrador: {!!userAdmin ? userAdmin.name : ""}</h5>
      </div>

      <div>
        {!!listaUsuarios ? (
          <li>{listaUsuarios.map((item) => item.name)}</li>
        ) : (
          <div>No hay usuarios</div>
        )}
        <h6>Listado de usuarios de mensajería</h6>
        <ul></ul>
      </div>

      <Button variant="contained" color="primary" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default withRouter(Dashboard);
