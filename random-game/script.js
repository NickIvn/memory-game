const gate = document.querySelector('.container');
const start = document.querySelector('.start');
const targetBall = document.getElementById('target-ball');
const correctChoose = document.getElementById('raiting');
const modal = document.querySelector('.modal');
const countdownDisplay = document.getElementById('countdown');
const about = document.querySelector('.link-about');
const backgroundMusic = document.getElementById('background-music');
const hitSound = document.getElementById('hit');
const missSound = document.getElementById('miss');
const table = document.querySelector('.table table');
const tbody = table.querySelector('tbody');
const upButton = document.querySelector('.up');
const downButton = document.querySelector('.down');
const overlay = document.getElementById('overlay');
const startSound = document.getElementById('start');
const endSound = document.getElementById('end');
const mediumLevel = document.getElementById('medium-level');

let array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let timer;
let remainingTime = 60;
let correctAnswers;
let initialX = 0;
let initialY = 0;
let gameActive;
let players = [];
let isAnimating = false;
let lastSavedName;
let isMedium = false;

function playBackgroundMusic() {
  if(gameActive) {
    backgroundMusic.play();
  }
}

function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

function playHitSound() {
  hitSound.play();
}

function playMissSound() {
  missSound.play();
}

function playStartSound() {
  startSound.play();
}

function playEndSound() {
  endSound.play();
}

//запуск таймера
function startTimer() {
  playBackgroundMusic();
    const timeDisplay = document.getElementById('time-display');
  
    timer = setInterval(() => {
      remainingTime--;
      const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
      const seconds = (remainingTime % 60).toString().padStart(2, '0');
  
      timeDisplay.textContent = `Remaining time: ${minutes}:${seconds}`;
  
      if (remainingTime <= 0) {
        playEndSound();
        clearInterval(timer);
        timeDisplay.textContent = 'Time is over!';
        stopGame();
      }
    }, 1000);
  }

// перемешивание цифр
function randomizeBalls() {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      const items = array;
      return items;
    }

// Функция для запуска анимации перемещения к месту клика
function animateToClick(mouseX, mouseY) {

  if(isAnimating){
    return;
  }
  isAnimating = true;
    const ballRect = targetBall.getBoundingClientRect();
    const startX = ballRect.left + window.pageXOffset;
    const startY = ballRect.top + window.pageYOffset;

    const distanceX = mouseX - startX;
    const distanceY = mouseY - startY;
    const duration = 500;
    let startTimestamp;
  
    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
  
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOut(progress); 
  
      const newX = startX + distanceX * easeProgress;
      const newY = startY + distanceY * easeProgress;
  
      targetBall.style.position = 'absolute';
      targetBall.style.left = `${newX - (ballRect.width / 2)}px`;
      targetBall.style.top = `${newY - (ballRect.height / 2)}px`;
  
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // возврат мяча на место после анимации
        targetBall.style.left = `${initialX}px`;
        targetBall.style.top = `${initialY}px`;
        isAnimating = false;
      }
    }
  
    function easeOut(t) {
      return t * (2 - t);
    }
  
    // Запуск анимации
    window.requestAnimationFrame(step);
  }

//начало игры
function startGame(balls) {
  getRandomBall(array);
  startTimer();
  playStartSound();
  start.disabled = true;
  const ballContainer = document.querySelector('.ball-container');
  ballContainer.innerHTML = '';

    balls.forEach(ball => {
      const ballItem = document.createElement('div');
      ballItem.classList.add('ball')
      ballItem.setAttribute('data-value', ball);
      ballItem.textContent = ballItem.dataset.value;
      ballContainer.appendChild(ballItem);

    });
    const triedBalls = document.querySelectorAll('.ball');

    //условие проверки клика по мячу
    triedBalls.forEach(triedBall => {

      //для усложненной игры
      if(isMedium) {
        triedBall.style.opacity = '0';
        triedBall.classList.add('disabled');
        if(triedBall.dataset.value === targetBall.textContent) {
          triedBall.style.opacity = '1';
          triedBall.classList.remove('disabled');
        }
        setInterval(() => {
        if(triedBall.dataset.value === targetBall.textContent) {
          triedBall.style.opacity = '1';
          triedBall.classList.remove('disabled');
        }
      }, 500);
      }

      triedBall.addEventListener('click', (event) => {
        playHitSound();
      if(!gameActive) return;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        if(triedBall.dataset.value === targetBall.textContent) {
          correctAnswers = correctAnswers + 1;
          correctChoose.textContent = `Score: ${correctAnswers}`;
          const ballRect = targetBall.getBoundingClientRect();
          initialX = ballRect.left + window.pageXOffset;
          initialY = ballRect.top + window.pageYOffset;

          // Запуск анимации к месту клика
          animateToClick(mouseX, mouseY);
          setTimeout(() => {
            targetBall.style.display = 'none'
            triedBall.textContent = '';
            triedBall.style.backgroundSize = 'cover';
          }, 500);
          setTimeout(() => {
            getRandomBall(array);
          }, 800)
        } else {
          playMissSound();
          correctAnswers = correctAnswers - 1;
          correctChoose.textContent = `Score: ${correctAnswers}`;
          triedBall.textContent = triedBall.dataset.value;
          triedBall.style.backgroundSize = '';
          }
      })
    })
}

