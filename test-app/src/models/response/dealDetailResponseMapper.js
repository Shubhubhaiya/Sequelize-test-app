class DealDetailResponseMapper {
  constructor(deal) {
    this.id = deal.id;
    this.name = deal.name;
    this.stage = {
      id: deal.stage.id,
      name: deal.stage.name
    };
    this.therapeuticArea = {
      id: deal.therapeuticAreaAssociation.id,
      name: deal.therapeuticAreaAssociation.name
    };
    this.dealLeads = deal.leadUsers.map((leadUser) => ({
      id: leadUser.id,
      email: leadUser.email,
      novartis521ID: leadUser.novartis521ID,
      firstName: leadUser.firstName,
      lastName: leadUser.lastName,
      title: leadUser.title,
      therapeuticAreas: leadUser.therapeuticAreas.map((ta) => ({
        id: ta.id,
        name: ta.name
      }))
    }));
  }
}

module.exports = DealDetailResponseMapper;
