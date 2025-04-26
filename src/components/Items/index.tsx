import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../UI/Cart';
import { FaShoppingCart, FaEye, FaStar } from 'react-icons/fa';

type Product = {
  id: string;
  title: string;
  category: string;
  pixPrice: number;
  price: number;
  imageUrls: string[];
  description: string;
  featured: boolean;
  createdAt: {
    day: number;
    month: number;
    year: number;
  };
};

type ItemsProps = {
  name: string;
};

export default function CategoryFilter({ name }: ItemsProps) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const productsQuery = query(productsRef, limit(24));
        const querySnapshot = await getDocs(productsQuery);
        
        const productsData: Product[] = [];
        const categoriesSet = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const product = {
            id: doc.id,
            title: data.title,
            category: data.category,
            pixPrice: Number(data.pixPrice),
            price: data.price,
            imageUrls: data.imageUrls || [],
            description: data.description,
            featured: data.featured || false,
            createdAt: data.createdAt || {
              day: new Date().getDate(),
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear()
            }
          };
          productsData.push(product);
          categoriesSet.add(data.category);
        });

        setProducts(productsData);
        setCategories(['todos', ...Array.from(categoriesSet).sort()]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace('.', ',');
  };

  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(product => product.category === activeCategory);

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

  if (loading) {
    return (
      <section className={styles.itemsContainer} id={name}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Coleção</span>
          <h2 className={styles.sectionTitle}>Nossas Joias</h2>
          <p className={styles.sectionSubtitle}>Carregando nossa coleção exclusiva...</p>
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
    <section className={styles.itemsContainer} id={name}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Coleção</span>
        <h2 className={styles.sectionTitle}>Nossas Joias</h2>
        <p className={styles.sectionSubtitle}>Descubra peças exclusivas em nossa coleção</p>
      </div>

      <div className={styles.categoryTabs}>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.tabButton} ${activeCategory === category ? styles.active : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category === 'todos' ? 'Todos os Itens' : category}
          </button>
        ))}
      </div>

      <div className={styles.itemsGrid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className={styles.itemCard}>
              <div className={styles.cardInner}>
                <div className={styles.itemImageContainer}>
                  {product.imageUrls.length > 0 ? (
                    <img 
                      src={product.imageUrls[0]} 
                      alt={product.title}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>Sem imagem</span>
                    </div>
                  )}
                  
                  <div className={styles.imageOverlay}>
                    <button 
                      className={styles.quickViewButton}
                      onClick={() => navigate(`/produto/${product.id}`)}
                    >
                      <FaEye /> Visualizar
                    </button>
                  </div>
                  
                  {product.featured && (
                    <div className={styles.featuredBadge}>
                      <FaStar /> Destaque
                    </div>
                  )}
                </div>
                
                <div className={styles.itemInfo}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  
                  {product.description && (
                    <p className={styles.itemDescription}>{product.description}</p>
                  )}
                  
                  <div className={styles.priceContainer}>
                    <div className={styles.pixPrice}>
                      <span className={styles.priceLabel}>PIX:</span>
                      <span className={styles.priceValue}>
                        R$ {formatPrice(product.pixPrice)}
                      </span>
                    </div>
                    <div className={styles.installmentPrice}>
                      <span className={styles.priceLabel}>Ou no debito/credito:</span>
                      <span className={styles.priceValue}>
                        R$ {(product.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
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
                      <FaShoppingCart /> Comprar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noProducts}>
            <p>Nenhum produto encontrado nesta categoria</p>
            <button 
              className={styles.exploreButton}
              onClick={() => setActiveCategory('todos')}
            >
              Ver Todos os Produtos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}