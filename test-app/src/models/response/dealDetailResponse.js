class DealDetailResponse {
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
      email: leadUser.email,
      novartis521ID: leadUser.novartis521ID,
      firstName: leadUser.firstName,
      lastName: leadUser.lastName,
      title: leadUser.title
    }));
  }
}

module.exports = DealDetailResponse;
