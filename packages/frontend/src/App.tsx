import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import Navbar from './components/Navbar';
import AppRouter from './routes/AppRouter';
import { AuthStore, KeycloakAuthStore } from './contexts/AuthContext';

import keycloakClient from './auth';

const App: React.FC = () => {
  // Vamos utilizar a variável de ambiente que definimos.
  // O "=== 'true'" abaixo é muito importante, porque as
  // variáveis de ambiente são lidas como strings. Uma
  // string não-vazia é convertida para o boolean “true”.
  // Portanto, optamos por verificar se o valor da variável
  // é a string 'true', resultando em um valor booleano para
  // a variável "useAuthServer".
  const useAuthServer = process.env.REACT_APP_USE_AUTH_SERVER === 'true';

  // Se a variável for verdadeira, utilizamos
  // o ReactKeycloakProvider, tal como indicado na
  // documentação do @react-keycloak/web. Este provider
  // inicializa o cliente que criamos anteriormente
  if (useAuthServer) {
    return (
      <ReactKeycloakProvider authClient={keycloakClient}>
        <BrowserRouter>
          <KeycloakAuthStore>
            <Navbar />
            <AppRouter />
          </KeycloakAuthStore>
        </BrowserRouter>
      </ReactKeycloakProvider>
    );
  }

  // Caso contrário, utilizamos a nossa implementação original
  return (
    <BrowserRouter>
      <AuthStore>
        <Navbar />
        <AppRouter />
      </AuthStore>
    </BrowserRouter>
  );
};

export default App;
