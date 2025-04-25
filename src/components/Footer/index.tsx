import React from 'react';
import { FaInstagram, FaFacebook, FaPinterest, FaWhatsapp, FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import styles from './styles.module.scss';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <img src={logo} alt="Logo da Joalheria" className={styles.footerLogo} />
            <p className={styles.footerAbout}>
            Explorando o encanto das bijuterias, oferecemos peças exclusivas e cheias de estilo para todos os momentos. Nossa missão é proporcionar beleza e elegância a cada cliente, com produtos que refletem qualidade e sofisticação. Navegue por nossas coleções e descubra o acessório perfeito para você ou para presentear alguém especial.
            </p>
            <div className={styles.socialIcons}>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>Links Rápidos</h3>
            <ul className={styles.footerLinks}>
              <li><a href="#">Página Inicial</a></li>
              <li><a href="#novidades">Novidades</a></li>
              <li><a href="#maisvendidos">Mais Vendidos</a></li>
              <li><a href="#colecao">Coleções</a></li>
              <li><a href="#">Contato</a></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
  <h3 className={styles.footerTitle}>Categorias</h3>
  <ul className={styles.footerLinks}>
    <li><Link to="/produtos#aneis">Anéis</Link></li>
    <li><Link to="/produtos#brincos">Brincos</Link></li>
    <li><Link to="/produtos#colares">Colares</Link></li>
    <li><Link to="/produtos#brincos">Brincos</Link></li>
    <li><Link to="/produtos#kits-revenda">Kits Revenda</Link></li>
  </ul>
</div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>Contato</h3>
            <ul className={styles.contactInfo}>
              <li>
                <FaMapMarkerAlt />
                <span>Sapiranga, RS</span>
              </li>
              <li>
                <FaWhatsapp />
                <span>(11) 98888-8888</span>
              </li>
              <li>
                <FaEnvelope />
                <span>contato@belafina.com.br</span>
              </li>
              <li>
                <FaClock />
                <span>Seg-Sex: 10h-19h | Sáb: 10h-16h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerContainer}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Joalheria Luxo. Todos os direitos reservados.
          </p>
          <div className={styles.paymentMethods}>
            <span>Formas de pagamento:</span>
            <div className={styles.paymentIcons}>
              <i className={styles.visa}></i>
              <i className={styles.mastercard}></i>
              <i className={styles.amex}></i>
              <i className={styles.pix}></i>
              <i className={styles.boleto}></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}