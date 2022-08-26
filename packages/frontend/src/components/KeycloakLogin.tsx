import React, { useContext } from 'react';
import { CircularProgress, makeStyles, Theme } from '@material-ui/core';
import { Redirect } from 'react-router';
import { useKeycloak } from '@react-keycloak/web';

import AuthContext from '../contexts/AuthContext';

// As linhas a seguir são do “Material UI” para CSS.
// Não se preocupe com elas.
const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    marginTop: theme.spacing(2, 'auto'),
  },
}));

// Este é um componente React.
const KeycloakLogin: React.FC = () => {
  const classes = useStyles();

  // Este componente utiliza o hook “useKeycloak”
  // A ideia desse hook é simplificar a integração do React
  // com o Keycloak.
  const { keycloak, initialized } = useKeycloak();
  const authContext = useContext(AuthContext);

  // Se o usuário estiver autenticado, envie-o para a
  // página principal da aplicação frontend:
  if (keycloak.authenticated) {
    authContext.setLoggedIn(true);
    return <Redirect to="/" />;
  }
  // Se o usuário não foi redirecionado até aqui, é porque
  // ele ainda não está autenticado. Executamos, portanto,
  // o “keycloak.login()”, que vai redirecionar o usuário
  // para o login do Keycloak.
  // Entretanto, há um detalhe importante: a biblioteca
  // do Keycloak pode levar um tempo para inicializar
  // (ela faz uma chamada HTTP ao Keycloak, e a resposta
  // pode não ter chegado antes da aplicação ser renderizada)
  // Precisamos, portanto, checar se o Keycloak foi
  // inicializado antes de tentar o login.
  if (initialized) {
    keycloak.login();
  }

  // Se o login não foi inicializado, mostramos um carregador:
  return <CircularProgress className={classes.progress} />;

  // Quando o keycloak for inicializado, o próprio React
  // (através do hook “useKeycloak”) se encarregará de
  // recarregar o componente do início. Em algum momento
  // a linha de login será executada.
};

export default KeycloakLogin;
