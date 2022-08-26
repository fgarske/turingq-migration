/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import AuthService from '../services/AuthService';

const Context = React.createContext({
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {},
});

interface AuthStoreProps {
  children: React.ReactNode;
}

export const AuthStore: React.FC<AuthStoreProps> = ({
  children,
}: AuthStoreProps) => {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn && AuthService.getAuthToken()) {
    setLoggedIn(true);
  }

  return (
    <Context.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </Context.Provider>
  );
};

// Este é um componente do React que utiliza “React contexts”.
// Este é um conceito do React e entender como ele funciona
// não é pré-requisito para o nosso curso. O objetivo deste
// componente é simplesmente guardar a informação de que
// um usuário está (ou não) logado na aplicação. Ao usar
// contextos, outros componentes podem saber se há um usuário
// logado e apresentar (ou ocultar) botões na interface.
export const KeycloakAuthStore: React.FC<AuthStoreProps> = ({
  children,
}: AuthStoreProps) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { keycloak } = useKeycloak();

  if (!loggedIn && keycloak.authenticated) {
    setLoggedIn(true);
  }

  return (
    <Context.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </Context.Provider>
  );
};

export default Context;
