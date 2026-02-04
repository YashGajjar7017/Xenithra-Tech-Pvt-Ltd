import '../css/404.css'
import '../css/bootstrap/css/bootstrap.min.css'
import '../css/boxicons/css/boxicons.min.css'

const NotFoundPage = () => {
  return (
    <div className="bg-purple">
      <div className="stars">
        <div className="custom-navbar">
          <div className="brand-logo">
            {/* <img src="http://salehriaz.com/404Page/img/logo.svg" width="80px" /> */}
            <h3 style={{ color: 'white', fontSize: '20px' }}>Human Error</h3>
          </div>
          <div className="navbar-links">
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/users">About</a>
              </li>
              <li>
                <a href="/features">Features</a>
              </li>
              <li>
                <a href="/" className="btn-request">
                  Human Error
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="central-body">
          <img
            className="image-404"
            src="http://salehriaz.com/404Page/img/404.svg"
            width="300px"
            alt="404"
          />
          <a href="/" className="btn-go-home btn btn-primary" target="_blank" rel="noreferrer">
            GO BACK HOME
          </a>
        </div>

        <div className="objects">
          <img
            className="object_rocket"
            src="http://salehriaz.com/404Page/img/rocket.svg"
            width="40px"
            alt="Rocket"
          />
          <div className="earth-moon">
            <img
              className="object_earth"
              src="http://salehriaz.com/404Page/img/earth.svg"
              width="100px"
              alt="Earth"
            />
            <img
              className="object_moon"
              src="http://salehriaz.com/404Page/img/moon.svg"
              width="80px"
              alt="Moon"
            />
          </div>
          <div className="box_astronaut">
            <img
              className="object_astronaut"
              src="http://salehriaz.com/404Page/img/astronaut.svg"
              width="140px"
              alt="Astronaut"
            />
          </div>
        </div>

        <div className="glowing_stars">
          <div className="star" />
          <div className="star" />
          <div className="star" />
          <div className="star" />
          <div className="star" />
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
