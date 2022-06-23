import { column, BaseModel, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuid } from 'uuid'

export default class IdentifiableModel extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @beforeCreate()
  public static async createUUID(identifiableModel: IdentifiableModel) {
    // Criamos um id somente se este ID não existir
    // anteriormente. Se não fizermos isso, o Adonis vai gerar
    // um ID novo aleatório antes salvar o usuário mesmo que
    // já exista um ID definido:
    if (!identifiableModel.id) {
      identifiableModel.id = uuid()
    }
  }
}
