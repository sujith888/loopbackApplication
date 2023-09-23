import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDbDataSource} from '../datasources';
import {Product, ProductRelations} from '../models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.Id,
  ProductRelations
> {
  constructor(@inject('datasources.mysqlDb') dataSource: MysqlDbDataSource) {
    super(Product, dataSource);
  }
}