//стоп игры
function stopGame() {
  pauseBackgroundMusic();
  getLastSavedName();
    start.disabled = false;
    gameActive = false;
    start.textContent = 'Start New Game';
    targetBall.style.display = 'none';
    remainingTime = 60;
    countdownDisplay.textContent = '00:03';
    
    const playerData = JSON.parse(localStorage.getItem('players'));

    const currentPlayerName = playerData.playerName;
    if(playerData[currentPlayerName]) {
      if(playerData[currentPlayerName].score < correctAnswers) {
        playerData[currentPlayerName].score = correctAnswers;
      }
    } else {
      playerData[currentPlayerName] = {
        score: correctAnswers
      };
    }
      localStorage.setItem('players', JSON.stringify(playerData));
      updateLeaderboard();

    Swal.fire ({
      icon: 'info',
      iconColor: 'red',
      confirmButtonColor: 'blue',
      title: 'Time is over!',
      text: `Your score:  ${correctAnswers}.`,
      allowOutsideClick: false,
    })
    document.addEventListener('click', (event) => {
        if (!gameActive) return;
    });
}

function getRandomBall(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    targetBall.textContent = array[randomIndex];
    targetBall.style.display = 'flex';
    targetBall.style.animation = '';
    targetBall.style.animation = 'slideIn 1s ease-out';
    targetBall.addEventListener('animationend', () => {
      targetBall.style.animation = '';
  });
  }

//таймер перед стартом игры
function startCountdown(items) {
  countdownSeconds = 3;
  const intervalId = setInterval(() => {
      countdownSeconds--;
      if (countdownSeconds < 0) {
          clearInterval(intervalId);
          startGame(items);
          modal.style.display = 'none';
          return;
      }
      const minutes = Math.floor(countdownSeconds / 60).toString().padStart(2, '0');
      const seconds = (countdownSeconds % 60).toString().padStart(2, '0');
      countdownDisplay.textContent = `${minutes}:${seconds}`;
  }, 1000);
}


//получение имени последнего игравшего
function getLastSavedName() {
  const playerData = JSON.parse(localStorage.getItem('players'));
  if (playerData && playerData.playerName) {
     lastSavedName = playerData.playerName;
  } else lastSavedName = '';
}


start.addEventListener('click', () => {
  getLastSavedName();
  start.style.animation = 'none';
  const items = randomizeBalls();
  gameActive = true;
  correctAnswers = 0;
  correctChoose.textContent = `Score: ${correctAnswers}`;

  //запрос имени игрока
  Swal.fire({
    title: 'Enter your name',
    showCancelButton: true,
    confirmButtonText: 'Play',
    confirmButtonColor: 'blue',
    cancelButtonColor: 'red',
    input: 'text',
    inputValue: `${lastSavedName}`,
    inputValidator: (value) => {
      return !value && 'You need to enter your name!'
    },
    footer: '<a href="#" onclick = "howToPlayEng()">Read How to play the game :)</a>',
  }).then((result) => {
    if (result.isConfirmed) {
      playerName = result.value;
      const playerData = JSON.parse(localStorage.getItem('players')) || {};
      playerData.playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1).toLowerCase();
      localStorage.setItem('players', JSON.stringify(playerData));
      modal.style.display = 'flex';
       startCountdown(items);
     } else {
       gameActive = false;
      start.disabled = false;
    }
  })
})

mediumLevel.addEventListener('click', () => {
  if(isMedium) {
    isMedium = false;
    mediumLevel.textContent = 'Level: easy';
  } else {
    isMedium = true;
    mediumLevel.textContent = 'Level: medium';
  }
})

