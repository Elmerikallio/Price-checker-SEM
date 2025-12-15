module.exports = (sequelize, DataTypes) => {
  const Price = sequelize.define("Price", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    // The barcode numbers
    barcode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },

    // The type of barcode
    barcodeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // The price of the product at that moment 
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },

    // Location data: Latitude 
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false, 
      validate: {
        min: -90,
        max: 90
      }
    },

    // Location data: Longitude 
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false, 
      validate: {
        min: -180,
        max: 180
      }
    },

    // When this price was observed 
    observedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // To track who submitted this price
    source: {
      type: DataTypes.ENUM('SHOPPER', 'STORE_USER'),
      defaultValue: 'SHOPPER',
    }
  });

  return Price;
};