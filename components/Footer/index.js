import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { FaLinkedin, FaFacebook, FaGithub, FaEnvelope } from 'react-icons/fa';
import { FaXTwitter, FaSun, FaMoon } from 'react-icons/fa6';
import { useTheme } from '../../lib/ThemeContext';

const Footer = () => {
  const { theme, toggleTheme } = useTheme();
  const [clicks, setClicks] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleNameClick = () => {
    const next = clicks + 1;
    setClicks(next);

    if (timer.current) clearTimeout(timer.current);

    if (next >= 5) {
      setShowAdmin(true);
      setClicks(0);
    } else {
      timer.current = setTimeout(() => {
        setClicks(0);
      }, 3000);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <h3 onClick={handleNameClick}>Ahmad Ayman El-Saeid</h3>
        <p>Cairo, Egypt</p>
        <p>
          Phone: <a href="tel:01023874473">01023874473</a> |{' '}
          <a href="tel:01121805624">01121805624</a>
        </p>
        <p>
          Email:{' '}
          <a href="mailto:ahmadaymana99@gmail.com">ahmadaymana99@gmail.com</a>
        </p>
        {showAdmin && (
          <div className={`${styles.adminLink} ${showAdmin ? styles.adminLinkVisible : ''}`}>
            <Link href="/admin/login">Admin</Link>
          </div>
        )}
      </div>
      <div className={styles.links}>
        <a
          href="https://linkedin.com/in/ahmadaymana99"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://github.com/AhmadAymanA99"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>
        <a href="mailto:ahmadaymana99@gmail.com">
          <FaEnvelope />
        </a>
        <a
          href="https://www.facebook.com/AhmadAyman.A99/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook />
        </a>
        <a
          href="https://x.com/A7medAyman99"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaXTwitter />
        </a>
      </div>
      <div className={styles.objective}>
        <p>
          Dedicated and experienced Software Engineer specializing in front-end
          development with a strong background in business management and
          delivery management applications. Proficient in React.js, JavaScript,
          and .NET Core, with a focus on scalability, usability, and
          performance. Seeking opportunities to leverage expertise in a dynamic
          and collaborative environment.
        </p>
      </div>
      <button className={styles.themeToggle} onClick={toggleTheme}>
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
        {theme === 'dark' ? 'Light' : 'Dark'} Mode
      </button>
    </footer>
  );
};

export default Footer;
