/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */

const cronExprension = (time, timeUnit) => {
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let day = now.getDate();
  let month = now.getMonth() + 1; // Aylar 0'dan başlar, bu yüzden 1 ekliyoruz
  let nextMonthDay = month === 2 ? (day > 28 ? 28 : day) : day > 30 ? 30 : day;
  // eslint-disable-next-line default-case
  switch (timeUnit) {
    case 'seconds': {
      if (time > 59) {
        time = 59;
      }
      if (time < 20) {
        time = 20;
      }
      return `*/${time} * * * * *`;
    }
    case 'minutes': {
      if (time > 59) {
        time = 59;
      }
      if (time < 1) {
        time = 1;
      }
      return `0  */${time} * * * *`;
    }
    case 'hours': {
      hour %= time;
      if (time >= 24) {
        return `0 ${minute} ${hour} * * *`;
      }
      if (time < 1) {
        return `0 ${minute} * * * *`;
      }
      return `0 ${minute} ${hour}-23/${time} * * *`;
    }
    case 'days': {
      if (time >= 30) {
        return `0 ${minute} ${hour} ${nextMonthDay} * *`;
      }
      if (time < 1) {
        return `0 ${minute} ${hour} * * *`;
      }
      return `0 ${minute} ${hour} */${time} * *`;
    }
    case 'weeks': {
      if (time > 4) {
        time = 4;
      }
      if (time < 1) {
        time = 1;
      }
      return `0 ${minute} ${hour} */${time * 7} * *`;
    }
  }
};

module.exports = {
  cronExprension,
};
