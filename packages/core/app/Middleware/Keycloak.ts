import Env from '@ioc:Adonis/Core/Env'
import jwt from 'jsonwebtoken'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

class KeycloakMiddleware {
  private tokenSignaturePublicKey: string

  constructor() {
    // Carregamos a public key a partir das variáveis
    // de ambiente ao criar uma instância do middleware:
    this.tokenSignaturePublicKey = Env.get('KEYCLOAK_REALM_TOKEN_SIGNATURE_PUBLIC_KEY')
  }

  // Esta é a função que contém o código do middleware apropriadamente:
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    // Lembre-se que enviamos o token em um header na request.
    // O header que buscamos é o “Authorization”:
    let token = request.header('Authorization')

    // Aqui temos algo interessante: se o token está expirado,
    // o Adonis já o remove do objeto de request, ou seja,
    // não precisaremos validar se o token está expirado.
    // Outros frameworks podem não fazer tal verificação.
    // Indico mais abaixo o que ocorreria neste caso.
    if (token) {
      // A chave pública deve conter “BEGIN” e “END” tal como
      // indicado abaixo, ou a maioria das bibliotecas de
      // verificação irão falhar na validação do token.
      const formattedTokenSignaturePublicKey = `-----BEGIN PUBLIC KEY-----\r\n${this.tokenSignaturePublicKey}\r\n-----END PUBLIC KEY-----`

      try {
        // De posse da chave, verificamos se a assinatura do
        // token é válida. Lembre-se que o frontend adiciona
        // “Bearer ” na frente do token. Entretanto, esta
        // parte não deve ser utilizada durante a validação.
        // Portanto, removemos “Bearer ” ao executar a
        // validação a seguir:
        const decodedAccessToken = jwt.verify(
          token.replace(/^Bearer /, ''),
          formattedTokenSignaturePublicKey
        )

        // Neste ponto, se a validação falhar, a biblioteca
        // que estamos utilizando lança uma exceção. Se
        // chegamos aqui, é porque o token é válido!

        // jwt.verify() também verifica se o token expirou.
        // Consulte a documentação da sua linguagem de
        // programação para se certificar que esta verificação
        // é realizada. Caso contrário, você precisará
        // verificar se o valor de “decodedAccessToken.exp”
        // é válido manualmente. “exp” contém o número de
        // segundos desde 1970-01-01T00:00:00Z UTC.

        // Adicionamos o usuário ao objeto “request”, de modo
        // que possamos acessá-lo nos middlewares 
        // subsequentes.
        // O valor de “sub” é o ID do usuário autenticado.
        // O Keycloak também envia o e-mail e o nome do
        // usuário no token. Se o e-mail e/ou o nome não
        // existirem, certifique-se de verificar se estão
        // preenchidos no Keycloak.
        request['user'] = {
          id: decodedAccessToken.sub,
          email: decodedAccessToken['email'],
          name: decodedAccessToken['name'],
        }
      } catch (e) {
        // Se tivermos uma exceção, o token é inválido.
        // Retornamos “unauthorized” e não prosseguimos
        // para o próximo midddleware:
        response.unauthorized({ error: 'Invalid token' })
        return null
      }

      // Se o token é válido, seguimos para o próximo
      // middleware:
      await next()
      return null
    }

    // Se chegarmos aqui, não existe token na requisição.
    // No caso do Adonis, também chegaremos aqui caso o
    // token esteja expirado. Retornamos “unauthorized”:
    response.unauthorized({ error: 'Invalid token' })
  }
}

export default KeycloakMiddleware
