class ResourceDetailResponse {
  constructor(resource) {
    this.id = resource.userId;
    this.firstName = resource.resource.firstName;
    this.lastName = resource.resource.lastName;
    this.title = resource.resource.title;
    this.email = resource.resource.email;
    this.novartis521ID = resource.resource.novartis521ID;
    this.siteCode = resource.resource.siteCode;
    this.vdrAccessRequested = resource.resourceInfo.vdrAccessRequested;
    this.webTrainingStatus = resource.resourceInfo.webTrainingStatus;
    this.oneToOneDiscussion = resource.resourceInfo.oneToOneDiscussion;
    this.optionalColumn = resource.resourceInfo.optionalColumn;
    this.isCoreTeamMember = resource.resourceInfo.isCoreTeamMember;

    // Line Function mapping
    this.lineFunction = resource.resourceInfo.associatedLineFunction
      ? {
          id: resource.resourceInfo.associatedLineFunction.id,
          name: resource.resourceInfo.associatedLineFunction.name
        }
      : null;

    // Stage mapping
    this.stage = resource.stage
      ? { id: resource.stage.id, name: resource.stage.name }
      : null;
  }
}

module.exports = ResourceDetailResponse;
