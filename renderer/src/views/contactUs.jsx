import 'bootstrap/dist/css/bootstrap.min.css'
import './ContactUs.css'

const ContactUsPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Yash Gajjar_17',
      role: 'Full Stack Developer',
      image: '/images/team/yash.jpg',
      bio: 'Lead developer passionate about creating seamless web experiences and modern UI/UX designs.',
      link: '/projects/snake'
    },
    {
      id: 2,
      name: 'Viral Bha',
      role: 'Backend Architect',
      image: '/images/team/viral.jpg',
      bio: 'Specializes in scalable Node.js architectures and real-time collaboration systems.',
      link: '/services/reminders'
    },
    {
      id: 3,
      name: 'Rahul Patel',
      role: 'Frontend Specialist',
      image: '/images/team/rahul.jpg',
      bio: 'Expert in React, modern CSS frameworks, and responsive design patterns.',
      link: '/about/rahul'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      role: 'DevOps Engineer',
      image: '/images/team/priya.jpg',
      bio: 'Handles deployment pipelines, cloud infrastructure, and system optimization.',
      link: '/services/devops'
    }
  ]

  const renderTeamCard = (member) => (
    <div key={member.id} className="card team-card" style={{ width: '18rem', marginRight: '2%' }}>
      <div className="card-img-container">
        <img
          src={member.image}
          className="card-img-top"
          alt={member.name}
          style={{
            height: '200px',
            objectFit: 'cover',
            borderRadius: '10px 10px 0 0'
          }}
        />
        <div className="role-overlay">
          <span className="role-badge">{member.role}</span>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title">{member.name}</h5>
        <p className="card-text">{member.bio}</p>
        <a href={member.link} className="btn btn-primary w-100">
          View Profile
        </a>
      </div>
    </div>
  )

  return (
    <div className="contact-us-page">
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{
          backgroundImage: 'linear-gradient(to left, #00c6fb 0%, #005bea 100%)',
          boxShadow: '0 2px 10px rgba(0,91,234,0.3)'
        }}
      >
        <div className="container-fluid">
          <a className="navbar-brand fw-bold fs-4" href="/">
            The Byter Machine
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/join">
                  Join with us
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Projects
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="/projects/snake">
                      Snake Game
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/projects/compiler">
                      Node Compiler
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="/portfolio">
                      View All
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" href="#">
                  Classroom
                </a>
              </li>
            </ul>
            <form className="d-flex">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search team/projects..."
              />
              <button className="btn btn-outline-light" type="submit">
                <i className="bx bx-search"></i>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="hero-section text-center py-5"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: '3rem'
        }}
      >
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">Meet Our Team</h1>
          <p className="lead mb-0">The passionate developers behind The Byter Machine</p>
        </div>
      </div>

      {/* Team Cards */}
      <div
        className="container team-grid"
        style={{ display: 'flex', marginTop: '3%', flexWrap: 'wrap', gap: '2%' }}
      >
        {teamMembers.map(renderTeamCard)}
      </div>

      {/* Contact Info Section */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6">
            <div
              className="contact-card p-4 rounded-4 shadow-lg"
              style={{
                background: 'linear-gradient(145deg, #f0f2f5, #ffffff)',
                border: '1px solid rgba(0,123,255,0.1)'
              }}
            >
              <h3 className="mb-4">
                <i className="bx bx-envelope text-primary"></i> Get In Touch
              </h3>
              <form>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="Your Name" />
                </div>
                <div className="mb-3">
                  <input type="email" className="form-control" placeholder="Your Email" />
                </div>
                <div className="mb-3">
                  <textarea className="form-control" rows="4" placeholder="Your Message"></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Send Message
                </button>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="contact-info-card p-4 rounded-4 shadow-lg"
              style={{
                background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
                border: '1px solid rgba(0,123,255,0.1)'
              }}
            >
              <h3 className="mb-4">
                <i className="bx bx-map-pin text-success"></i> Contact Details
              </h3>
              <div className="contact-item mb-3">
                <i className="bx bx-location-plus text-primary"></i>
                <span>Ahmedabad, Gujarat, India</span>
              </div>
              <div className="contact-item mb-3">
                <i className="bx bx-envelope text-info"></i>
                <span>hello@bytermachine.com</span>
              </div>
              <div className="contact-item mb-3">
                <i className="bx bx-phone text-success"></i>
                <span>+91 98765 43210</span>
              </div>
              <div className="social-links mb-3">
                <a href="#" className="social-link mx-2">
                  <i className="bx bxl-github"></i>
                </a>
                <a href="#" className="social-link mx-2">
                  <i className="bx bxl-linkedin"></i>
                </a>
                <a href="#" className="social-link mx-2">
                  <i className="bx bxl-twitter"></i>
                </a>
                <a href="#" className="social-link mx-2">
                  <i className="bx bxl-discord"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUsPage
