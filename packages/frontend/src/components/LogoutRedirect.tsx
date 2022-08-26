import React, { useContext } from 'react';

import { Redirect } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useKeycloak } from '@react-keycloak/web';
import AuthService from '../services/AuthService';
import AuthContext from '../contexts/AuthContext';

const LogoutRedirect: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (authContext.loggedIn) {
    AuthService.logout().then(
      () => authContext.setLoggedIn(false),
      () => authContext.setLoggedIn(false)
    );
  } else {
    return <Redirect to="/" />;
  }

  return (
    <div>
      <Typography variant="body1" color="textSecondary" component="p">
        You are being logged out!
      </Typography>
      <Typography variant="body1" color="textSecondary" component="p">
        You will be redirected to the the home page.
      </Typography>
    </div>
  );
};

// Criamos um novo componente de logout similar ao original,
// mas adaptado para o Keycloak:
export const KeycloakLogoutRedirect: React.FC = () => {
  // Ao contrário do componente de Logout original, este
  // utiliza o hook "useKeycloak":
  const { keycloak, initialized } = useKeycloak();
  const authContext = useContext(AuthContext);

  // Se estivermos "logados", executamos o logout:
  if (authContext.loggedIn && initialized) {
    keycloak.logout();
  } else {
    // Caso contrário, redirecione o usuário para a
    // página inicial:
    return <Redirect to="/" />;
  }

  // Lembra que comentamos que o Keycloak precisa
  // estar inicializado? Bem, se ele não estiver ainda,
  // o texto abaixo vai ser apresentado. Quando a variável
  // "initialized" mudar de valor, o React tem como perceber
  // que isso aconteceu, e vai recarregar este componente.
  // As verificações acima vão ser executadas mais uma vez,
  // e em algum momento o logout será executado.
  return (
    <div>
      <Typography variant="body1" color="textSecondary" component="p">
        You are being logged out!
      </Typography>
      <Typography variant="body1" color="textSecondary" component="p">
        You will be redirected to the home page.
      </Typography>
    </div>
  );
};

export default LogoutRedirect;
