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
import { Button, ButtonBase } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Swal from 'sweetalert2';

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
}));

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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setToken("");
    history.replace("/login");
  };

  useEffect(() => {
    setUserAdmin(JSON.parse(user));
    getUsers();
  }, []);

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
        `${BASEURL}${ENDPOINT_USER}${nombreUsuario}`,
        config
      );
      if (response.data.total > 0) {
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

      <Button onClick={() => {Swal.mixin({
  input: 'text',
  confirmButtonText: 'ok &rarr;',
  showCancelButton: true,
  progressSteps: ['1', '2', '3']
}).queue([
  {
    title: 'Usuario Nuevo',
  
  },
  'Password',
  'Validacion de Password'
]).then((result) => {
  if (result.value) {
    const answers = JSON.stringify(result.value)
    Swal.fire({
      title: 'Usuario agregado',
      html: `
      
      `,
      confirmButtonText: 'ok!'
    })
  }
})}}
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
                        <TableCell>Usuario</TableCell>
                        <TableCell align="right">Status</TableCell>
                        <TableCell align="right">Administrador</TableCell>
                        <TableCell align="right">Fecha de creacion</TableCell>

                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listaUsuarios.map((user) => (
                        <TableRow key={user.name}>
                          <TableCell onClick={() => {Swal.fire(getInfoUser(user.name))}} component="th" scope="row">
                            
                           
                            {user.name}
                          </TableCell>
                          <TableCell align="right" >{!!user && user.deactivated == 0 ? (
                            <strong>Activo</strong>
                          ) : (
                              <i>Inactivo</i>
                            )}</TableCell>
                          <TableCell  align="right"> {!!user && user.admin == 0 ? (
                            <strong>Usuario de mensajería</strong>
                          ) : (
                              <strong>Usuario Administrador</strong>
                            )}</TableCell>
                          <TableCell align="right">{"..."}</TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

              
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
