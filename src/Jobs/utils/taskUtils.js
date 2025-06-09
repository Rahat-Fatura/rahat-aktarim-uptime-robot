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
