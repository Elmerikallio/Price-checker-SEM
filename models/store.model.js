module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define("Store", {
    // Unique ID for the store
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
    // The Store's display name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Email for logging
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    // Password (hashed)
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Admins can lock accounts (ACTIVE -> LOCKED) 
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'LOCKED'),
      defaultValue: 'PENDING'
    },

    // Store location: Latitude
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: { min: -90, max: 90 }
    },

    // Store location: Longitude
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: { min: -180, max: 180 }
    }
  });

  return Store;
};