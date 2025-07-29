import  { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import logo from '../../../../assets/logo.png';

export default function PageLoader() {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3500);

    return () => clearTimeout(exitTimer);
  }, []);

  return (
    <div className={`${styles.loaderWrapper} ${isExiting ? styles.exit : ''}`}>
      <div className={styles.pinkAura} />
      
      <div className={styles.pearlParticles}>
        {[...Array(20)].map((_, i) => (
          <div key={`particle-${i}`} className={styles.particle} />
        ))}
      </div>
      
      <div className={styles.pearlBrush} />
      <div className={styles.pearlBrush} />
      
      <div className={styles.lipMark} />
      <div className={styles.lipMark} />
      
      <div className={styles.logoContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
    </div>
  );
}