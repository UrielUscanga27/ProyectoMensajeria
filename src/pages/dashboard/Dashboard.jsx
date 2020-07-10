import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import Chart from "./Chart";
import Deposits from "./Deposits";
import Orders from "./Orders.jsx";
import AMDrawerPaper from "../common/AMDrawerPaper";
import useLocalStorage from "react-use-localstorage";
import axios from "axios";
import { Button, ButtonBase, Modal } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from '@material-ui/core/Checkbox';
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  // Estilo de la tabla
  table: {
    minWidth: 650,
  },

  root: {
    flexGrow: 1,
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  fixedHeight: {
    height: 240,
  },
  userCard: {
    cursor: "pointer",
  },

  /* -Estilo para popup -*/
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const drawerWidth = 240;

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

/*
Variables y ENDPOINT USADOS
*/
export default function Dashboard({ history }) {
  const [token, setToken] = useLocalStorage("timestamp", null);
  const [user, setUser] = useLocalStorage("user", null);
  const [userAdmin, setUserAdmin] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState(null);
  const [usuarioSelec, setUsuarioSelec] = useState(null);
  const BASEURL = "https://matrix.imperiomonarcas.com";
  const DOMINIO = "imperiomonarcas.com";
  const ENDPOINT_USER = "/_synapse/admin/v2/users";
  const ENDPOINT_ALLUSERS = "/_synapse/admin/v2/users?deactivated=true";
  const ENDPOINT_DESACTIVAR = "/_synapse/admin/v1/deactivate";
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [mostrandoDetalles, setMostrandoDetalles] = useState(false);
  const [mostrarRegistrar, setMostrarRegistrar] = useState(false);
  const [modalStyle] = useState(getModalStyle);
  const [desactivar, setDesactivar] = useState(0);
  const [nombreUser, setnombreUser] = useState("");
  const [passwordUsuario, setpasswordUsuario] = useState("");
  const [checked, setChecked] = React.useState(true);

  const handleNombreUsuarioChange = (event) => {
    const { value } = event.currentTarget;
    console.log(value);
    setnombreUser(value);
  };
  const handlePasswordUsuarioChange = (event) => {
    const { value } = event.currentTarget;
    console.log(value);
    setpasswordUsuario(value);
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setToken("");
    history.replace("/login");
  };

  const ocultarDetalles = () => {
    setMostrandoDetalles(false);
  };
  const ocultarRegistrar = () => {
    setMostrarRegistrar(false);
  };

  useEffect(() => {
    setUserAdmin(JSON.parse(user));
    getUsers();
  }, []);




  /* ---- ---- ----*/
  /*
   *FUNCION OCUPADA PARA CONSUMIR
   *EL SERVICIO DE ENLISTAR LOS USUARIOS
   *DE MATRIX.
   */

  async function getUsers() {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        `${BASEURL}${ENDPOINT_ALLUSERS}`,
        config
      );
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
  const handleClickAgregar = (event) => {
    event.preventDefault();
    putAgregar();
  };
 
  /*
   *FUNCION OCUPADA PARA CONSUMIR
   *EL SERVICIO DE OBTENER LA
   *INFORMACION DE LOS USUARIOS
   *DE MATRIX.
   */
  async function getInfoUser(nombreUsuario) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        `${BASEURL}${ENDPOINT_USER}/${nombreUsuario}`,
        config
      );
      if (response.data) {
        setUsuarioSelec(response.data);
      }
    } catch (error) {
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }

  /*
   *FUNCION OCUPADA PARA CONSUMIR
   *EL SERVICIO DE DESACTIVAR UN
   *USUARIO DE MATRIX.
   */
  async function postDesactivaUser() {
    try {
      if (!!desactivar && desactivar > 0) {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.post(
          `${BASEURL}${ENDPOINT_DESACTIVAR}/${usuarioSelec.name}`,
          {},
          config
        );
        if ((response.data.id_server_unbind_result = "success")) {
          getUsers();
          usuarioSelec.deactivated = 1;
          setDesactivar(0);
        }
      } else {
        setDesactivar(1);
      }
    } catch (error) {
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }


  /*
   *FUNCION OCUPADA PARA CONSUMIR
   *EL SERVICIO DE AGREGAR USUARIOS
   *A MATRIX.
   */

  async function putAgregar() {
    try {
      const data = {
        password: passwordUsuario
      
      };
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.put(
        `${BASEURL}${ENDPOINT_USER}/@${nombreUser}:${DOMINIO}`,data,
        config
      );
      if (response.data) {
        getUsers()
        
      }
    } catch (error) {
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }



  /*  === PopUp Usuario ===  */
  const abrirDetallesUsuario = (event) => {
    event.preventDefault();
    const { key } = event._targetInst;

    getInfoUser(key);
    setMostrandoDetalles(true);
    console.log("test" + key);
  };

  /*  === PopUp URegistrar suario ===  */
  const abrirRegistrar = (event) => {
    event.preventDefault();
    setMostrarRegistrar(true);
    console.log("test");

  };




  /*
   *HEADER DE LA PAGINA
   *QUE INDICA QUE ADMINISRADOR
   *INICIO SESIÓN
   */
  return (
    <div className={classes.root}>
      <AMDrawerPaper
        titulo={`¡Bienvenido ${
          !!userAdmin && !!userAdmin.name ? userAdmin.name : ""
          }!`}
      />


      <br></br>
      <main className={classes.content}>

        <div className={classes.appBarSpacer} />
        <Button
          type="submit"
          // fullWidth
          variant="contained"
          color="primary"
          onClick={abrirRegistrar}
        >
          Agregar Nuevo usuario
      </Button>

        <Container maxWidth="lg" className={classes.container}>
          {!!listaUsuarios ? (
            <Grid container spacing={2}>
              <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Usuario</TableCell>
                      <TableCell align="center">Tipo de usuario</TableCell>
                      <TableCell align="center">Estatus del usuario</TableCell>
                      <TableCell align="center">Detalles de usuario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listaUsuarios.map((user) => (
                      <TableRow key={user.name}>
                        <TableCell component="th" scope="row" align="center">
                          {user.name}
                        </TableCell>
                        <TableCell align="center">
                          {" "}
                          {!!user && user.admin == 0 ? (
                            <strong>Mensajería</strong>
                          ) : (
                              <strong>Administrador</strong>
                            )}
                        </TableCell>
                        <TableCell align="center">
                          {!!user && user.deactivated == 0 ? (
                            <strong>Activo</strong>
                          ) : (
                              <i>Inactivo</i>
                            )}
                        </TableCell>
                        <TableCell align="center">
                          <button
                            type="button"
                            key={user.name}
                            onClick={abrirDetallesUsuario}
                          >
                            Detalles
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Modal
                open={mostrandoDetalles}
                onClose={ocultarDetalles}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
              >
                {!!usuarioSelec ? (
                  <div style={modalStyle} className={classes.paper}>
                    <h3>Usuario: {usuarioSelec.name}</h3>
                    {!!usuarioSelec.admin == 0 ? (
                      <h3>Tipo de usuario: Mensajeria</h3>
                    ) : (
                        <h3>Tipo de usuario: Administrador</h3>
                      )}
                    <h3>Fecha de Creacion: {usuarioSelec.creation_ts}</h3>
                    <h3>Display name: {usuarioSelec.displayname}</h3>

                    {!!desactivar == 1 ? (
                      <div>
                        <h3>¿Nuevamente de click en el botón para confirmar la
                        acción? </h3>
                      </div>
                    ) : (
                        ""
                      )}

                    {!!usuarioSelec.deactivated == 0 ? (
                      <strong>
                        <Button variant="contained" color="primary" align="center" type="button" onClick={postDesactivaUser} >
                          DESACTIVAR
                        </Button>{" "}
                      </strong>
                    ) : (
                        <i>
                          <strong>
                            <Button type="button">ACTIVAR</Button>{" "}
                          </strong>
                        </i>
                      )}
                  </div>
                ) : (
                    <div>No hay datos del usuario</div>
                  )}
              </Modal>

            </Grid>
          ) : (
              <Grid container spacing={1}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <div>
                      <h4>No existen usuarios</h4>
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            )}
        </Container>
        <Modal
          open={mostrarRegistrar}
          onClose={ocultarRegistrar}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description">
          <div style={modalStyle} className={classes.paper}>
            <h3 align="center" >Registrar Usuarios</h3>
            
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="usuario"
                label="Nombre del usuario:"
                name="usuario"
                autoComplete="usuario"
                autoFocus
                onChange={handleNombreUsuarioChange}
              />
            <p></p>

           <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="contrasena"
                label="Contraseña:"
                type="password"
                name="contraseña"
                autoComplete="contraseña"
                autoFocus
                onChange={handlePasswordUsuarioChange}
              />
            <p></p>
            <label>Administrador</label>
            <Checkbox
              checked={checked}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
<p></p>
            <Button color="primary" align="center" type="button" onClick={handleClickAgregar} >
              Guardar
             </Button>

          </div>
        </Modal>
      </main>
    </div>
  );
}
