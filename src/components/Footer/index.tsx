import {
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaBarcode,
  FaCcVisa,
  FaCcMastercard,
  FaQrcode
} from "react-icons/fa";
import styles from "./styles.module.scss";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>

        <div className={styles.footerColumn}>
          <img 
            src={logo} 
            alt="Belafina Joias - Bijuterias Finas" 
            className={styles.logo} 
            loading="lazy"
          />
          <div className={styles.socialIcons}>
            <a 
              href="https://instagram.com/belafina" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram Belafina"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://wa.me/5551981434411" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="WhatsApp Belafina"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

  
        <div className={styles.footerColumn}>
          <h3 className={styles.columnTitle}>Navegação</h3>
          <ul className={styles.linksList}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/produtos">Catálogo</Link></li>
          </ul>
        </div>


        <div className={styles.footerColumn}>
          <h3 className={styles.columnTitle}>Contato</h3>
          <ul className={styles.contactList}>
            <li>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>Sapiranga, RS</span>
            </li>
            <li>
              <FaWhatsapp aria-hidden="true" />
              <a href="https://wa.me/5551981434411">(51) 98143-4411</a>
            </li>
          
          </ul>
        </div>
      </div>


      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Belafina Joias. Todos direitos reservados.
        </p>

    
        <Link 
          to="/auth" 
          className={styles.secretButton}
          aria-hidden="true"
          tabIndex={-1}
        />

 
        <div className={styles.paymentMethods}>
          <span className={styles.paymentText}>Pagamento:</span>
          <div className={styles.paymentIcons}>
            <FaCcVisa aria-label="Cartão Visa" />
            <FaCcMastercard aria-label="Cartão Mastercard" />
            <FaQrcode aria-label="Pix" />
            <FaBarcode aria-label="Boleto Bancário" />
          </div>
        </div>
      </div>
    </footer>
  );
}