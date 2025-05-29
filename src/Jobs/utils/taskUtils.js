const dayjs = require('dayjs');

function isoToCron(isoDate) {
  const date = dayjs(isoDate);
  if (!date.isValid()) {
    throw new Error('Geçersiz tarih formatı');
  }

  const second = date.second(); // Saniye
  const minute = date.minute(); // Dakika
  const hour = date.hour(); // Saat
  const day = date.date(); // Gün
  const month = date.month() + 1; // Ay (0-11 yerine 1-12)
  const dayOfWeek = date.day(); // Haftanın günü (0-6, 0 Pazar)

  return `* ${minute} ${hour} ${day} ${month} *`;
}
/*
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
      return `*${time} * * * * *`;
    }
    case 'minutes': {
      if (time > 59) {
        time = 59;
      }
      if (time < 1) {
        time = 1;
      }
      return `0  *${time} * * * *`;
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
      return `0 ${minute} ${hour} *${time} * *`;
    }
    case 'weeks': {
      if (time > 4) {
        time = 4;
      }
      if (time < 1) {
        time = 1;
      }
      return `0 ${minute} ${hour} *${time * 7} * *`;
    }
  }
};
*/

const cronExprension = (time, timeUnit) => {
  switch (timeUnit) {
    case 'seconds': {
      if (time > 59) {
        time = 59;
      }
      if (time < 20) {
        time = 20;
      }
      return (time*1000);
    }
    case 'minutes': {
      if (time > 59) {
        time = 59;
      }
      if (time < 1) {
        time = 1;
      }
      return (time*60*1000);
    }
    case 'hours': {
      return (time*60*60*1000);
    }
    case 'days': {
      return (time*60*24*60*1000);;
    }
  }
};

module.exports = {
  cronExprension,
  isoToCron,
};
