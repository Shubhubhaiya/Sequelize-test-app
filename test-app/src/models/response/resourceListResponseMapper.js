class ResourceListResponseMapper {
  constructor(resourceDeal, index) {
    this.id = resourceDeal.userId;
    this.recordId = index + 1; // needed for pagination on UI
    this.lineFunction = resourceDeal.resourceInfo?.associatedLineFunction
      ? {
          id: resourceDeal.resourceInfo.associatedLineFunction.id,
          name: resourceDeal.resourceInfo.associatedLineFunction.name
        }
      : null;
    this.name = `${resourceDeal.resource?.firstName || ''} ${resourceDeal.resource?.lastName || ''}`;
    this.stage = resourceDeal.stage
      ? { id: resourceDeal.stage.id, name: resourceDeal.stage.name }
      : null;
    this.title = resourceDeal.resource?.title;
    this.email = resourceDeal.resource?.email;
    this.vdrAccessRequested = resourceDeal.resourceInfo?.vdrAccessRequested;
    this.webTrainingStatus = resourceDeal.resourceInfo?.webTrainingStatus;
    this.novartis521ID = resourceDeal.resource?.novartis521ID;
    this.isCoreTeamMember = resourceDeal.resourceInfo?.isCoreTeamMember;
    this.oneToOneDiscussion = resourceDeal.resourceInfo?.oneToOneDiscussion;
    this.optionalColumn = resourceDeal.resourceInfo?.optionalColumn;
    this.siteCode = resourceDeal.resource?.siteCode;
  }

  static mapResourceList(data) {
    return data.map(
      (resourceDeal, index) =>
        new ResourceListResponseMapper(resourceDeal, index)
    );
  }
}

module.exports = ResourceListResponseMapper;
