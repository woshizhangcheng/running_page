import { Link } from 'react-router-dom';
import { useState } from 'react';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { useTheme, Theme } from '@/hooks/useTheme';
import styles from './style.module.css';

const Header = () => {
  const { logo, siteUrl, navLinks } = useSiteMetadata();
  const { setTheme } = useTheme();
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  const icons = [
    {
      id: 'dark',
      svg: (
        <svg
          width="22"
          height="23"
          viewBox="0 0 22 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.7519 15.0137C20.597 15.4956 19.3296 15.7617 18 15.7617C12.6152 15.7617 8.25 11.3965 8.25 6.01171C8.25 4.68211 8.51614 3.41468 8.99806 2.25977C5.47566 3.72957 3 7.20653 3 11.2617C3 16.6465 7.36522 21.0117 12.75 21.0117C16.8052 21.0117 20.2821 18.536 21.7519 15.0137Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'light',
      svg: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3.00464V5.25464M18.364 5.64068L16.773 7.23167M21 12.0046H18.75M18.364 18.3686L16.773 16.7776M12 18.7546V21.0046M7.22703 16.7776L5.63604 18.3686M5.25 12.0046H3M7.22703 7.23167L5.63604 5.64068M15.75 12.0046C15.75 14.0757 14.0711 15.7546 12 15.7546C9.92893 15.7546 8.25 14.0757 8.25 12.0046C8.25 9.93357 9.92893 8.25464 12 8.25464C14.0711 8.25464 15.75 9.93357 15.75 12.0046Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const handleToggle = () => {
    const nextIndex = (currentIconIndex + 1) % icons.length;
    setCurrentIconIndex(nextIndex);
    setTheme(icons[nextIndex].id as Theme);
  };

  const currentIcon = icons[currentIconIndex];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a className="text-2xl font-black tracking-tighter uppercase cursor-pointer" href="/">
            <span className="text-white">RUN</span>
            <span className="text-[#E31937]">.LOG</span>
          </a>
          <div className="flex items-center gap-6 text-sm font-bold tracking-wide">
            {navLinks.map((n, i) => (
              <a
                key={i}
                href={n.url}
                className="text-white/70 hover:text-white transition-colors"
              >
                {n.name}
              </a>
            ))}
            <button
              type="button"
              onClick={handleToggle}
              className="text-white/70 hover:text-white transition-colors"
              aria-label={`Switch to ${currentIcon.id} theme`}
              title={`Switch to ${currentIcon.id} theme`}
            >
              {currentIcon.svg}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
