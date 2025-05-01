export const timeAgo = (time) => {
  const date = new Date(time);
  const currentDate = new Date();
  const diff = currentDate - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12));

  if (years > 0) {
    return `${years} years`;
  } else if (months > 0) {
    return `${months} months`;
  } else if (days > 0) {
    return `${days} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  } else {
    return `${seconds} seconds`;
  }
};

export const dateFormat = (date) => {
  const dt = new Date(date);
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = dt.getDate().toString().padStart(2, "0");
  const m = month[dt.getMonth()];
  const y = dt.getFullYear();
  const h = dt.getHours().toString().padStart(2, "0");
  const mns = dt.getMinutes().toString().padStart(2, "0");
  const sec = dt.getSeconds().toString().padStart(2, "0");
  const f = Number(h) >= 12 ? "PM" : "AM";

  return { date: `${d} ${m} ${y}`, time: `${h}:${mns}:${sec} ${f}` };
};
