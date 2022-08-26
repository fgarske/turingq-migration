/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'

// Por padrão, utilizaremos o middleware “auth”:
let authorizationMiddleware = 'auth'
const useKeycloak = Env.get('USE_KEYCLOAK')

// Mas se a nossa variável de ambiente indicar que queremos
// usar o Keycoak, trocamos este middleware:
if (useKeycloak) {
  authorizationMiddleware = 'keycloak'
}

// Aqui segue a definição de rotas como anteriormente, com a
// diferença de que utilizamos a variável definida acima
Route.resource('questions', 'QuestionsController').apiOnly().middleware({
  store: authorizationMiddleware,
  update: authorizationMiddleware,
  destroy: authorizationMiddleware,
})

Route.resource('questions.answers', 'AnswersController').apiOnly().middleware({
  store: authorizationMiddleware,
  update: authorizationMiddleware,
  destroy: authorizationMiddleware,
})

// A rota de registro não precisa de nenhum middleware:
Route.resource('registration', 'RegistrationsController').only(['store'])

// Finalmente, não precisamos das rotas de “login” e “logout”
// se estivermos utilizando o Keycloak. Definimos tais rotas
// somente se NÃO estivermos utilizando o Keycloak:
if (!useKeycloak) {
  Route.post('auth/login', 'AuthController.login')
  Route.get('auth/logout', 'AuthController.logout').middleware('auth')
}