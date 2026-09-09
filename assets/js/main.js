// Debug
console.log(localStorage);

const clearcacheBtn = document.getElementById('clearcacheBtn');
clearcacheBtn.addEventListener('click', () => {
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
    timeStarted: (new Date(Number(dates[2]), Number(dates[1]), Number(dates[0]))).getTime(),
    sessionTime: 1000
  })
  console.log(history);
})

// Get HTML Elements
const timerPara = document.getElementById('timer');
const timerControlBtn = document.getElementById('timerControlBtn');
const historyPanel = document.getElementById('history');
const owningTimePara = document.getElementById('hoursNeededForStreak');

// Bindings
let startedDate = (new Date(2026, 7, 10)).getTime();
let currentSession = JSON.parse(localStorage.getItem('currentSession'));
let currentTimer = Number(localStorage.getItem('currentTimer')) ?? 0;
let interval = undefined;
const delay = 1;
let history = getHistory();
let lastAddedSession = null;
let weeks = getWeeks();
console.log(weeks);
let totalTimeFocused = totalFocusTime()/60;
let owningTime = (weeks*10*60-totalTimeFocused<0) ? 0 : weeks*10*60-totalTimeFocused;
console.log(owningTime);
// if you don't want to set day start to count, uncomment this code to make it auto take the first day you use
// let startedDate = history[0].timeStarted;

// Procedure
if (owningTime>0) {
  let owningHours = Math.floor(owningTime/60);
  let owningMins = Math.floor(owningTime%60);
  owningTimePara.innerHTML = `${owningHours} hours ${owningMins} minutes`;
}

if (currentSession!=undefined) {
  let [minutes, seconds] = getMinuteAndSecond(currentTimer);
  timerPara.innerHTML = `${minutes}:${seconds}`;
  startTimer();
}

if (history.length>0) {
  initialHistoryPanel();
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
function totalFocusTime() {
  return history.reduce((currentTime, session) => {
    return currentTime+=session.sessionTime;
  }, 0);
}

function getWeeks() {
  let today = new Date();
  let minusNum = (today.getDay()==0) ? 7 : today.getDay();
  let weeks = Math.ceil((totalDaysBeetween(today.getTime(), startedDate)-(minusNum))/7);
  return weeks;
}

function totalDaysBeetween(timeStamp1, timeStamp2) {
  return (timeStamp1-timeStamp2)/(1000*60*60*24);
}

function initialHistoryPanel() {
  for (let session of history) {
    addSessionToHistoryPanel(session);
  }
}

function addSessionToHistoryPanel(session) {
    let sessionDate = new Date(session.timeStarted);
    let date = sessionDate.getDate();
    let month = sessionDate.getMonth();
    let year = sessionDate.getFullYear();
    let sessionParaTag = document.createElement('p');
    sessionParaTag.innerHTML = sessionDate.toLocaleTimeString('vi-VN');
    let dateDetailTag = document.getElementById(`h_${year}_${month}_${date}`);
    if (dateDetailTag==null) {
      let dateSummary;
      [dateDetailTag, dateSummary] = createHistoryDateContainer(`h_${year}_${month}_${date}`);
      dateSummary.innerHTML = `${getDayText(sessionDate.getDay())} ${getMonthText(month)} ${date} ${year}`;
      let monthDetailTag = document.getElementById(`h_${year}_${month}`);
      if (monthDetailTag==null) {
        let monthSummary;
        [monthDetailTag, monthSummary] = createHistoryDateContainer(`h_${year}_${month}`);
        monthSummary.innerHTML = `${getMonthText(month)}`;
        let yearDetailTag = document.getElementById(`h_${year}`);
        if (yearDetailTag==null) {
          let yearSummary;
          [yearDetailTag, yearSummary] = createHistoryDateContainer(`h_${year}`);
          yearSummary.innerHTML = `${year}`;
          historyPanel.prepend(yearDetailTag);
        }
        yearDetailTag.append(monthDetailTag);
      }
      monthDetailTag.append(dateDetailTag);
    }
    dateDetailTag.append(sessionParaTag);
}

function createHistoryDateContainer(id) {
  let detailsTag = document.createElement('details');
  detailsTag.id = id;
  detailsTag.classList.add('dateDetail');
  let detailsSummary = document.createElement('summary');
  detailsTag.prepend(detailsSummary);
  return [detailsTag, detailsSummary];
}

function updateHistorySection() {
  addSessionToHistoryPanel(lastAddedSession);
  if ((lastAddedSession.timeStarted-startedDate)<0) startedDate = lastAddedSession.timeStarted;
}

function getMonthText(month) {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
}

function getDayText(day) {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day];
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
  let i = history.length-1;
  while (i>-1 && session.timeStarted<history[i].timeStarted) {
    i--;
  }
  let anotherIndex = history.length-1;
  /* 
   Create new element in the end of history array
   to start move session newer than current session forward
  */
  history.push(history[anotherIndex]);
  while (anotherIndex>i+1) {
    history[anotherIndex] = history[anotherIndex-1];
    anotherIndex--;
  }
  history[i+1] = session;
  localStorage.setItem('history', JSON.stringify(history));
  lastAddedSession = history[i+1];
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
  currentSession.sessionTime = currentTimer;
  saveSession(currentSession);
  currentTimer = 0;
  currentSession = undefined;
  localStorage.removeItem('currentTimer');
  localStorage.removeItem('currentSession');
  timerPara.innerHTML = '00:00';
  timerControlBtn.innerHTML = "Focus";
  updateHistorySection();
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