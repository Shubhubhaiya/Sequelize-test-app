class ResourceListResponseMapper {
  constructor(resourceDeal) {
    const { recordId, userId, resourceInfo, resource, stage } = resourceDeal;

    this.id = userId;
    this.recordId = recordId;
    this.lineFunction = resourceInfo.associatedLineFunction
      ? {
          id: resourceInfo.associatedLineFunction.id,
          name: resourceInfo.associatedLineFunction.name
        }
      : null;

    // Name fields are expected to have values
    this.name = `${resource.firstName} ${resource.lastName}`.trim();

    // Stage is expected to be present
    this.stage = {
      id: stage.id,
      name: stage.name
    };

    // These fields always have values, so no need for null coalescing
    this.title = resource.title;
    this.email = resource.email;
    this.novartis521ID = resource.novartis521ID;
    this.siteCode = resource.siteCode;

    // Boolean fields expected to have values
    this.vdrAccessRequested = resourceInfo.vdrAccessRequested;
    this.webTrainingStatus = resourceInfo.webTrainingStatus;
    this.isCoreTeamMember = resourceInfo.isCoreTeamMember;

    // Fields that can be null
    this.oneToOneDiscussion = resourceInfo.oneToOneDiscussion || '';
    this.optionalColumn = resourceInfo.optionalColumn || '';
  }

  static mapResourceList(data) {
    return data.map(
      (resourceDeal) => new ResourceListResponseMapper(resourceDeal)
    );
  }
}

module.exports = ResourceListResponseMapper;
