import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase'; 
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import { addToCart } from '../UI/Cart';
import { FaFire, FaShoppingCart, FaEye } from 'react-icons/fa';

type Product = {
  id: string;
  title: string;
  sold: number;
  pixPrice: number;
  price: number;
  imageUrls: string[];
  featured?: boolean;
  createdAt?: {
    day: number;
    month: number;
    year: number;
  };
};

type ItemsProps = {
  name: string;
};

const ensureNumber = (value: any, defaultValue = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export default function MoreSells({ name }: ItemsProps) {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          orderBy('sold', 'desc'),
          limit(8)
        );
        
        const querySnapshot = await getDocs(q);
        const products: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          products.push({
            id: doc.id,
            title: data.title || 'Produto sem nome',
            sold: ensureNumber(data.sold),
            pixPrice: ensureNumber(data.pixPrice),
            price: ensureNumber(data.price),
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
            featured: data.featured || false,
            createdAt: data.createdAt || {
              day: new Date().getDate(),
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear()
            }
          });
        });

        setBestSellers(products);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar mais vendidos:', err);
        setError('Erro ao carregar os produtos mais vendidos');
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const formatPrice = (price: number | undefined): string => {
    const value = ensureNumber(price);
    return value.toFixed(2).replace('.', ',');
  };

  const formatDate = (date: { day: number, month: number, year: number } | undefined): string => {
    if (!date) return 'Data não disponível';
    return `${date.day.toString().padStart(2, '0')}/${date.month.toString().padStart(2, '0')}/${date.year}`;
  };

  const handleBuyNow = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      pixPrice: product.pixPrice,
      image: product.imageUrls[0] || ''
    });
    navigate('/carrinho');
  };

  const handleQuickView = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  if (loading) {
    return (
      <section className={styles.moreSells} id={name}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Destaques</span>
          <h2 className={styles.sectionTitle}>Os Mais Vendidos</h2>
          <p className={styles.sectionSubtitle}>Carregando nossas joias mais cobiçadas...</p>
        </div>
        <div className={styles.loadingGrid}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.productCardSkeleton}>
              <div className={styles.imageSkeleton}></div>
              <div className={styles.contentSkeleton}>
                <div className={styles.titleSkeleton}></div>
                <div className={styles.priceSkeleton}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.moreSells} id={name}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Destaques</span>
          <h2 className={styles.sectionTitle}>Os Mais Vendidos</h2>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.moreSells} id={name}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Destaques</span>
        <h2 className={styles.sectionTitle}>Os Mais Vendidos</h2>
        <p className={styles.sectionSubtitle}>As joias mais desejadas pelos nossos clientes</p>
      </div>

      <div className={styles.productsGrid}>
        {bestSellers.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.cardInner}>
              <div className={styles.productImageContainer}>
                {product.imageUrls.length > 0 ? (
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.title}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>Sem imagem</span>
                  </div>
                )}
                
                <div className={styles.imageOverlay}>
                  <button 
                    className={styles.quickViewButton}
                    onClick={() => handleQuickView(product.id)}
                  >
                    <FaEye /> Visualizar
                  </button>
                </div>
                
                {product.featured && (
                  <div className={styles.featuredBadge}>
                    <span>Destaque</span>
                  </div>
                )}
                
                <div className={styles.topSellerBadge}>
                  <FaFire /> Mais Vendido
                </div>
              </div>
              
              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.title}</h3>
                
                <div className={styles.productStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Vendas:</span>
                    <span className={styles.statValue}>
                      <FaFire /> {product.sold}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Adicionado:</span>
                    <span className={styles.statValue}>
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.pricing}>
                  <div className={styles.pixPrice}>
                    <span className={styles.priceLabel}>PIX:</span>
                    <span className={styles.priceValue}>
                      R$ {formatPrice(product.pixPrice)}
                    </span>
                  </div>
                  <div className={styles.installmentPrice}>
                    <span className={styles.priceLabel}>Ou no debito/credito:</span>
                    <span className={styles.priceValue}>
                      R$ {(product.price / 12).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                
                <button 
                  className={styles.buyButton}
                  onClick={() => handleBuyNow(product)}
                >
                  <FaShoppingCart /> Comprar Agora
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}