//правило игры
const howToPlayEng = () => {
  Swal.fire({
    icon: 'question',
    iconColor: 'red',
    confirmButtonColor: 'blue',
    title: 'How to play',
    html: `This game is designed to enhance your memory.</br>
    </br>
    Within a set time, you will be presented with various balls numbered.</br>
    Your task is to memorize their positions on the goal and click on the corresponding balls.</br>
    </br>
    Each correct hit earns you 1 point, while each incorrect one deducts 1 point.</br>
    </br>
    To change level, click on the <strong>"Level: easy"</strong>.</br>
    </br>
    Play and improve your memory.</br>
    These rules encapsulate the essence of the game, encouraging you to enhance your memory skills through engaging gameplay.</br>
    </br>
    <a href="#" onclick="howToPlayRu()">На русском</a>`,
  })
}

const howToPlayRu = () => {
  Swal.fire({
    icon: 'question',
    iconColor: 'red',
    confirmButtonColor: 'blue',
    title: 'Как играть',
    html: `Данная игра призвана развивать вашу память.</br>
    </br>
    В течение заданного времени вам предложат различные мячи с номерами.</br>
    Попадите мячом в нужную мишень.</br>
    После успешного попадания мишень исчезает, все мишени нужно запоминать и держать в голове.</br>
    </br>
    За каждое правильное попадание вы зарабатываете 1 очко, за неправильное — теряете 1 очко.</br>
    </br>
    Меняйте уровень сложности кликнув по <strong>"Level: easy"</strong>.</br>
    </br>
    Оттачивайте свои навыки и побеждайте в этой игре, развивая свою память.</br>
    </br>
    <a href="#" onclick="howToPlayEng()">English</a>`,
  })
}

about.addEventListener('click', () => {
  howToPlayEng();
});

function openModal() {
  downButton.style.display = 'none';
  upButton.style.display = 'block';
  tbody.style.display = 'block';
  overlay.style.display = 'block';
}

function closeModal() {
  downButton.style.display = 'block';
  upButton.style.display = 'none';
  tbody.style.display = 'none';
  overlay.style.display = 'none';
}

downButton.addEventListener('click', () => {
  openModal();
 }); 

upButton.addEventListener('click', () => {
  closeModal();
})

overlay.addEventListener('click', () => {
  closeModal();
})


//вывод лучших результатов в таблицу
function updateLeaderboard() {
  tbody.innerHTML = '';
  const playerScoreData = JSON.parse(localStorage.getItem('players'));
  if(playerScoreData) {
    const sortedPlayers = Object.entries(playerScoreData)
    .filter(([key, value]) => value.score)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 10);
  
    sortedPlayers.forEach(([playerName, player]) => {
      const row = tbody.insertRow();
      const nameCell = row.insertCell(0);
      const scoreCell = row.insertCell(1);
      nameCell.textContent = playerName;
      scoreCell.textContent = player.score;
    })
  }
}

updateLeaderboard();

//самооценка
console.log (
  '%cСамостоятельная оценка:\n', 'font-weight: bold; font-size: 15px',
  '\n',
  '[\u2713] Верстка  +10\n',
  '   [\u2713] реализован интерфейс игры +5\n',
  '   [\u2713] в футере приложения есть ссылка на гитхаб автора приложения, год\n        создания приложения, логотип курса со ссылкой на курс +5\n',
  '[\u2713] Логика игры. Ходы, перемещения фигур, другие действия игрока подчиняются\n     определённым свойственным игре правилам +10\n',
  '[\u2713] Реализовано завершение игры при достижении игровой цели +10\n',
  '[\u2713] По окончанию игры выводится её результат, например, количество ходов,\n     время игры, набранные баллы, выигрыш или поражение и т.д +10\n',
  '[\u2713] Результаты последних 10 игр сохраняются в local storage. Есть таблица\n     рекордов, в которой сохраняются результаты предыдущих 10 игр +10\n',
  '[\u2713] Анимации или звуки, или настройки игры. Баллы начисляются за любой из\n     перечисленных пунктов +10\n',
  '[\u2713] Очень высокое качество оформления приложения и/или дополнительный не\n     предусмотренный в задании функционал, улучшающий качество приложения\n     +10\n',
  '   [\u2713] высокое качество оформления приложения предполагает собственное\n        оригинальное оформление равное или отличающееся в лучшую сторону\n        по сравнению с демо\n',
  '\n',

  'Баллы: 60/60'
)
