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
// console.log((new Date(Date.now())).getFullYear());
let history = getHistory();

// Procedure
if (currentSession!=undefined) {
  let [minutes, seconds] = getMinuteAndSecond(currentTimer);
  timerPara.innerHTML = `${minutes}:${seconds}`;
  startTimer();
}

if (history.length>0) {
  
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
function updateHistoryPanel() {
  for (let dateObj of groupByDates) {
    let historyDetailClone = originalHistoryDetail.cloneNode(true);
    let totalTime = dateObj.session.reduce((total, {sessionTime}) => total+=sessionTime, 0);
    let [minutes, seconds] = getMinuteAndSecond(totalTime);
    
  }
}

function getMinuteAndSecond(timeInSecond) {
  let minutes = String(Math.floor(timeInSecond/60)).padStart(2, 0);
  let seconds = String(timeInSecond%60).padStart(2, 0);
  return [minutes, seconds];
}

function getHistoryGroupByWeeks() {

}

function getHistoryGroupByMonth() {
  
}

function getHistory() {
  return (localStorage.getItem('history')!=undefined) ? JSON.parse(localStorage.getItem('history')) : [];
}

function saveSession(preProcessSession) {
  let session = preProcessSession;
  session.sessionTime = currentTimer;
  let sessionDateObj = new Date(session.timeStarted);
  let date = sessionDateObj.getDate();
  let month = sessionDateObj.getMonth();
  let year = sessionDateObj.getFullYear();
  for (let i = 0; i<history.length; i++) {
    if (history[i].date == date &&
        history[i].month == month &&
        history[i].year == year) 
    {
      history[i].sessions.push(session);
    }
  }
  let dateObj = {
    'date' : date,
    'month' : month,
    'year' : year,
    'sessions' : [] 
  };
  dateObj.sessions.push(session);
  history.push(dateObj);
  history = sortFunc(unsortedGroupByDates, (min, current) => {
    if (min.year == current.year) {
      if (min.month == current.month) {
        return min.date > current.date;
      }
      else return min.month>current.month;
    }
    else return min.year>current.year;
  });
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