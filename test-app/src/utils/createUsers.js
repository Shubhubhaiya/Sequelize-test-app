const { User } = require('../database/models'); // Adjust the path as needed
const { Role } = require('../database/models'); // Adjust the path as needed
const role = require('../database/models/role');

async function createUsers() {
  try {
    console.log(User);
    // Retrieve role IDs
    const adminRole = await Role.findAll({ where: { name: 'SystemAdmin' } });
    const dealLeadRole = await Role.findAll({ where: { name: 'DealLead' } });
    const resourceRole = await Role.findAll({ where: { name: 'Resource' } });

    // Create users
    const adminUser = await User.create({
      firstName: 'Hatakesam',
      lastName: 'Goru',
      email: 'Hatakesam.goru@novartis.com',
      roleId: adminRole[0].id,
      title: 'System admin',
      siteCode: 'HQ',
      novartis521ID: 'admin@novartis.net',
      createdBy: 1,
      modifiedBy: 1
    });

    const dealLeadUser = await User.create({
      firstName: 'Ravi',
      lastName: 'Chaudhary',
      email: 'Ravi.Chaudhary@novartis.com',
      roleId: dealLeadRole[0].id,
      title: 'Lead',
      siteCode: 'HQ',
      novartis521ID: 'Ravi@novartis.net',
      createdBy: 1,
      modifiedBy: 1
    });

    const dealLeadUser2 = await User.create({
      firstName: 'Shubhdeep',
      lastName: 'verma',
      email: 'shubhdeep.verma@novartis.com',
      roleId: dealLeadRole[0].id,
      title: 'software engineer',
      siteCode: 'HQ',
      novartis521ID: 'Shubhdeep@novartis.neta',
      createdBy: 1,
      modifiedBy: 1
    });

    const resourceUser = await User.create({
      firstName: 'Pankaj',
      lastName: 'verma',
      email: 'pankaj.verma@novartis.com',
      roleId: resourceRole[0].id,
      title: 'Resource',
      siteCode: 'HQ',
      novartis521ID: 'resource@novartis.net',
      createdBy: 1,
      modifiedBy: 1
    });

    // console.log(
    //   'Users created:',
    //   adminUser.email,
    //   dealLeadUser.email,
    //   resourceUser.email
    // );
  } catch (error) {
    console.error('Error creating users:', error);
  }
}
module.exports = createUsers;
