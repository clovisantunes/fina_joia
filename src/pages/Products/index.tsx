import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import styles from './styles.module.scss';
import { addToCart } from '../../components/UI/Cart';

type Categoria = 'aneis' | 'brincos' | 'colares' | 'kits-revenda' | 'pulseiras';

interface Produto {
  id: string;
  title: string;
  category: Categoria;
  price: number;
  pixPrice: string;
  description: string;
  imageUrls: string[];
  stock: number;
  featured: boolean;
  createdAt: {
    day: number;
    month: number;
    year: number;
  };
}

export default function Produtos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [categoriaAtual, setCategoriaAtual] = useState<Categoria>('aneis');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = location.hash.substring(1);
    const categoriasValidas: Categoria[] = ['aneis', 'brincos', 'colares', 'kits-revenda', 'pulseiras'];
    
    if (hash && categoriasValidas.includes(hash as Categoria)) {
      setCategoriaAtual(hash as Categoria);
    }
  }, [location]);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const produtosRef = collection(db, 'products');
        const q = query(produtosRef, where('category', '==', categoriaAtual));
        
        const querySnapshot = await getDocs(q);
        const produtosData: Produto[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          produtosData.push({
            id: doc.id,
            title: data.title || '',
            category: data.category || 'aneis',
            price: data.price || 0,
            pixPrice: data.pixPrice || '0',
            description: data.description || '',
            imageUrls: data.imageUrls || [],
            stock: data.stock || 0,
            featured: data.featured || false,
            createdAt: data.createdAt || { day: 0, month: 0, year: 0 }
          });
        });
        
        setProdutos(produtosData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Erro ao carregar produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProdutos();
  }, [categoriaAtual]);

  const getTituloCategoria = (categoria: Categoria): string => {
    const titulos = {
      'aneis': 'Anéis',
      'brincos': 'Brincos',
      'colares': 'Colares',
      'kits-revenda': "Kit's Revenda",
      'pulseiras': 'Pulseiras'
    };
    return titulos[categoria];
  };

  const handleComprar = (produto: Produto) => {
    addToCart({
      id: produto.id,
      title: produto.title,
      price: produto.price,
      pixPrice: parseFloat(produto.pixPrice),
      image: produto.imageUrls[0] || ''
    });
    navigate('/carrinho');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>
            {getTituloCategoria(categoriaAtual)}
          </h1>
        </div>
        <div className={styles.loadingGrid}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.productCardSkeleton}>
              <div className={styles.imageSkeleton} />
              <div className={styles.contentSkeleton}>
                <div className={styles.titleSkeleton} />
                <div className={styles.priceSkeleton} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>
            {getTituloCategoria(categoriaAtual)}
          </h1>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>
          {getTituloCategoria(categoriaAtual)}
        </h1>
      </div>

      {produtos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>😕</div>
          <p className={styles.emptyMessage}>Nenhum produto encontrado nesta categoria.</p>
          <button 
            className={styles.emptyAction}
            onClick={() => navigate('/')}
          >
            Voltar à página inicial
          </button>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {produtos.map(produto => (
            <div key={produto.id} className={styles.productCard}>
              <div className={styles.cardInner}>
                <div className={styles.productImageContainer}>
                  {produto.imageUrls.length > 0 ? (
                    <img
                      src={produto.imageUrls[0]}
                      alt={produto.title}
                      className={styles.productImage}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>Sem imagem</div>
                  )}
                  
                  <div className={styles.imageOverlay}>
                    <button 
                      className={styles.quickViewButton}
                      onClick={() => navigate(`/produto/${produto.id}`)}
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{produto.title}</h3>
                  
                  <div className={styles.pricing}>
                    <div className={styles.regularPrice}>
                      <span className={styles.priceLabel}>Preço:</span>
                      <span className={styles.priceValue}>
                        R$ {produto.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    {produto.pixPrice && (
                      <div className={styles.pixPrice}>
                        <span className={styles.priceLabel}>No PIX:</span>
                        <span className={styles.priceValue}>
                          R$ {parseFloat(produto.pixPrice).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={styles.detailsButton}
                      onClick={() => navigate(`/produto/${produto.id}`)}
                    >
                      Detalhes
                    </button>
                    <button
                      className={styles.buyButton}
                      onClick={() => handleComprar(produto)}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}