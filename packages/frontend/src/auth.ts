import Keycloak from 'keycloak-js';

// Precisamos inicializar o cliente do Keycloak informando
// as nossas variáveis de ambiente:
export const keycloakClient = Keycloak({
  url: process.env.REACT_APP_AUTH_SERVER_URL,
  realm: process.env.REACT_APP_AUTH_SERVER_REALM!,
  clientId: process.env.REACT_APP_AUTH_SERVER_CLIENT_ID!,
});

export default keycloakClient;
