import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { withRouter, Redirect } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";

/* copyright modelado y simulacion */
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="http://www.semar.gob.mx/INIDETAM/index.html">
        Modelado y Simulación - INIDETAM
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
/*
*ESTILOS
*/
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage: "url(https://source.unsplash.com/random)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  logoMarina: {
    backgroundColor: "#0F0D0D",
  },
  imagenLogo: {
    backgroundImage: "url(images/logo-marina.png)",
    backgroundSize: "cover",
    width: 270,
    height: 270,
    margin: "25% auto",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

/*

*/
const Login = ({ history }) => {
/*
Variables y ENDPOINT USADOS
*/
  const classes = useStyles();
  const BASEURL = "https://matrix.imperiomonarcas.com";
  const ENDPOINT_LOGIN = "/_matrix/client/r0/login";
  const ENDPOINT_USER = "/_synapse/admin/v2/users";
  const URL_LOGIN = `${BASEURL}${ENDPOINT_LOGIN}`;
  const URL_USER = `${BASEURL}${ENDPOINT_USER}`;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [token, setToken] = useLocalStorage("timestamp", null);
  const [user, setUser] = useLocalStorage("user", null);

  const handleClickLogin = (event) => {
    event.preventDefault();
    doLogin();
  };

  const handleUsernameChange = (event) => {
    // const value = event.currentTarget.value;
    const { value } = event.currentTarget;
    console.log(value);
    setUsername(value);
  };

  const handlePasswordChange = (event) => {
    const { value } = event.currentTarget;
    console.log(value);
    setPassword(value);
  };

  const handleClose = () => {
    setHasError(false);
  };
/* En esta funcion estan los parametros 
*necesarios para consumir el servicio de login
*y se guardan dentro de la variable date */
  async function doLogin() {
    try {
      const data = {
        type: "m.login.password",
        identifier: {
          type: "m.id.user",
          user: username,
        },
        password: password,
      };

      //const response = await axios.post(URL, data);
      /**Se comparan los datos obtenidos en la variable 
      *date y URl_LOGIN para revisar 
      *si el usuario es administrador de Matrix.*/
      const response = await axios.post(URL_LOGIN, data);
      console.log(response);
      setToken(response.data.access_token);

      const esAdministrador = await validarAdministrador(
        response.data.user_id,
        response.data.access_token
      );
      if (esAdministrador) {
        history.replace("/dashboard");
      } else {
        setErrorMessage("No eres administrador");
        setHasError(true);
        console.error("Usuario no es administrador!!!");
      }
    } catch (error) {
      const mensaje_detallado = error.response.data.error;
      setErrorMessage(mensaje_detallado);
      setHasError(true);
      console.error(mensaje_detallado);
    }
  }
// Autorizacion con Access Token 

  const validarAdministrador = async (user_id, access_token) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${access_token}` },
      };
      const response = await axios.get(`${URL_USER}/${user_id}`, config);
      console.log(response);
      // la siguiente condición nunca pasa, pero se deja por seguridad.
      if (
        !!response.data &&
        !!response.data.admin &&
        response.data.admin === 1
      ) {
        setUser(JSON.stringify(response.data));
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
/*
PANTALLA DE INICIO DE SESIÓN  
 */ 
  return (
    <>
      <Dialog
        open={hasError}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={4} md={7} className={classes.logoMarina}>
          <div className={classes.imagenLogo}></div>
        </Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Iniciar Sesión
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="usuario"
                label="Usuario"
                name="usuario"
                autoComplete="usuario"
                autoFocus
                onChange={handleUsernameChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="contrasenia"
                label="Contraseña"
                type="password"
                id="contrasenia"
                onChange={handlePasswordChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleClickLogin}
              >
                Iniciar Sesión
              </Button>
              <Box mt={5}>
                <Copyright />
              </Box>
            </form>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default withRouter(Login);
