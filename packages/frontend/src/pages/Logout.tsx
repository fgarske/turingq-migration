import React from 'react';
import { Grid } from '@material-ui/core';

import Page from '../components/Page';
import LogoutRedirect, {
  KeycloakLogoutRedirect,
} from '../components/LogoutRedirect';

const useAuthServer = process.env.REACT_APP_USE_AUTH_SERVER === 'true';

const Logout: React.FC = () => (
  <Page title="Logging out...">
    <Grid container item xs={12} direction="row" justifyContent="center">
      {useAuthServer ? <KeycloakLogoutRedirect /> : <LogoutRedirect />}
    </Grid>
  </Page>
);

export default Logout;
