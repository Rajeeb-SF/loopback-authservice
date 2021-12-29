import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Notes} from '../models';
import {NotesRepository} from '../repositories';

export class NotesController {
  constructor(
    @repository(NotesRepository)
    public notesRepository : NotesRepository,
  ) {}

  @post('/notes')
  @response(200, {
    description: 'Notes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Notes)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notes, {
            title: 'NewNotes',
            exclude: ['id'],
          }),
        },
      },
    })
    notes: Omit<Notes, 'id'>,
  ): Promise<Notes> {
    return this.notesRepository.create(notes);
  }

  @get('/notes/count')
  @response(200, {
    description: 'Notes model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Notes) where?: Where<Notes>,
  ): Promise<Count> {
    return this.notesRepository.count(where);
  }

  @get('/notes')
  @response(200, {
    description: 'Array of Notes model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Notes, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Notes) filter?: Filter<Notes>,
  ): Promise<Notes[]> {
    return this.notesRepository.find(filter);
  }

  @patch('/notes')
  @response(200, {
    description: 'Notes PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notes, {partial: true}),
        },
      },
    })
    notes: Notes,
    @param.where(Notes) where?: Where<Notes>,
  ): Promise<Count> {
    return this.notesRepository.updateAll(notes, where);
  }

  @get('/notes/{id}')
  @response(200, {
    description: 'Notes model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Notes, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Notes, {exclude: 'where'}) filter?: FilterExcludingWhere<Notes>
  ): Promise<Notes> {
    return this.notesRepository.findById(id, filter);
  }

  @patch('/notes/{id}')
  @response(204, {
    description: 'Notes PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notes, {partial: true}),
        },
      },
    })
    notes: Notes,
  ): Promise<void> {
    await this.notesRepository.updateById(id, notes);
  }

  @put('/notes/{id}')
  @response(204, {
    description: 'Notes PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() notes: Notes,
  ): Promise<void> {
    await this.notesRepository.replaceById(id, notes);
  }

  @del('/notes/{id}')
  @response(204, {
    description: 'Notes DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.notesRepository.deleteById(id);
  }
}
