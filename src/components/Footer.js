import React from "react";

function Footer(){
    return(
        <footer className="footer bg-dark navbar-dark">
            <h2 className="visually-hidden">Sitemap & information</h2>
            <div className="container-xxl footer-title-content">
                <h3 className="footer-heading">Sign up to our mailing list</h3>
                <div className="row">
                <form className="d-flex col-12 col-md-9 col-lg-7 col-xl-6 col-xxl-5 gap-2 gap-md-3">
                    <label for="inputEmail" className="visually-hidden">Email</label>
                    <input type="email" className="form-control text-bg-dark border-dark" id="inputEmail" placeholder="Enter your email"/>
                    <button type="submit" className="btn btn-secondary btn-inverse text-nowrap">Sign up</button>
                </form>
                </div>
            </div>
            <div className="container-xxl footer-social">
            <h3 className="footer-heading me-md-3">Follow us</h3>
            <ul className="navbar-nav gap-2 flex-row align-self-start">
                <li><a href="#" className="btn btn-icon btn-social btn-twitter btn-inverse"><span className="visually-hidden">Twitter</span></a></li>
                <li><a href="#" className="btn btn-icon btn-social btn-facebook btn-inverse"><span className="visually-hidden">Facebook</span></a></li>
                <li><a href="#" className="btn btn-icon btn-social btn-instagram btn-inverse"><span className="visually-hidden">Instagram</span></a></li>
                <li><a href="#" className="btn btn-icon btn-social btn-whatsapp btn-inverse"><span className="visually-hidden">WhatsApp</span></a></li>
                <li><a href="#" className="btn btn-icon btn-social btn-linkedin btn-inverse"><span className="visually-hidden">LinkedIn</span></a></li>
                <li><a href="#" className="btn btn-icon btn-social btn-youtube btn-inverse"><span className="visually-hidden">YouTube</span></a></li>
            </ul>
            </div>
            </footer>
    );
}
export default Footer;