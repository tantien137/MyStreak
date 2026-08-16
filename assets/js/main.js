// Get HTML Elements
const timerPara = document.getElementById('timer');
const timerControlBtn = document.getElementById('timerControlBtn');
const historyPanel = document.getElementById('history');

// Bindings
let currentSession = JSON.parse(localStorage.getItem('currentSession'));
let currentTimer = Number(localStorage.getItem('currentTimer')) ?? 0;
let interval = undefined;
const delay = 1;
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
function getMonthInText(month) {
  let monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return monthList[month];
}

function getDayInText(day) {
  let dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayList[day];
}

function getMinuteAndSecond(timeInSecond) {
  let minutes = String(Math.floor(timeInSecond/60)).padStart(2, 0);
  let seconds = String(timeInSecond%60).padStart(2, 0);
  return [minutes, seconds];
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
  
  let layerCount = 3;
  let yearExisting = history.find((yearObj) => yearObj.year == year);
  if (yearExisting!=undefined) {
    // This block run if year of the session already exist
    layerCount--;
    let monthExisting = yearExisting.months.find((monthObj) => monthObj.month == month);
    if (monthExisting!=undefined) {
      layerCount--;
      let dateExisting = month.dates.find((dateObj) => dateObj.date == date);
      if (dateExisting!=undefined) {
        layerCount--;
        let sessionExisting = dateExisting.sessions.find((existingSession) => existingSession.timeStarted == session.timeStarted);
        if (sessionExisting==undefined) {
          dateExisting.sessions.push(session);
        }
      }
    }
  }
  if (layerCount < 3) {
    
  }
  localStorage.setItem('history', JSON.stringify(history));
}

function createSession() {
  return {
    'timeStarted' : Date.now(),
    'sessionTime' : 0,
    'htmlObj' : null
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