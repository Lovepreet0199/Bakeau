import { useState } from "react";
import "./Navbar.css";

//Navigation bar for the Bakeau website
export default function Navbar() {

    //Controls whether the mobile navigation menu is open or closed
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="site-header">
            <div className="container-fluid px-4">

                <div className="navbar-content">

                    {/* Bakeau logo */}
                    <a href="/" className="navbar-logo">
                        Bakeau
                    </a>

                    {/* Main navigation */}
                    <nav
                        className={`main-navigation ${isMenuOpen ? "main-navigation--open" : ""
                            }`}
                    >
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#pricing">Pricing</a>

                        {/* These account actions only appear inside the mobile menu */}
                        <a
                            href="/login"
                            className="mobile-nav-action mobile-nav-signin"
                        >
                            Sign In
                        </a>

                        <a
                            href="/register"
                            className="mobile-nav-action mobile-nav-start"
                        >
                            Start Your Bakery
                        </a>
                    </nav>

                    {/* Desktop account actions */}
                    <div className="navbar-actions">
                        <a href="/login" className="navbar-signin">
                            Sign In
                        </a>

                        <a href="/register" className="navbar-start">
                            Start Your Bakery
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="navbar-menu-button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? "×" : "☰"}
                    </button>

                </div>
            </div>
        </header>
    );
}