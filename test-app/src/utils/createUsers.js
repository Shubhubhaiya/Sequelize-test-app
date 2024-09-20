const { User } = require('../database/models'); // Adjust the path as needed
const { Role } = require('../database/models'); // Adjust the path as needed
const role = require('../database/models/role');

async function createUsers() {
  try {
    // Retrieve role IDs
    const adminRole = await Role.findAll({ where: { name: 'SystemAdmin' } });
    const dealLeadRole = await Role.findAll({ where: { name: 'DealLead' } });
    const resourceRole = await Role.findAll({ where: { name: 'Resource' } });

    // // Create users
    // const adminUser = await User.create({
    //   firstName: 'adminFirstName',
    //   lastName: 'adminLastName',
    //   email: 'admin@example.com',
    //   phoneNumber: '123-456-7890',
    //   roleId: adminRole[0].id,
    //   lineFunction: 1,
    //   title: 'System admin',
    //   siteCode: 'HQ',
    //   novartis521ID: 'admin@novartis.net',
    //   webTrainingStatus: 'Completed',
    //   createdBy: 1 // You might need to adjust this depending on how you handle the initial user creation
    // });

    // const dealLeadUser = await User.create({
    //   firstName: 'DealLeadFirstname',
    //   lastName: 'DalLeadLastName',
    //   email: 'deal.lead@example.com',
    //   phoneNumber: '987-654-3210',
    //   roleId: dealLeadRole[0].id,
    //   lineFunction: 2,
    //   title: 'Deal Leader',
    //   siteCode: 'HQ',
    //   novartis521ID: 'deal@novartis.net',
    //   webTrainingStatus: 'Completed',
    //   createdBy: 1
    // });

    const dealLeadUser2 = await User.create({
      firstName: 'DealLeadFirstname2',
      lastName: 'DalLeadLastName2',
      email: 'deal2.lead@example.com',
      phoneNumber: '987-654-3211',
      roleId: dealLeadRole[0].id,
      lineFunction: 2,
      title: 'Deal Leader',
      siteCode: 'HQ',
      novartis521ID: 'deal@novartis.neta',
      webTrainingStatus: 'Completed',
      createdBy: 1
    });

    const dealLeadUser3 = await User.create({
      firstName: 'DealLeadFirstname3',
      lastName: 'DalLeadLastName3',
      email: 'deal3.lead@example.com',
      phoneNumber: '987-654-3212',
      roleId: dealLeadRole[0].id,
      lineFunction: 2,
      title: 'Deal Leader',
      siteCode: 'HQ',
      novartis521ID: 'deal@novartis.netb',
      webTrainingStatus: 'Completed',
      createdBy: 1
    });

    const dealLeadUser4 = await User.create({
      firstName: 'DealLeadFirstname4',
      lastName: 'DalLeadLastName4',
      email: 'deal4.lead@example.com',
      phoneNumber: '987-654-3213',
      roleId: dealLeadRole[0].id,
      lineFunction: 2,
      title: 'Deal Leader',
      siteCode: 'HQ',
      novartis521ID: 'deal@novartis.netc',
      webTrainingStatus: 'Completed',
      createdBy: 1
    });

    // const resourceUser = await User.create({
    //   firstName: 'ResourceFirstName',
    //   lastName: 'ResourceLastName',
    //   email: 'resource@example.com',
    //   phoneNumber: '555-555-5555',
    //   roleId: resourceRole[0].id,
    //   lineFunction: 3,
    //   title: 'Resource Manager',
    //   siteCode: 'HQ',
    //   novartis521ID: 'resource@novartis.net',
    //   webTrainingStatus: 'Completed',
    //   createdBy: 1
    // });

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
