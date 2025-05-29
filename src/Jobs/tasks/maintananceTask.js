const catchAsync = require("../../utils/catchAsync");
const { maintananceService, monitorService } = require("../../services");

const maintananceTask = catchAsync(async (maintanance) => {
  if (maintanance.endTime.getTime() <= new Date().getTime()) {
    await maintananceService.updateMaintananceById(maintanance.id, {
      controlTime: maintanance.startTime,
      status: false,
    });
    await monitorService.updateMonitorById(maintanance.monitorId, {
      status: "uncertain",
      isProcess: true,
    });
  } 
  else {
    if (
      maintanance.status &&
      maintanance.controlTime.getTime() == maintanance.endTime.getTime()
    ) {
      await maintananceService.updateMaintananceById(maintanance.id, {
        controlTime: maintanance.startTime,
        status: false,
      });
      await monitorService.updateMonitorById(maintanance.monitorId, {
        status: "uncertain",
        isProcess: true,
      });
    }
    if (
      maintanance.status &&
      maintanance.startTime.getTime() == maintanance.controlTime.getTime()
    ) {
      await maintananceService.updateMaintananceById(maintanance.id, {
        status: true,
        controlTime: maintanance.endTime,
      });
      await monitorService.updateMonitorById(maintanance.monitorId, {
        status: "maintanance",
        isProcess: false,
      });
    }
  }
});

module.exports = {
  maintananceTask,
};
