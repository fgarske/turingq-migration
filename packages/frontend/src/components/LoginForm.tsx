import * as Yup from 'yup';
import React, { useContext, useState } from 'react';
import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  Link,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Alert } from '@material-ui/lab';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import KeycloakLogin from './KeycloakLogin';

import FormValidationError from '../errors/FormValidationError';
import Message from '../interfaces/Message';
import AuthService from '../services/AuthService';
import LoginResponse from '../interfaces/LoginResponse';
import AuthContext from '../contexts/AuthContext';

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    margin: theme.spacing(1),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  message: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  paper: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progress: {
    marginRight: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const LoginForm: React.FC = () => {
  const classes = useStyles();
  const authContext = useContext(AuthContext);

  const formInitialValues = {
    email: '',
    password: '',
  };

  const [message, setMessage] = useState<Message>();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Please inform a valid email')
      .required('Please inform a valid email'),
    password: Yup.string()
      .min(8, 'The password must be at least 8 characters')
      .required('Please inform a valid password'),
  });

  const onSubmit = async (
    data: Record<string, string>,
    {
      setErrors,
      setSubmitting,
    }: FormikHelpers<{ email: string; password: string }>
  ): Promise<void> => {
    setSubmitting(true);
    AuthService.login(data.email, data.password).then(
      // eslint-disable-next-line no-unused-vars
      (resp: LoginResponse) => {
        setSubmitting(false);
        authContext.setLoggedIn(true);
      },
      (error: FormValidationError) => {
        if (error.errors) {
          const formErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            formErrors[err.field] = err.message;
          });
          setErrors(formErrors);
        } else {
          setMessage({
            type: 'error',
            body: error.message,
          });
        }
        setSubmitting(false);
      }
    );
  };

  if (authContext.loggedIn) {
    return <Redirect to="/" />;
  }
  // Se nossa flag indicar que devemos usar o Keycloak,
  // retornamos o componente de login do Keycloak que acabamos
  // de criar.
  const useAuthServer = process.env.REACT_APP_USE_AUTH_SERVER === 'true';
  if (useAuthServer) {
    return <KeycloakLogin />;
  }
  // Caso contrário, o componente segue o fluxo
  // original em que um formulário de login é apresentado
  // nas linhas seguintes.
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {message && (
          <Alert className={classes.message} severity={message.type}>
            {message.body}
          </Alert>
        )}

        <Formik
          initialValues={formInitialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {(formProps) => {
            const {
              values,
              touched,
              errors,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
            } = formProps;
            return (
              <form className={classes.form} onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="email"
                      name="email"
                      autoComplete="email"
                      fullWidth
                      label="Email Address"
                      required
                      variant="outlined"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!errors.email && touched.email}
                      helperText={errors.email && touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      fullWidth
                      label="Password"
                      required
                      variant="outlined"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!errors.password && touched.password}
                      helperText={
                        errors.password && touched.password && errors.password
                      }
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  className={classes.submit}
                  color="primary"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <CircularProgress
                      className={classes.progress}
                      size={20}
                      color="secondary"
                    />
                  )}
                  Sign In
                </Button>
                <Grid container item>
                  <Link component={RouterLink} to="/signup" variant="body2">
                    Don&apos;t have an account? Sign Up
                  </Link>
                </Grid>
              </form>
            );
          }}
        </Formik>
      </Paper>
    </Container>
  );
};

export default LoginForm;
