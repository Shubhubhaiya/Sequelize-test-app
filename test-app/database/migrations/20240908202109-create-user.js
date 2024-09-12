'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lineFunction: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LineFunctions',
          key: 'id'
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      siteCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      novartis521ID: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      oneToOneDiscussion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      optionalColumn: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      webTrainingStatus: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isCoreTeamMember: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      modifiedAt: {
        type: Sequelize.DATE
      },
      modifiedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
