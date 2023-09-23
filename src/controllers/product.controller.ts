import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
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
  async downloadProductsJSON(
    @param.query.number('page', {default: 1}) page: number, // Fetch all Product records from the database
  ): Promise<Product[]> {
    const limit = 10;
    const offset = (page - 1) * limit;
    const products: Product[] = await this.productRepository.find({
      limit,
      offset,
    });
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
  async downloadProductsCSV(
    @param.query.number('page', {default: 1}) page: number,
  ): Promise<string> {
    const limit = 10;
    const offset = (page - 1) * limit;
    // Fetch all Product records from the database
    const products: Product[] = await this.productRepository.find({
      limit,
      offset,
    });

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
