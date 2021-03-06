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
import TablePagination from "@material-ui/core/TablePagination";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  // Estilo de la tabla
  table: {
    minWidth: 650,
  },

  /*
*ESTILOS
*/

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

/* -FUNCION PARA EL MODAL -*/

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
DECLARACION DE VARIABLES Y ENDPOINT USADOS
*/
export default function Dashboard({ history }) {
  const [token, setToken] = useLocalStorage("timestamp", null);
  const [user, setUser] = useLocalStorage("user", null);
  const [userAdmin, setUserAdmin] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState(0);
  const [listaUsuariosRespaldo, setListaUsuariosRespaldo] = useState(0);
  const [usuarioSelec, setUsuarioSelec] = useState(null);
  const BASEURL = "https://matrix.imperiomonarcas.com";
  const DOMINIO = "imperiomonarcas.com";
  const ENDPOINT_USER = "/_synapse/admin/v2/users";
  const ENDPOINT_ALLUSERS = "/_synapse/admin/v2/users?deactivated=true";
  const ENDPOINT_DESACTIVAR = "/_synapse/admin/v1/deactivate";
  const ENDPOINT_SALAS = "/_matrix/client/r0/joined_rooms";
  const ENDPOINT_WHOIS = "/_matrix/client/r0/admin/whois";
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
  const [passwordVerificar, setpasswordVerificar] = useState("");
  const [checked, setChecked] = React.useState(true);
  const [fechaDeCreacion, setFechaDeCreacion] = useState(null);
  const [mostrarSalas, setMostrarSalas] = useState(false);

  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [salasUsuarioSelec, setSalasUsuarioSelec] = useState(0);

  const [whoisUsuarioSelec, setWhoisUsuarioSelec] = useState(0);

  /*
  SE OBTIENE EL VALOR DEL LA VARIABLE NOMBREUSER
  QUE SE OCUPA EN EL MOMENTO DE AGREGAR UN NUEVO
  USUARIO AL SERVIDOR
  */
  const handleNombreUsuarioChange = (event) => {
    const { value } = event.currentTarget;
    console.log(value);
    setnombreUser(value);
  };
  /*
  SE OBTIENE EL VALOR DEL LA VARIABLE PASSWORDUSUARIO
  QUE SE OCUPA EN EL MOMENTO DE AGREGAR UN NUEVO
  USUARIO AL SERVIDOR
  */
  const handlePasswordUsuarioChange = (event) => {
    const { value } = event.currentTarget;
    console.log(value);
    setpasswordUsuario(value);
  };
  /*
  SE OBTIENE EL VALOR DEL LA VARIABLE PASSWORVERIFICAR
  QUE SE OCUPA EN EL MOMENTO DE AGREGAR UN NUEVO
  USUARIO AL SERVIDOR
  */
  const handlePasswordVerificarChange = (event) => {
    const { value } = event.currentTarget;
    console.log(value);
    setpasswordVerificar(value);
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
  /*
  VARIABLES OCUPADAS PARA OCULTAR LOS MODALES
  */
  const ocultarDetalles = () => {
    setMostrandoDetalles(false);
    setDesactivar(0);
  };
  const ocultarRegistrar = () => {
    setMostrarRegistrar(false);
  };

  const ocultarSalas = () => {
    setMostrarSalas(false);
    setDesactivar(0);
  };

  useEffect(() => {
    setUserAdmin(JSON.parse(user));
    getUsers();
  }, []);

  /* ---- ---- ---- ---- ----*/
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
        setListaUsuariosRespaldo(response.data.users);
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

  /* Agregando el páginado */
  const handleChangePage = (event, newPage) => {
    setPagina(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const emptyRows =
    filasPorPagina -
    Math.min(filasPorPagina, listaUsuarios.length - pagina * filasPorPagina);

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

        /* Convirtiendo el valor recuperado de la API 
      "data.creation_ts" a un formarto de fecha  */

        const fecha = new Date(parseInt(response.data.creation_ts, 10) * 1000);
        setFechaDeCreacion(
          mostrarFechaCreacion(
            fecha.getDate(),
            fecha.getMonth(),
            fecha.getFullYear()
          )
        );
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
        password: passwordUsuario,
      };
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.put(
        `${BASEURL}${ENDPOINT_USER}/@${nombreUser}:${DOMINIO}`,
        data,
        config
      );
      if (passwordUsuario == passwordVerificar && response.data) {
        getUsers();
        setMostrarRegistrar(false);
      }
    } catch (error) {
      setErrorMessage("Las contraseñas no coinciden");
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }
  /*
   *FUNCION OCUPADA PARA CONSUMIR
   *EL SERVICIO DE ENLISTAR SALAS DE
   *USUARIOS
   */

  async function getSalasUsuario(user) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${BASEURL}${ENDPOINT_SALAS}`, config);

      if (response.data) {
        setSalasUsuarioSelec(response.data.joined_rooms);
        //const listaSalas = response.data.joined_rooms.map((sala) => sala);
        //console.log("Sala " + listaSalas);
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
   *EL SERVICIO DE HISTORIAL
   */

  async function getWhois(user) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${BASEURL}${ENDPOINT_WHOIS}/${user}`, config);

      if (response.data.devices !== null) {
        setWhoisUsuarioSelec(response.data.devices[""].sessions[0].connections.length);
      }
    } catch (error) {
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }

  /*  === PopUp Salas ===  */
  const obtenerInformacionSalas = (event) => {
    event.preventDefault();
    const { key } = event._targetInst;
    getSalasUsuario(key);
    setMostrarSalas(true);
    console.log("test" + key);
  };

  /*  === PopUp Usuario ===  */
  const abrirDetallesUsuario = (event) => {
    event.preventDefault();
    const { key } = event._targetInst;

    getInfoUser(key);
    getWhois(key);
    setMostrandoDetalles(true);
    console.log("test" + key);
  };
  /*
  *Metodo para la Busqueda de usuarios 
  *y administradores
  */
  const realizarBusqueda = (event) => {
    event.preventDefault();
    var text = event.target.value;
    setListaUsuarios(listaUsuariosRespaldo);
    if (text !== "") {
      const nuevosUsuarios = listaUsuarios.filter(function (item) {
        const itemNombre = item.name.toLowerCase();
        const textNombre = text.toLowerCase();
        return itemNombre.indexOf(textNombre) > -1;
      });
      setListaUsuarios(nuevosUsuarios);
    }
    setBusqueda(text);
  };

  function mostrarFechaCreacion(dia, mes, anio) {
    //Identificacion del día
    switch (dia) {
      case 0:
        dia = "Domingo";
        break;
      case 1:
        dia = "Lunes";
        break;
      case 2:
        dia = "Martes";
        break;
      case 3:
        dia = "Miercoles";
        break;
      case 4:
        dia = "Jueves";
        break;
      case 5:
        dia = "Viernes";
        break;
      case 6:
        dia = "Sabado";
        break;
      default:
        break;
    }
    //Identificación del mes
    switch (mes) {
      case 0:
        mes = "Enero";
        break;
      case 1:
        dia = "Febrero";
        break;
      case 2:
        mes = "Marzo";
        break;
      case 3:
        dia = "Abril";
        break;
      case 4:
        mes = "Mayo";
        break;
      case 5:
        dia = "Junio";
        break;
      case 6:
        mes = "Julio";
        break;
      case 7:
        dia = "Agosto";
        break;
      case 8:
        mes = "Septiembre";
        break;
      case 9:
        dia = "Octubre";
        break;
      case 10:
        mes = "Noviembre";
        break;
      case 11:
        dia = "Diciembre";
        break;
      default:
        break;
    }
    return dia + "-" + mes + "-" + anio;
  }

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
        titulo={`¡Bienvenido  ${
          !!userAdmin && !!userAdmin.name ? userAdmin.name : ""
          }!`}
      />
      <main className={classes.content}>
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={1}>
            <Grid item xs={3}>

              {/* Botton para registrar usuario */}

              <Button
                type="submit"
                // fullWidth
                variant="contained"
                color="primary"
                onClick={abrirRegistrar}>
                Agregar Nuevo usuario
              </Button>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <TextField
                label="Buscar usuario"
                name="buscar"
                autoComplete="Buscar usuario"
                value={busqueda}
                onChange={realizarBusqueda}
                floatingLabelFixed
              />

              {/* Empieza la tabla de usuarios que se encuentan en la mensajeria*/}

            </Grid>
          </Grid>
        </Container>
        <Container maxWidth="lg" className={classes.container}>

          {/* Bucle creado para enlistar todos los usuarios que se encuentran en el servidor */}

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
                      <TableCell align="center">Salas de usuario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listaUsuarios
                      .slice(
                        pagina * filasPorPagina,
                        pagina * filasPorPagina + filasPorPagina
                      )
                      .map((user) => (
                        <TableRow key={user.name}>
                          <TableCell component="th" scope="row" align="center">
                            {user.name}

                            {/* Recupeacion y pintado de la informacion recuoerada
                            del seridor Matrix */}

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

                          {/* Botton que muestra los detalle del usuario */}

                          <TableCell align="center">
                            <button
                              type="button"
                              color="primary"
                              key={user.name}
                              onClick={abrirDetallesUsuario}
                            >
                              Detalles
                            </button>
                          </TableCell>
                          <TableCell align="center">

                            {/* Botton que muestra las salas a las que
                            pertenece el usuario administrador */}

                            <button
                              type="button"
                              color="primary"
                              key={user.name}
                              onClick={obtenerInformacionSalas}
                              disabled={user.admin == 0}
                            >
                              Salas
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Paginado de la tabla */}

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={listaUsuarios.length}
                  page={pagina}
                  onChangePage={handleChangePage}
                  rowsPerPage={filasPorPagina}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              </TableContainer>
              {/* Contenido del modal de mostrar detalles */}
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
                    <h3>Fecha de Creacion: {fechaDeCreacion}</h3>
                    <h3>Nombre a mostrar: {usuarioSelec.displayname}</h3>

                    {!!whoisUsuarioSelec ? (
                      <h3>Total de conexiones: {whoisUsuarioSelec}</h3>


                    ) : (
                        console.log("...")
                      )}

                    {!!desactivar == 1 ? (
                      <div>
                        <h3>
                          <font color="red">
                            ¿Nuevamente de click en el botón para confirmar la
                          acción?{" "}
                          </font>
                        </h3>
                      </div>
                    ) : (
                        ""
                      )}

                    {!!usuarioSelec.deactivated == 0 ? (
                      <strong>
                        <Button
                          variant="contained"
                          color="primary"
                          align="center"
                          type="button"
                          onClick={postDesactivaUser}
                        >
                          DESACTIVAR
                        </Button>{" "}
                      </strong>
                    ) : (
                        <strong>Usuario Inactivo</strong>
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

          {/* Contenido del modal de mostrar salas */}

        <Modal
          open={mostrarSalas}
          onClose={ocultarSalas}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            <h2 align="center">Salas de conversación</h2>
            {!!salasUsuarioSelec ? (
              <div>
                <h3>
                  Este usuario participa en {salasUsuarioSelec.length} salas
                </h3>

                <div>
                  {salasUsuarioSelec.map((sala) => (
                    <h4>Identificador de sala: {sala}</h4>
                  ))}
                </div>
              </div>
            ) : (
                <h3>
                  No es posible mostrar información de las salas de este usuario
                </h3>
              )}

            <br />
          </div>
        </Modal>

          {/* Contenido del modal para registrar un nuevo
          usuario para la mensajeria */}

        <Modal
          open={mostrarRegistrar}
          onClose={ocultarRegistrar}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            <h3 align="center">Registrar Usuarios</h3>

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
              // autoFocus
              onChange={handlePasswordUsuarioChange}
            />
            <p></p>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="contrasenaVerificar"
              label="Verificar Contraseña:"
              type="password"
              name="contraseñaVerificar"
              autoComplete="contraseñaVerificar"
              // autoFocus
              onChange={handlePasswordVerificarChange}
            />
            <p></p>
            <label>Administrador</label>
            <Checkbox
              checked={checked}
              onChange={handleChange}
              inputProps={{ "aria-label": "primary checkbox" }}
            />
            <p></p>
            <Button
              color="primary"
              align="center"
              type="button"
              onClick={handleClickAgregar}
            >
              Guardar
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
