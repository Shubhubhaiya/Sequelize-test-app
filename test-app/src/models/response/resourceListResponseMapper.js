class ResourceListResponseMapper {
  constructor(resourceDeal, index) {
    const { userId, dealId, dealStageId, resourceInfo, resource, stage } =
      resourceDeal;

    this.id = userId;
    this.recordId = index + 1; // Adjusted with pagination offset
    this.lineFunction = resourceInfo?.associatedLineFunction
      ? {
          id: resourceInfo.associatedLineFunction.id,
          name: resourceInfo.associatedLineFunction.name
        }
      : null;
    this.name =
      `${resource?.firstName || ''} ${resource?.lastName || ''}`.trim();
    this.stage = stage ? { id: stage.id, name: stage.name } : null;
    this.title = resource?.title || '';
    this.email = resource?.email || '';
    this.vdrAccessRequested = resourceInfo?.vdrAccessRequested || false;
    this.webTrainingStatus = resourceInfo?.webTrainingStatus || '';
    this.novartis521ID = resource?.novartis521ID || '';
    this.isCoreTeamMember = resourceInfo?.isCoreTeamMember || false;
    this.oneToOneDiscussion = resourceInfo?.oneToOneDiscussion || '';
    this.optionalColumn = resourceInfo?.optionalColumn || '';
    this.siteCode = resource?.siteCode || '';
  }

  static mapResourceList(data, offset = 0) {
    return data.map(
      (resourceDeal, index) =>
        new ResourceListResponseMapper(resourceDeal, offset + index)
    );
  }
}

module.exports = ResourceListResponseMapper;
