import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {createObjectCsvStringifier} from 'csv-writer';
import {Product} from '../models';
import {ProductRepository} from '../repositories';
export interface PriceUpdate {
  id: number;
  newPrice: number;
}

export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {}

  @post('/products')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProduct',
          }),
        },
      },
    })
    product: Product,
  ): Promise<Product> {
    return this.productRepository.create(product);
  }

  @get('/products/count')
  @response(200, {
    description: 'Product model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Product) where?: Where<Product>): Promise<Count> {
    return this.productRepository.count(where);
  }

  @get('/products')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepository.find(filter);
  }

  @patch('/products')
  @response(200, {
    description: 'Product PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Product,
    @param.where(Product) where?: Where<Product>,
  ): Promise<Count> {
    return this.productRepository.updateAll(product, where);
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Product, {exclude: 'where'})
    filter?: FilterExcludingWhere<Product>,
  ): Promise<Product> {
    return this.productRepository.findById(id, filter);
  }

  @patch('/products/{id}')
  @response(204, {
    description: 'Product PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Product,
  ): Promise<void> {
    await this.productRepository.updateById(id, product);
  }

  @put('/products/{id}')
  @response(204, {
    description: 'Product PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() product: Product,
  ): Promise<void> {
    await this.productRepository.replaceById(id, product);
  }

  @del('/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productRepository.deleteById(id);
  }

  @get('/downloadProductsJSON', {
    responses: {
      '200': {
        description: 'JSON file of products',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {'x-ts-type': Product},
            },
          },
        },
      },
    },
  })
  async downloadProductsJSON(): Promise<Product[]> {
    // Fetch all Product records from the database
    const products: Product[] = await this.productRepository.find();
    // Return the JSON data
    return products;
  }
  @post('/updatePrices')
  @response(200, {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string', example: 'Price updated successfully'},
          },
        },
      },
    },
  })
  async updatePrices(
    @requestBody({
      description: 'Array of price updates',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {type: 'number'},
                newPrice: {type: 'number'},
              },
            },
          },
        },
      },
    })
    priceUpdates: PriceUpdate[],
  ): Promise<string> {
    let updatedCount = 0;

    for (const update of priceUpdates) {
      const {id, newPrice} = update;

      // Find the corresponding Product record by ID
      const product = await this.productRepository.findById(id);

      if (product) {
        // Update the price of the product
        product.price = newPrice;
        await this.productRepository.update(product);

        // Increment the count of successfully updated products
        updatedCount++;
      }
    }

    return `Successfully updated prices for ${updatedCount} products.`;
  }
  @get('/downloadProductsCSV', {
    responses: {
      '200': {
        description: 'CSV file of products',
        content: {
          'text/csv': {},
        },
      },
    },
  })
  async downloadProductsCSV() // @par.number('page') page: number = 1,
  : Promise<string> {
    // Fetch all Product records from the database
    const products: Product[] = await this.productRepository.find();

    // Define CSV header
    const header = [
      {id: 'id', title: 'ID'},
      {id: 'name', title: 'Name'},
      {id: 'price', title: 'Price'},
      {id: 'quantity', title: 'Quantity'},
    ];

    // Create a CSV stringifier
    const csvStringifier = createObjectCsvStringifier({
      header,
    });

    // Convert the product records to an array of objects
    const records = products.map(product => ({
      id: product.Id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    }));

    // Convert the records to a CSV string
    const csvData = `${csvStringifier.getHeaderString()}\n${csvStringifier.stringifyRecords(
      records,
    )}`;

    return csvData;
  }
}
