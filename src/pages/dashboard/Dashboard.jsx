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

/*
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
*/

/** ESTILOS **/

const drawerWidth = 240;

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
  const ENDPOINT_USER = "/_synapse/admin/v2/users";
  const ENDPOINT_ALLUSERS = "/_synapse/admin/v2/users?deactivated=true";
  const ENDPOINT_DESACTIVAR = "/_synapse/admin/v1/deactivate";
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [mostrandoDetalles, setMostrandoDetalles] = useState(false);
  const [modalStyle] = useState(getModalStyle);

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
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.post(
        `${BASEURL}${ENDPOINT_DESACTIVAR}/${usuarioSelec.name}`,
        config
      );
      if (response.data) {
        postDesactivaUser(response.data);
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

      <Button
        type="submit"
        // fullWidth
        variant="contained"
        color="primary"
      >
        Agregar Nuevo usuario
      </Button>

      <br></br>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
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
                    
                    {!!usuarioSelec.deactivated == 0 ? (
                      <strong>
                        <button type="button" onClick={postDesactivaUser}
                         
                        >
                          DESACTIVAR
                              </button> </strong>
                    ) : (
                        <i><strong>
                        <button type="button"
                       
                        
                        >
                          ACTIVAR
                              </button> </strong></i>
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
      </main>
    </div>
  );
}
