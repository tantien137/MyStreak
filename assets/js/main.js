// Get HTML Elements
const timerPara = document.getElementById('timer');
const timerControlBtn = document.getElementById('timerControlBtn');
const historyPanel = document.getElementById('history');
const originalHistoryDetail = document.getElementById('originalHistoryDetail');

// Bindings
let currentSession = JSON.parse(localStorage.getItem('currentSession'));
let currentTimer = Number(localStorage.getItem('currentTimer')) ?? 0;
let interval = undefined;
const delay = 1;
let history = getHistory();
let days = getDays();
console.log(history);

// Procedure
if (currentSession!=undefined) {
  let [minutes, seconds] = getMinuteAndSecond(currentTimer);
  timerPara.innerHTML = `${minutes}:${seconds}`;
  startTimer();
}

if (history.length>0) {
  let daysName = Object.keys(days);
  for (let day of daysName) {
    let historyDetailClone = originalHistoryDetail.cloneNode(true);
    let sumOfTime = days[day].reduce((sum, {sessionTime}) => sum+=sessionTime, 0);
    let [minutes, seconds] = getMinuteAndSecond(sumOfTime);
    historyDetailClone.querySelector('summary').innerHTML = `${day.replaceAll('/', '-')} (${minutes} minutes ${seconds} seconds)`;
    historyDetailClone.classList.remove("hidden");
    historyPanel.prepend(historyDetailClone);
    for (let session of days[day]) {
      const timeDetailPara = document.createElement('p');
      timeDetailPara.classList.add('timeDetail');
      let [minutes, seconds] = getMinuteAndSecond(session.sessionTime);
      timeDetailPara.innerHTML = `${(new Date(session.timeStarted)).toLocaleTimeString('vi-VN')} (${minutes} minutes ${seconds} seconds)`
      historyDetailClone.prepend(timeDetailPara);
    }
  }
}
else {
  const announcePara = document.createElement('p');
  announcePara.innerHTML = 'No session have been save.'
  historyPanel.appendChild(announcePara);
}

// Events
timerControlBtn.addEventListener('click', () => {
  if (currentSession==undefined) {
    currentSession = createSession();
    localStorage.setItem('currentSession', JSON.stringify(currentSession));
    startTimer();
  }
  else endTimer();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState == 'visible' && currentSession!=undefined) {
    currentTimer = (Math.floor((Date.now() - currentSession.timeStarted)/1000));
    localStorage.setItem('currentTimer', currentTimer);
  }
})

// Functions

function sortHistory() {
  
}

function getMinuteAndSecond(timeInSecond) {
  let minutes = String(Math.floor(timeInSecond/60)).padStart(2, 0);
  let seconds = String(timeInSecond%60).padStart(2, 0);
  return [minutes, seconds];
}

function getDays() {
  return history.reduce((dayGroups, session) => {
    let sessionDate = new Date(session.timeStarted).toLocaleDateString('vi-VN')
    for (let groupName of Object.keys(dayGroups)) {
      if (sessionDate == groupName) {
        dayGroups[groupName].push(session);
        return dayGroups;
      }
    }
    dayGroups[sessionDate] = [];
    dayGroups[sessionDate].push(session);
    return dayGroups;
  }, {})
}

function getHistory() {
  return (localStorage.getItem('history')!=undefined) ? JSON.parse(localStorage.getItem('history')) : [];
}

function saveSession(preProcessSession) {
  let session = preProcessSession;
  session.sessionTime = currentTimer;
  history.push(session);
  historyPanel.querySelectorAll('details').forEach((detailsTag) => {
    if (detailsTag.querySelector('summary').innerHTML.slice(0, 9)==(new Date(session.timeStarted).toLocaleDateString('vi-VN').replaceAll('/', '-'))) {
      console.log('hello');
      const timeDetailPara = document.createElement('p');
      timeDetailPara.classList.add('timeDetail');
      let [minutes, seconds]= getMinuteAndSecond(session.sessionTime);
      timeDetailPara.innerHTML = `${(new Date(session.timeStarted)).toLocaleTimeString('vi-VN')} (${minutes} minutes ${seconds} seconds)`
      detailsTag.prepend(timeDetailPara);
    }
  })
  localStorage.setItem('history', JSON.stringify(history));
}

function createSession() {
  return session = {
    'timeStarted' : Date.now(),
    'sessionTime' : 0
  }
}   

function startTimer() {
  interval = mySetInterval(changeTimer, delay*1000);
  timerControlBtn.innerHTML = "End Session";
}

function endTimer() {
  clearTimeout(interval.id);
  saveSession(currentSession);
  currentTimer = 0;
  currentSession = undefined;
  localStorage.removeItem('currentTimer');
  localStorage.removeItem('currentSession');
  timerPara.innerHTML = '00:00';
  timerControlBtn.innerHTML = "Focus";
}

function changeTimer() {
  currentTimer += delay;
  localStorage.setItem('currentTimer', currentTimer);
  let [minutes, seconds] = getMinuteAndSecond(currentTimer);
  timerPara.innerHTML = `${minutes}:${seconds}`;
}

function mySetInterval(func, delay) {
  let timer = {id:null};
  function loop() {
    func();
    timer.id = setTimeout(loop, delay);
  }
  timer.id = setTimeout(loop, delay);
  return timer;
}


// Debug
console.log(localStorage);
const clearcacheBtn = document.getElementById('clearcacheBtn');
clearcacheBtn.addEventListener('click', () => {
  localStorage.clear();
})