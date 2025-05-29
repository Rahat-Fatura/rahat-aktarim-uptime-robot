const {
  monitorService,
  monitorLogService,
  emailService,
  keyWordMonitorService,
} = require("../../services");
const axios = require("axios");
const { cronExprension } = require("../utils/taskUtils");
const xml2js = require("xml2js");
const cheerio = require("cheerio");


async function keyWordTask(monitor) {
  try {
    monitor = await monitorService.getKeyWordMonitorWithBody(monitor.id);
    const keyWordMonitor = monitor.keyWordMonitor;
    const result = await sendRequestAndControlKey(keyWordMonitor);
    if (!result.isError) {
      if (monitor.status === "down" || monitor.status === "uncertain") {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Rahat Sistem Sunucu kontrollörü  ${keyWordMonitor.method}`,
            `Sunucunuz çalışıyor ...
             HOST ADI: ${monitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`
          );
        } catch (error) {}
      }
      monitor.status = "up";
      monitor.isProcess = false;
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, {
        status: monitor.status,
        isProcess: monitor.isProcess,
        controlTime: monitor.controlTime,
      });
    } else {
      try {
        await emailService.sendEmail(
          `<${monitor.serverOwner.email}>`,
          `Rahat Sistem Sunucu kontrollörü  ${keyWordMonitor.method}`,
          `Sunucunuz çalışıyor ...
             HOST ADI: ${monitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`
        );
      } catch (error) {}
      monitor.isProcess = false;
      monitor.status = "down";
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, {
        status: monitor.status,
        isProcess: monitor.isProcess,
        controlTime: monitor.controlTime,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

function isMatchFound(jsonData, searchObj) {
  searchObj = JSON.parse(searchObj);
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

  function deepSearch(obj) {
    if (typeof obj !== "object" || obj === null) return false;
    const isMatch = Object.keys(searchObj).every(
      (key) => obj.hasOwnProperty(key) && obj[key] === searchObj[key]
    );
    if (isMatch) return true;
    for (const key in obj) {
      if (deepSearch(obj[key])) return true;
    }
    return false;
  }
  return deepSearch(data);
}


const controlKeyWord = async (data, contentType, keyword) => {
  let flag = false;
  if (contentType.includes("application/json")) {
    return isMatchFound(data, keyword);
  } else if (contentType.includes("xml")) {
    const parser = new xml2js.Parser({ explicitArray: false });
    const xmlObj = await parser.parseStringPromise(data);
    const xmlStr = JSON.stringify(xmlObj).toLowerCase();
    return xmlStr.includes(keyword.toLowerCase());
  } else if (
    contentType.includes("text/html") ||
    contentType.includes("text/plain")
  ) {
    const artirbuts = keyword.split("<")[1].split(">")[0];
    const key = artirbuts.split(" ")[0];
    const $ = cheerio.load(data);
    const searchObject = cheerio.load(keyword);
    const element = searchObject(key);
    const className = element.attr("class");
    const id = element.attr("id");
    const dataType = element.attr("data-type");

    if(id){
      flag = $(`#${id}`).html() == searchObject(`#${id}`).html();
    }
    const classElements = $(`${key}.${className}`).toArray();
    if(className && !flag){
      for(let el of classElements){
        const htmlContent = $(el).html();
        if(htmlContent === searchObject(`.${className}`).html()){
          flag = true;
          break;
        }
      }
    }
    for(let el of $(key).toArray()){
      if(flag) break;
      const htmlContent = $(el).html();
      if(htmlContent === searchObject(key).html()){
        flag = true;
        break;
      }
    };
    return flag;
  } else {
    console.warn(`[!] Desteklenmeyen Content-Type: ${contentType}`);
    return flag; 
  }
};

async function sendRequestAndControlKey(monitor) {
  const startTime = Date.now();
  let responseTime = 0;
  let isError = false;
  let status;
  try {
    const config = {
      method: monitor.method,
      url: monitor.host,
      headers: monitor.headers || {},
      timeout: monitor.timeout || 20000,
    };
    if (["POST", "PUT", "PATCH"].includes(monitor.method)) {
      config.data = monitor.body || {};
    }
    const response = await axios(config);
    responseTime = Date.now() - startTime;
    isError = !(await controlKeyWord(
      response.data,
      String(response.headers["content-type"]).toLowerCase(),
      monitor.keyWord
    ));
    if (monitor.allowedStatusCodes.length > 0) {
      isError = !monitor.allowedStatusCodes.includes(
        response.status.toString()
      );
      status = response.status;
      return {
        status: status,
        responseTime,
        isError,
        message: isError ? "unsuccess" : "success",
      };
    } else {
      status = response.status;
      return {
        status: status,
        responseTime,
        isError,
        message: isError ? "unsuccess" : "success",
      };
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    isError = true;
    console.log("Error occurred:", error.message);
    /*if (error.status) {
      if (monitor.allowedStatusCodes.length > 0) {
          console.log("allowedStatusCodes", monitor.allowedStatusCodes);
          isError = !monitor.allowedStatusCodes.includes(
          response.status.toString()
        );
        status = error.status;
      } else {
        status = error.status;
        isError = true;
      }
    } else {
      console.log("error", error.status);
      isError = true;
    }*/
    //console.log('error', error);
  } finally {
    return {
      status: status || 0,
      responseTime,
      isError,
      message: isError ? "unsuccess" : "success",
    };
  }
}

module.exports = {
  keyWordTask,
  sendRequestAndControlKey,
};
