import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../UI/Cart';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  pixPrice: number;
  description: string;
  imageUrls: string[];
  stock: number;
  featured: boolean;
  createdAt: {
    day: number;
    month: number;
    year: number;
  };
};

type NewsProps = {
  name: string;
};

const CustomNextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button 
      className={`${styles.arrow} ${styles.nextArrow}`}
      onClick={onClick}
      aria-label="Próximo"
    >
      <FaArrowRight />
    </button>
  );
};

const CustomPrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button 
      className={`${styles.arrow} ${styles.prevArrow}`}
      onClick={onClick}
      aria-label="Anterior"
    >
      <FaArrowLeft />
    </button>
  );
};

export default function News({ name }: NewsProps) {
  const [newItems, setNewItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          orderBy('createdAt.year', 'desc'),
          orderBy('createdAt.month', 'desc'),
          orderBy('createdAt.day', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        
        const products = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            category: data.category || '',
            price: ensureNumber(data.price),
            pixPrice: ensureNumber(data.pixPrice),
            description: data.description || '',
            imageUrls: data.imageUrls || [],
            stock: ensureNumber(data.stock),
            featured: data.featured || false,
            createdAt: data.createdAt || {
              day: new Date().getDate(),
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear()
            }
          };
        });

        // Ordenar por data e pegar os 5 mais recentes
        const sortedProducts = [...products].sort((a, b) => {
          const dateA = new Date(a.createdAt.year, a.createdAt.month - 1, a.createdAt.day);
          const dateB = new Date(b.createdAt.year, b.createdAt.month - 1, b.createdAt.day);
          return dateB.getTime() - dateA.getTime();
        });

        setNewItems(sortedProducts.slice(0, 8));
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  const ensureNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(4, newItems.length),
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, newItems.length)
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(2, newItems.length)
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false
        }
      }
    ]
  };

  if (loading) {
    return (
      <section className={styles.newsSection} id={name}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Lançamentos Exclusivos</h2>
          <p className={styles.sectionSubtitle}>Carregando nossas novidades...</p>
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

  return (
    <section className={styles.newsSection} id={name}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.sectionTag}>Novidades</span>
          <h2 className={styles.sectionTitle}>Coleção Exclusiva</h2>
        </div>
        <p className={styles.sectionSubtitle}>Descubra nossas peças mais recentes e sofisticadas</p>
      </div>

      {newItems.length > 0 ? (
        <div className={styles.carouselContainer}>
          <Slider {...settings}>
            {newItems.map(product => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.cardInner}>
                  <div className={`${styles.productImage} ${product.featured ? styles.featured : ''}`}>
                    <img 
                      src={product.imageUrls[0] || '/images/placeholder-premium.jpg'} 
                      alt={product.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-premium.jpg';
                      }}
                    />
                    {product.featured && (
                      <div className={styles.featuredBadge}>
                        <span>Destaque</span>
                      </div>
                    )}
                    <div className={styles.imageOverlay}>
                      <button 
                        className={styles.quickView}
                        onClick={() => navigate(`/produto/${product.id}`)}
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <div className={styles.infoHeader}>
                      <h3>{product.title}</h3>
                      <span className={styles.categoryTag}>{product.category}</span>
                    </div>
                    
                    <div className={styles.priceContainer}>
                      <div className={styles.pixPrice}>
                        <span className={styles.priceLabel}>À vista:</span>
                        <span className={styles.priceValue}>
                          R$ {product.pixPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className={styles.pixBadge}>PIX</span>
                      </div>
                      <div className={styles.installmentPrice}>
                        <span className={styles.priceLabel}>Ou no debito/credito:</span>
                        <span className={styles.priceValue}>
                          R$ {(product.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.actions}>
                      <button 
                        className={styles.detailsButton}
                        onClick={() => navigate(`/produto/${product.id}`)}
                      >
                        Detalhes
                      </button>
                      <button 
                        className={styles.buyButton}
                        onClick={() => handleBuyNow(product)}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className={styles.noProducts}>
          <p>Nenhum lançamento disponível no momento</p>
          <button 
            className={styles.exploreButton}
            onClick={() => navigate('/produtos')}
          >
            Explorar Coleção
          </button>
        </div>
      )}
    </section>
  );
}