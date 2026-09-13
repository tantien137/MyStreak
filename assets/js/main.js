// Debug
console.log(localStorage);

const clearCacheBtn = document.getElementById('clearCacheBtn');
clearCacheBtn.addEventListener('click', () => {
  localStorage.clear();
})
const runTestCodeBtn = document.getElementById('runTestCode');
runTestCodeBtn.addEventListener('click', () => {
  console.log(document.getElementById('random'));
})
const dateInput = document.getElementById('dateInput');
const insertToHistory = document.getElementById('insertToHistory');
insertToHistory.addEventListener('click', () => {
  const dates = dateInput.value.split('/');
  saveSession({
    timeStarted: (new Date(Number(dates[2]), Number(dates[1])-1, Number(dates[0]))).getTime(),
    duration: 1000
  })
  console.log(history);
})

// Get HTML Elements
const timerPara = document.getElementById('timer');
const timerControlBtn = document.getElementById('timerControlBtn');
const historyPanel = document.getElementById('history');
const debtTimePara = document.getElementById('hoursNeeded');
const totalTimePara = document.getElementById('totalTime');

// Bindings
let startDate = (new Date(2026, 7, 10)).getTime();
let currentSession = JSON.parse(localStorage.getItem('currentSession'));
let currentTimer = Number(localStorage.getItem('currentTimer')) ?? 0;
let interval = undefined;
const delay = 1;
let history = getHistory();
let lastAddedSession = null;
let weeks = getWeeks();
let totalTimeFocused = totalFocusTime();
let debtTime = (weeks*10*60-totalTimeFocused<0) ? 0 : weeks*10*60-totalTimeFocused;
// if you don't want to set day start to count, uncomment this code to make it auto take the first day you use
// let startDate = history[0].timeStarted;

// Procedure
updateTotalTime();

if (debtTime>0) {
  let debtHours = Math.floor(debtTime/60);
  let debtMins = Math.floor(debtTime%60);
  debtTimePara.innerHTML = `${debtHours} hours ${debtMins} minutes`;
}

if (currentSession!=undefined) {
  let [minutes, seconds] = getMinuteAndSecond(currentTimer);
  timerPara.innerHTML = `${minutes}:${seconds}`;
  startTimer();
}

if (history.length>0) {
  initHistoryPanel();
}
else {
  const emptyMsgWrapper = document.createElement('div');
  emptyMsgWrapper.id = `emptyMsgWrapper`;
  const emptyHistoryMsg = document.createElement('p');
  emptyHistoryMsg.id = `emptyHistoryMsg`;
  emptyHistoryMsg.innerHTML = 'No sessions have been saved.'
  emptyMsgWrapper.append(emptyHistoryMsg);
  historyPanel.appendChild(emptyMsgWrapper);
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
function updateHoursNeeded() {
  if (debtTime>0) {
    debtTimePara.innerHTML = "Time needs to get streak: "
  }
}

function updateTotalTime() {
  totalTimeFocused = totalFocusTime();
  let [mins, seconds] = getMinuteAndSecond(totalTimeFocused);
  totalTimePara.innerHTML = `Total Time Focused: ${mins} minutes ${seconds} seconds`;
}

function totalFocusTime() {
  return history.reduce((totalSeconds, session) => {
    return totalSeconds+=session.duration;
  }, 0);
}

function getWeeks() {
  let today = new Date();
  let minusNum = (today.getDay()==0) ? 7 : today.getDay();
  let weeks = Math.ceil((totalDaysBetween(today.getTime(), startDate)-(minusNum))/7);
  return weeks;
}

function totalDaysBetween(timeStamp1, timeStamp2) {
  return (timeStamp1-timeStamp2)/(1000*60*60*24);
}

function initHistoryPanel() {
  for (let session of history) {
    addSessionToHistoryPanel(session);
  }
}

function addSessionToHistoryPanel(session) {
    let sessionDate = new Date(session.timeStarted);
    let date = sessionDate.getDate();
    let month = sessionDate.getMonth();
    let year = sessionDate.getFullYear();
    let sessionPara = document.createElement('p');
    let [mins, seconds] = getMinuteAndSecond(session.duration);
    sessionPara.innerHTML = `${sessionDate.toLocaleTimeString('vi-VN')} - ${mins} minutes ${seconds} seconds`;
    let dateDetail = document.getElementById(`h_${year}_${month}_${date}`);
    if (dateDetail==null) {
      let dateSummary;
      [dateDetail, dateSummary] = createHistoryDateContainer(`h_${year}_${month}_${date}`);
      dateDetail.classList.add('dateDetail');
      dateSummary.innerHTML = `${getDayText(sessionDate.getDay())}, ${sessionDate.getDate()}`;
      let monthDetail = document.getElementById(`h_${year}_${month}`);
      if (monthDetail==null) {
        let monthSummary;
        [monthDetail, monthSummary] = createHistoryDateContainer(`h_${year}_${month}`);
        monthDetail.classList.add('monthDetail');
        monthSummary.innerHTML = `${getMonthText(month)}`;
        let yearDetail = document.getElementById(`h_${year}`);
        if (yearDetail==null) {
          let yearSummary;
          [yearDetail, yearSummary] = createHistoryDateContainer(`h_${year}`);
          yearDetail.classList.add('yearDetail');
          yearSummary.innerHTML = `${year}`;
          historyPanel.prepend(yearDetail);
        }
        yearDetail.querySelector('.content').append(monthDetail);
      }
      monthDetail.querySelector('.content').append(dateDetail);
    }
    dateDetail.querySelector('.content').append(sessionPara);
}

function createHistoryDateContainer(id) {
  let details = document.createElement('details');
  details.id = id;
  let detailsSummary = document.createElement('summary');
  details.prepend(detailsSummary);
  let contentDiv = document.createElement('div');
  contentDiv.classList.add('content');
  details.append(contentDiv);
  return [details, detailsSummary];
}

function updateHistorySection() {
  const emptyMsgWrapper = document.getElementById('emptyMsgWrapper');
  if (emptyMsgWrapper) {
    emptyMsgWrapper.remove();
  }
  addSessionToHistoryPanel(lastAddedSession);
  if ((lastAddedSession.timeStarted-startDate)<0) startDate = lastAddedSession.timeStarted;
}

function getMonthText(month) {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
}

function getDayText(day) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
}

function getMinuteAndSecond(timeInSecond) {
  let minutes = String(Math.floor(timeInSecond/60)).padStart(2, 0);
  let seconds = String(timeInSecond%60).padStart(2, 0);
  return [minutes, seconds];
}

function getHistory() {
  return (localStorage.getItem('history')!=undefined) ? JSON.parse(localStorage.getItem('history')) : [];
}

function saveSession(session) {
  history.push(session);
  history.sort((a, b) => a.timeStarted - b.timeStarted);
  localStorage.setItem('history', JSON.stringify(history));
  lastAddedSession = session;
}

function createSession() {
  return {
    'timeStarted' : Date.now(),
    'duration' : 0
  }
}   

function startTimer() {
  interval = mySetInterval(tickTimer, delay*1000);
  timerControlBtn.innerHTML = "End Session";
}

function endTimer() {
  clearTimeout(interval.id);
  currentSession.duration = currentTimer;
  saveSession(currentSession);
  currentTimer = 0;
  currentSession = undefined;
  localStorage.removeItem('currentTimer');
  localStorage.removeItem('currentSession');
  timerPara.innerHTML = '00:00';
  timerControlBtn.innerHTML = "Focus";
  updateHistorySection();
  updateTotalTime();
}

function tickTimer() {
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