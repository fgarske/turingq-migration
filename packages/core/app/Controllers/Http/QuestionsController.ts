import Env from '@ioc:Adonis/Core/Env'
import Event from '@ioc:Adonis/Core/Event'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import { string } from '@ioc:Adonis/Core/Helpers'

import QuestionValidator from 'App/Validators/QuestionValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'
import Question from 'App/Models/Question'

// TODO: add missing tests
export default class QuestionsController {
  public async index({ request }: HttpContextContract) {
    const pagination = await request.validate(PaginationValidator)

    const page = pagination.page || 1
    const limit = pagination.limit || Env.get('PAGINATION_LIMIT')

    const questions = await Question.query()
      .preload('author')
      .preload('answers')
      .paginate(page, limit)

    return questions.toJSON()
  }

  public async show({ params }: HttpContextContract) {
    const question = await Question.findOrFail(params.id)
    question.computeView()
    await question.save()

    await question.load((loader) => {
      loader.load('author').load('answers', (answers) => {
        answers.preload('author')
      })
    })

    return question.toJSON()
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const userId = this.getUserId(auth, request)
    const question = await this.save(request, userId)
    Event.emit('new:question', question)
    return response.created(question.toJSON())
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const userId = this.getUserId(auth, request)
    let questionInDb = await Question.find(request.param('id'))
    let responseMethod = 'ok'

    if (questionInDb === null) {
      responseMethod = 'created'
    } else if (questionInDb.authorId !== userId) {
      return response.unauthorized({ error: 'You cannot update a question from another author' })
    }

    const question = await this.save(request, userId, questionInDb)
    return response[responseMethod](question.toJSON())
  }

  public async destroy({ auth, params, response, request }: HttpContextContract) {
    const userId = this.getUserId(auth, request)
    const question = await Question.findOrFail(params.id)
    if (question.authorId !== userId) {
      return response.unauthorized({ error: 'You cannot remove a question from another author' })
    }
    await question.delete()
    return response.noContent()
  }

  private async save(request: RequestContract, authorId: string, questionToSave?: Question | null) {
    const payload = await request.validate(QuestionValidator)
    if (!questionToSave) {
      questionToSave = new Question()
      questionToSave.authorId = authorId
    }

    questionToSave.title = string.escapeHTML(payload.title)
    questionToSave.body = string.escapeHTML(payload.body)

    return questionToSave.save()
  }
  private getUserId(auth, request) {
    const useKeycloak = Env.get('USE_KEYCLOAK')

    // Dependendo de nossa variável de ambiente, retornamos
    // o ID do usuário de um lugar diferente:
    if (useKeycloak) {
      // O middleware que criamos armazena o usuário no objeto
      // “request”:
      return request['user'].id
    } else {
      // O sistema de autenticação do Adonis tem seu próprio
      // meio de acessar o usuário:
      return auth.use('api').user!.id
    }
  }
}
