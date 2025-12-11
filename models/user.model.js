module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
    // Admin email for login
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    // Admin password (hashed)
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Role management
    role: {
      type: DataTypes.STRING,
      defaultValue: 'ADMIN',
    },

    // To track which admin created this user
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null for the first super-admin
    }
  });

  return User;
};