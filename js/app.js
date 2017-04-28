/**
 * Created by Budimir on 23.04.2017.
 */

'use strict';
let runGame = (function() {
    let pathImg = 'https://kde.link/test/',
        requestUrl = 'https://kde.link/test/get_field_size.php',
        img = ['0.png', '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png'],
        widthItem = 105,
        gameArr = [],
        card1 = '',
        card2 = '',
        score,
        timer,
        DOMElements = {
            wrapper: document.querySelector('.wrapper'),
            btnAgain: document.querySelector('footer button'),
            score: document.querySelector('.score span'),
            timer: document.querySelector('.time span')
        };

    function genGameArr({ width, height }) {
        let quantity = width * height / 2;
        let picId;

        for (let i = 1; i <= quantity; i++) {
            picId = randomize(img.length);
            gameArr.push(img[picId]);
            gameArr.push(img[picId]);
        }
        gameArr = gameArr.sort(() => .5 - Math.random());
    }

    function randomize(max) {
        return Math.floor(Math.random() * max);
    }

    function showField({ width, height }) {
        DOMElements.wrapper.style.width = width * widthItem + 'px';
        let content = '';
        let count = 0;
        for (let i = 1; i <= height; i++) {
            content += `<ul class="flex-container">`;
            for (let j = 1; j <= width; j++) {
                content += `<li class="flex-item"><img src="${pathImg}${gameArr[count]}"></li>`;
                count++;
            }
            content += '</ul>'
        }
        DOMElements.wrapper.innerHTML = content;
    }

    function compareCards(event) {
        let target = event.target;
        if ((target.nodeName !== 'LI') && (target.nodeName !== 'IMG')) {
            return;
        }
        if (target.nodeName === 'LI') {
            target = target.firstChild;
        }

        if ((card1 === event.target) && (!card2)) { 
            showHideCard('hide', card1);
            card1 = '';
            return;
        }

        if (!card1) {
            card1 = target;
            showHideCard('show', card1);
        } else if (!card2) {
            card2 = target;
            showHideCard('show', card2);
            if (card1.attributes.src.value === card2.attributes.src.value) {
                delCardFromGameArr(card1.attributes.src.value);
                setTimeout(function() {
                    showHideCard('hide', card1.parentElement);
                    showHideCard('hide', card2.parentElement);
                    showHideCard('hide', card1);
                    showHideCard('hide', card2);
                    card1 = card2 = '';
                }, 300);
            }
        } else {
            showHideCard('hide', card1);
            showHideCard('hide', card2);
            card2 = '';
            card1 = (event.target.nodeName === 'LI') ? event.target.firstChild : card1 = event.target;
            showHideCard('show', card1);
        }
    }

    function showHideCard(event, target) {
        if (event === 'show') {
            target.style.visibility = 'visible';
        }
        if (event === 'hide') {
            target.style.visibility = 'hidden';
        }
    }

    function delCardFromGameArr(value) {
        if (!value) {
            return;
        }
        let arr = value.split('/');
        let el = arr[arr.length - 1];

        gameArr.splice(gameArr.indexOf(el), 1);
        gameArr.splice(gameArr.indexOf(el), 1);
        if (!gameArr.length) {
            clearInterval(timer);
            showMsg();
        }
    }

    function showMsg() {
        DOMElements.wrapper.innerHTML = `<h2>Победа!</h2>`;
    }
    
    function countScore() {
        let count = 1;
        clearInterval(timer);
        timer = setInterval(function () {
            DOMElements.timer.innerHTML = count++;
            DOMElements.score.innerHTML = score--;
        }, 1000);
    }
    function initListeners() {
        DOMElements.wrapper.addEventListener('click', compareCards);
        DOMElements.btnAgain.addEventListener('click', run);
    }

    function makeRequest (method, url) {
      return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            resolve(xhr.response);
          } else {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          }
        };
        xhr.onerror = function () {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        };
        xhr.send();
      });
    }

    function run () {
        gameArr = [];
        card1 = '';
        card2 = '';
        score = 999;
        makeRequest ('GET', requestUrl)
        .then(function (res) {
            res = JSON.parse(res);
            genGameArr(res);
            showField(res);
            countScore();
            initListeners();
        })
        .catch(function (err) {
            console.error('Error!', err.statusText);
        })
    }


    return { run: () => run() };
})();

runGame.run();
