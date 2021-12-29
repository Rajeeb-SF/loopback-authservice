import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {LocalDataSource} from '../datasources';
import {Notes, NotesRelations} from '../models';

export class NotesRepository extends SoftCrudRepository<
  Notes,
  typeof Notes.prototype.id,
  NotesRelations
> {
  constructor(@inject('datasources.local') dataSource: LocalDataSource) {
    super(Notes, dataSource);
  }
}
