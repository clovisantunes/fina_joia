import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaInstagram,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import logo from "../../assets/logo.png";
import styles from "./styles.module.scss";

type Category = {
  id: string;
  name: string;
  slug?: string;
  featured?: boolean;
};

export default function PremiumNavbar() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const calculateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((total: number, item: any) => total + item.quantity, 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCartCount(calculateCartCount());

    const handleStorageChange = () => {
      setCartCount(calculateCartCount());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const querySnapshot = await getDocs(categoriesRef);

        const loadedCategories = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || `Categoria ${doc.id}`,
            slug: data.slug || doc.id,
            featured: data.featured || false,
          };
        });

        setCategories([
          { id: "home", name: "Início", slug: "/", featured: true },
          ...loadedCategories.sort((a, b) => a.name.localeCompare(b.name)),
        ]);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setDefaultCategories();
      } finally {
      }
    };

    const setDefaultCategories = () => {
      setCategories([
        { id: "home", name: "Início", slug: "/", featured: true },
        { id: "aneis", name: "Anéis", slug: "aneis", featured: true },
        { id: "colares", name: "Colares", slug: "colares", featured: true },
        { id: "brincos", name: "Brincos", slug: "brincos", featured: true },
        {
          id: "kits",
          name: "Kits Premium",
          slug: "kits-premium",
          featured: true,
        },
        { id: "ofertas", name: "Ofertas", slug: "ofertas", featured: true },
      ]);
    };

    fetchCategories();
  }, []);

  const getCategoryPath = (category: Category) => {
    if (category.id === "home") return "/";
    return `/produtos#${category.slug || category.id}`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (searchOpen) setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header
      className={`${styles.container} ${scrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.announcementBar}>
        <p>
        Frete GRÁTIS acima de R$300 para cidades selecionadas! Aproveite condições especiais de pagamento.
        </p>
      </div>

      <div className={styles.mainNav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Link to="/">
              <img src={logo} alt="Logo Premium" />
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <ul className={styles.navList}>
              {categories.map((category) => (
                <li key={category.id} className={styles.navItem}>
                  <Link
                    to={getCategoryPath(category)}
                    className={styles.navLink}
                  >
                    {category.name}
                    {category.id === "ofertas" && (
                      <span className={styles.saleBadge}>Promoção</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <button
              className={styles.searchButton}
              onClick={toggleSearch}
              aria-label="Buscar"
            >
              <FaSearch />
            </button>
            <button
              className={styles.cartButton}
              onClick={() => navigate("/carrinho")}
              aria-label="Carrinho"
            >
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className={styles.cartCount}>{cartCount}</span>
              )}
            </button>

            <button
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className={styles.mobileSearch}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Busque por diamantes, ouro, pérolas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </div>
        )}
      </div>

      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        <div className={styles.mobileMenuContent}>
          <ul className={styles.mobileNavList}>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={getCategoryPath(category)}
                  onClick={toggleMobileMenu}
                  className={styles.mobileNavLink}
                >
                  {category.name}
                  {category.id === "ofertas" && (
                    <span className={styles.mobileSaleBadge}>Promoção</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.mobileContact}>
            <a
              href="https://wa.me/5551981434411"
              className={styles.whatsappButton}
            >
              <FaWhatsapp /> Fale conosco
            </a>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Busque por produtos premium..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className={styles.closeSearch}
                onClick={toggleSearch}
              >
                <FaTimes />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
