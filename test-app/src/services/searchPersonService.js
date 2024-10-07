const {
  User,
  TherapeuticArea,
  UserTherapeuticAreas,
  Sequelize
} = require('../database/models');
const baseService = require('./baseService');
const errorHandler = require('../utils/errorHandler');
const CustomError = require('../utils/customError');
const statusCodes = require('../config/statusCodes');

class SearchPersonService extends baseService {
  constructor() {
    super(User);
  }

  async searchPerson(query) {
    try {
      const { email } = query;

      // Check if email is provided
      if (!email) {
        throw new CustomError('Please provide email', statusCodes.BAD_REQUEST);
      }

      // Find user by email and include associated therapeutic areas
      const user = await User.findOne({
        where: { email: { [Sequelize.Op.iLike]: email } },
        attributes: [
          'id',
          'email',
          'firstName',
          'lastName',
          'novartis521ID',
          'title'
        ],
        include: [
          {
            model: TherapeuticArea,
            as: 'therapeuticAreas',
            through: {
              model: UserTherapeuticAreas,
              attributes: []
            },
            attributes: ['id', 'name']
          }
        ]
      });

      // Handle case where user is not found
      if (!user) {
        throw new CustomError('User not found', statusCodes.BAD_REQUEST);
      }

      // Prepare and return the response
      const response = {
        id: user.id,
        email: user.email,
        title: user.title,
        firstName: user.firstName,
        lastName: user.lastName,
        novartis521ID: user.novartis521ID,
        therapeuticAreas: user.therapeuticAreas.map((area) => ({
          id: area.id,
          name: area.name
        }))
      };

      return response;
    } catch (error) {
      errorHandler.handle(error);
    }
  }
}

module.exports = new SearchPersonService();
