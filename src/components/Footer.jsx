import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Top Section */}
        <div className="footer-sections">

          {/* Brand */}
          <div className="footer-column">
            <div className="logo-row">
              <div className="logo-mark">🚀</div>
              <h2 className="logo-text">
                Path<span>Wise</span>
              </h2>
            </div>

            <p className="tagline">
              Forging the careers of tomorrow's leaders through expert mentorship,
              data-driven insights, and personalized guidance.
            </p>

            <div className="social-icons">
              <a href="#">𝕏</a>
              <a href="#">in</a>
              <a href="#">yt</a>
              <a href="#">ig</a>
            </div>
          </div>

          {/* Platform */}
          <div className="footer-column">
            <h2>Platform</h2>
            <ul>
              <li><Link to="/careers">Career Paths</Link></li>
              <li><Link to="/counselors">Find Mentors</Link></li>
              <li><Link to="/schedule">Book Session</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-column">
            <h2>Company</h2>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-column">
            <h2>Legal</h2>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2026 PathWise. All rights reserved.</p>
          <p className="sub-text">
            Crafted with 🔥 for ambitious students worldwide.
          </p>
        </div>

      </div>

      {/* CSS inside same file */}
      <style>{`
        .footer {
          background: linear-gradient(90deg, #062e3f, #055772, #0f2027);
          padding: 50px 20px 25px;
          font-family: "Segoe UI", sans-serif;
          color: #eaeaea;
        }

        .footer-container {
          max-width: 1200px;
          margin: auto;
        }

        /* Grid */
        .footer-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 40px;
          margin-bottom: 30px;
        }

        /* Logo */
        .logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .logo-mark {
          background: linear-gradient(135deg, #4caf50, #00c6ff);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
        }

        .logo-text span {
          color: #4caf50;
        }

        .tagline {
          font-size: 14px;
          line-height: 1.6;
          margin: 10px 0 15px;
          color: #d0d0d0;
        }

        /* Columns */
        .footer-column h2 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          border-left: 3px solid #4caf50;
          padding-left: 8px;
        }

        .footer-column ul {
          list-style: none;
          padding: 0;
        }

        .footer-column ul li {
          margin-bottom: 8px;
        }

        .footer-column ul li a {
          text-decoration: none;
          color: #f5f5f5;
          font-size: 14px;
          transition: 0.3s;
        }

        .footer-column ul li a:hover {
          color: #4cafef;
          padding-left: 4px;
        }

        /* Social */
        .social-icons {
          margin-top: 10px;
        }

        .social-icons a {
          margin-right: 10px;
          font-size: 18px;
          color: #e0e0e0;
          transition: 0.3s;
        }

        .social-icons a:hover {
          color: #4caf50;
          transform: scale(1.2);
        }

        /* Bottom */
        .footer-bottom {
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 15px;
          font-size: 13px;
        }

        .sub-text {
          font-size: 12px;
          color: #c8e6c9;
          font-style: italic;
          margin-top: 5px;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .footer {
            padding: 40px 15px;
          }
        }
      `}</style>
    </footer>
  );
}