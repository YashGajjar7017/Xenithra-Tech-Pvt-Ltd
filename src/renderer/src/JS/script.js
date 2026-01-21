// -----------------Gelolocation--------------------

setTimeout(() => {
  function getLocation() {
    try {
      navigator.geolocation.getCurrentPosition(showPosition)
    } catch {
      x.innerHTML = err
    }
  }

  function showPosition(position) {
    console.log(
      'Latitude: ' + position.coords.latitude + '\nLongitude: ' + position.coords.longitude
    )
  }
  getLocation() // call the geolcation
}, 6000)

// -----------toggle class Maintenance-break timer------------------
function myTimer() {
  // -timer code start
  const countToDate = new Date().setHours(new Date().getHours() + 24)
  let previousTimeBetweenDates

  setInterval(() => {
    const currentDate = new Date()
    const timeBetweenDates = Math.ceil((countToDate - currentDate) / 1000)
    flipAllCards(timeBetweenDates)

    previousTimeBetweenDates = timeBetweenDates
  }, 250)

  function flipAllCards(time) {
    const seconds = time % 60
    const minutes = Math.floor(time / 60) % 60
    const hours = Math.floor(time / 3600)

    flip(document.querySelector('[data-hours-tens]'), Math.floor(hours / 10))
    flip(document.querySelector('[data-hours-ones]'), hours % 10)
    flip(document.querySelector('[data-minutes-tens]'), Math.floor(minutes / 10))
    flip(document.querySelector('[data-minutes-ones]'), minutes % 10)
    flip(document.querySelector('[data-seconds-tens]'), Math.floor(seconds / 10))
    flip(document.querySelector('[data-seconds-ones]'), seconds % 10)
  }

  function flip(flipCard, newNumber) {
    const topHalf = flipCard.querySelector('.top')
    const startNumber = parseInt(topHalf.textContent)
    if (newNumber === startNumber) return

    const bottomHalf = flipCard.querySelector('.bottom')
    const topFlip = document.createElement('div')
    topFlip.classList.add('top-flip')
    const bottomFlip = document.createElement('div')
    bottomFlip.classList.add('bottom-flip')

    top.textContent = startNumber
    bottomHalf.textContent = startNumber
    topFlip.textContent = startNumber
    bottomFlip.textContent = newNumber

    topFlip.addEventListener('animationstart', (e) => {
      topHalf.textContent = newNumber
    })
    topFlip.addEventListener('animationend', (e) => {
      topFlip.remove()
    })
    bottomFlip.addEventListener('animationend', (e) => {
      bottomHalf.textContent = newNumber
      bottomFlip.remove()
    })
    flipCard.append(topFlip, bottomFlip)
  }
  // -timer code end
}

// ----------------maintence Break- callback-------------
function Maintenance(callback) {
  const MaintenanceData = `
    <div class="bg-image"></div>
            <div class="bg-text">
                <!-- <h2>Blurred Background</h2> -->
                <h1 style="font-size:40px">Server is on Maintenance break!</h1>
                <p>Sorry! Our servers needs Maintenance break immediately.. So,come after 15 to 20 Minutes</p><br>
    
                <!-- Timer Code-start -->
                <div class="containerTimer">
                    <div class="container-segment">
                        <div class="segment-title">Hours</div>
                        <div class="segment">
                            <div class="flip-card" data-hours-tens>
                                <div class="top">2</div>
                                <div class="bottom">2</div>
                            </div>
                            <div class="flip-card" data-hours-ones>
                                <div class="top">4</div>
                                <div class="bottom">4</div>
                            </div>
                        </div>
                    </div>
                    <div class="container-segment">
                        <div class="segment-title">Minutes</div>
                        <div class="segment">
                            <div class="flip-card" data-minutes-tens>
                                <div class="top">0</div>
                                <div class="bottom">0</div>
                            </div>
                            <div class="flip-card" data-minutes-ones>
                                <div class="top">0</div>
                                <div class="bottom">0</div>
                            </div>
                        </div>
                    </div>
                    <div class="container-segment">
                        <div class="segment-title">Seconds</div>
                        <div class="segment">
                            <div class="flip-card" data-seconds-tens>
                                <div class="top">0</div>
                                <div class="bottom">0</div>
                            </div>
                            <div class="flip-card" data-seconds-ones>
                                <div class="top">0</div>
                                <div class="bottom">0</div>
                            </div>
                        </div>
                    </div>
                </div><br>
                <!-- Timer Code-end -->
    
                <button id="turnOff" style="padding: 10px;">Turn Off</button>
                <button style="padding: 10px;">Learn more</button>
                <button style="padding: 10px;">Templates</button>
            </div>`

  let main1 = document.getElementById('Maintenance')
  main1.innerHTML += MaintenanceData
}

// ----------------------maintaince brake-----------------
$(document).ready(function () {
  $('.Maintenance').hide()
  let maintainceToken = 0

  $('#maintaince').click(function () {
    let code = prompt('PLEASE ENTER THE SERVER TOKEN:')

    if (code === 'yashacker') {
      maintainceToken++
      sessionStorage.setItem('token_true', 'THENDKFNVSJMDNFIIJDFIMKZDFJIXDFHASUHBBSDHUD')
      // toggale class
      if (maintainceToken === 1 && sessionStorage.getItem('token_true')) {
        ;($('body').addClass('adder'), 1000)
        $('.Maintenance').show()
        if (sessionStorage.getItem('token_true')) {
          sessionStorage.removeItem('token_true')
          sessionStorage.setItem('token_false', 'YIEURNSDFHAJKRTHUISRTNALERTKMAKSRLQWOIREKW')
        } else {
          sessionStorage.getItem('token_false')
        }
      } else {
        alert('Please try again')
      }
    } else {
      maintainceToken = 0
    }
    // $('.home,.close').fadeTo(1000,0.4);
    // $('.home,.close').css("opacity", "0.5");
  })

  // Maintaince Off
  // let tokenOff = document.getElementById('turnOff')
  // tokenOff.addEventListener('click', function () {
  //     // token_true
  //     if (sessionStorage.getItem('token_true')) {
  //         sessionStorage.getItem('token_false');
  //     } else {
  //         alert("ckeck the sessionStorage : token_true");
  //     }

  //     // token_false
  //     if (sessionStorage.getItem('token_false')) {
  //         $('.home,.close').removeClass('backup'), 9000;
  //         $('.Maintenance').hide();
  //     } else {
  //         console.log('data not found!')
  //     }
  // });

  // $('.mainbreak').dblclick(function () {
  //     $('.Maintenance').hide();
  // });

  // $('a[class="mainbreak"]').attr('disabled', true);  ->Set attribute to a class vai jqueary
})
