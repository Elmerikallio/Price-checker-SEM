import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Price Checker API',
      version: '1.0.0',
      description: `
        A comprehensive price comparison API that allows store users to manage prices and shoppers to compare prices across nearby stores.
        
        ## Features
        - **User Management**: Administrative functions for managing store users and administrators
        - **Store Management**: Location-based store mapping and management
        - **Price Comparison**: Real-time price comparison across nearby stores
        - **Discount Management**: Store users can offer exclusive discounts
        - **Batch Operations**: Bulk price updates for store users
        - **Audit Logging**: Comprehensive logging for administrative actions
        
        ## Authentication
        The API uses JWT (JSON Web Token) based authentication. Most endpoints require authentication, with different access levels:
        - **Public**: No authentication required
        - **User**: Requires valid JWT token
        - **Store**: Requires store user role
        - **Admin**: Requires administrator role
        - **Super Admin**: Requires super administrator role
      `,
      contact: {
        name: 'Price Checker Team',
        email: 'admin@pricechecker.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://localhost/api/v1',
        description: 'Local HTTPS server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              description: 'HTTP status code'
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            },
            path: {
              type: 'string',
              description: 'Request path'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'ADMIN', 'STORE_USER'],
              description: 'User role'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'LOCKED', 'REJECTED'],
              description: 'User account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Store: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Store ID'
            },
            name: {
              type: 'string',
              description: 'Store name'
            },
            address: {
              type: 'string',
              description: 'Store address'
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Store latitude coordinate'
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Store longitude coordinate'
            },
            userId: {
              type: 'integer',
              description: 'Associated user ID'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'LOCKED', 'REJECTED'],
              description: 'Store status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID'
            },
            barcode: {
              type: 'string',
              description: 'Product barcode (GTIN number)'
            },
            barcodeType: {
              type: 'string',
              enum: ['EAN13', 'EAN8', 'UPC', 'CODE128'],
              description: 'Barcode type'
            },
            name: {
              type: 'string',
              description: 'Product name'
            }
          }
        },
        Price: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Price ID'
            },
            productId: {
              type: 'integer',
              description: 'Product ID'
            },
            storeId: {
              type: 'integer',
              description: 'Store ID'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Product price'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Price observation timestamp'
            }
          }
        },
        Discount: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Discount ID'
            },
            productId: {
              type: 'integer',
              description: 'Product ID'
            },
            storeId: {
              type: 'integer',
              description: 'Store ID'
            },
            discountPercentage: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              maximum: 100,
              description: 'Discount percentage (0-100)'
            },
            validFrom: {
              type: 'string',
              format: 'date-time',
              description: 'Discount valid from'
            },
            validTo: {
              type: 'string',
              format: 'date-time',
              description: 'Discount valid until'
            }
          }
        },
        PriceComparison: {
          type: 'object',
          properties: {
            stores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  store: {
                    $ref: '#/components/schemas/Store'
                  },
                  price: {
                    type: 'number',
                    format: 'decimal'
                  },
                  discountedPrice: {
                    type: 'number',
                    format: 'decimal'
                  },
                  hasDiscount: {
                    type: 'boolean'
                  },
                  distance: {
                    type: 'number',
                    format: 'double',
                    description: 'Distance in kilometers'
                  }
                }
              }
            },
            priceLabel: {
              type: 'string',
              enum: ['very inexpensive', 'inexpensive', 'average', 'expensive', 'very expensive'],
              description: 'Price category label'
            },
            product: {
              $ref: '#/components/schemas/Product'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'System health and status endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Admin',
        description: 'Administrative functions for user and system management'
      },
      {
        name: 'Stores',
        description: 'Store management and information'
      },
      {
        name: 'Prices',
        description: 'Price comparison, observations, and batch operations'
      }
    ]
  },
  apis: [
    './src/routes/v1/*.js',
    './src/controllers/*.js',
    './src/schemas/*.js'
  ]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;