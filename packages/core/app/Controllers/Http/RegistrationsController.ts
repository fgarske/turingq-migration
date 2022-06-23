import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import RegistrationValidator from 'App/Validators/RegistrationValidator'

import Env from '@ioc:Adonis/Core/Env'
import KeyCloakAdminClient from '@keycloak/keycloak-admin-client'

export default class RegistrationsController {
  
  public async store({ request, response }: HttpContextContract) {
    const useKeycloak = Env.get('USE_KEYCLOAK')
    const payload = await request.validate(RegistrationValidator)

    const user = new User()
    user.name = payload.name
    user.email = payload.email
    user.password = payload.password

    // Se estamos utilizando o Keycloak, ...
    if (useKeycloak) {
      // ...criamos o usuário no Keycloak:
      const keycloakUser = await this.createKeycloakUser(
        payload.name,
        payload.email,
        payload.password
      )

      // E então utilizamos o ID do usuário do Keycloak
      // em nossa instância local do usuário.
      user.id = keycloakUser.id
    }

    // Finalmente, salvamos o usuário localmente.
    // Espere! Estamos duplicando o usuário? Salvando-o
    // localmente e no Keycloak? Sim, já explicaremos as
    // razões. Apenas guarde esta informação, ok?
    await user.save()

    return response.created(user.toJSON())
  }
  private async getKeycloakAdminClient(): Promise<KeyCloakAdminClient> {
    // Aqui criamos um cliente de administração do Keycloak.
    // Para isso, informamos a URL do Keycloak e o Realm
    // com o qual queremos conectar:
    const keyCloakAdminClient = new KeyCloakAdminClient({
      baseUrl: Env.get('KEYCLOAK_AUTH_SERVER_URL'),
      realmName: Env.get('KEYCLOAK_REALM'),
    })

    // Em seguida, autenticamos o “core” no cliente de admin
    // criado acima. Você deve se lembrar que o “core” é um
    // cliente confidencial, e o Keycloak gerou credenciais
    // para este cliente. Portanto, iremos utilizar estes
    // dados para “fazer login” do core no Keycloak:
    await keyCloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: Env.get('KEYCLOAK_CLIENT_ID'),
      clientSecret: Env.get('KEYCLOAK_CLIENT_SECRET'),
    })

    return keyCloakAdminClient
  }

  private async createKeycloakUser(
    name: string,
    email: string,
    password: string
  ): Promise<{ id: string; email: string }> {
    // Para criar usuários, precisamos de um cliente de admin
    // do Keycloak:
    const keycloakAdminClient = await this.getKeycloakAdminClient()

    // Se tudo deu certo na aquisição do cliente acima,
    // podemos criar um novo usuário. Note que utilizamos
    // o email para o campo “username”, porque nosso sistema
    // não tem um nome de usuário diferente do email.
    // Se o “core” não tiver permissão para a gerência de
    // usuários, a chamada abaixo irá lançar uma exceção.
    // Se o usuário for criado com sucesso, a chamada retorna
    // um objeto com atributos do usuário. Utilizamos
    // TypeScript para extrair apenas o ID do usuário:
    const { id } = await keycloakAdminClient.users.create({
      username: email,
      email: email,
      firstName: name,
      emailVerified: true,
      enabled: true,
    })

    // Se o usuário anterior foi criado e nenhuma exceção
    // foi lançada, precisamos criar a senha do usuário.
    // Isso pode ser feito pela chamada a seguir:
    await keycloakAdminClient.users.resetPassword({
      id, // <- Informamos o ID do usuário recém-criado aqui 
      credential: {
        temporary: false,
        type: 'password',
        value: password,
      },
    })

    return {
      id,
      email,
    }
  }

}
