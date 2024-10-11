const webTrainingStatus = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In-progress',
  COMPLETED: 'completed'
};

// Mapping for case-insensitive inputs
const webTrainingStatusMappings = {
  'not started': webTrainingStatus.NOT_STARTED,
  'in-progress': webTrainingStatus.IN_PROGRESS,
  completed: webTrainingStatus.COMPLETED
};

module.exports = { webTrainingStatus, webTrainingStatusMappings };
