import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaWhatsapp, FaShare, FaHeart, FaExpand } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import MoreSells from '../../components/MoreSells';
import styles from './styles.module.scss';
import { addToCart } from '../../components/UI/Cart';

// Detalhes fixos que serão aplicados a todos os produtos
const FIXED_DETAILS = [
  "Garantia: 7 dias contra defeitos/manchas",
  "Entrega: Sapiranga, Campo Bom - RS - Mesmo dia da confirmação",
  "Entrega: Novo Hamburgo, Parobé - RS - 1 dia útil",
  "Entrega: Demais Regiões - RS - Validar com o vendedor",
];

interface Product {
  id: string;
  title: string;
  category: string;
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

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [zoomActive, setZoomActive] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('ID do produto não encontrado');
        }

        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          throw new Error('Produto não encontrado');
        }

        const productData = productSnap.data() as Product;
        setProduct({
          ...productData,
          id: productSnap.id
        });

        // Define a primeira imagem como principal
        if (productData.imageUrls?.length > 0) {
          setMainImage(productData.imageUrls[0]);
        }

        setError(null);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuy = () => {
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        pixPrice: parseFloat(product.pixPrice),
        image: product.imageUrls[0]
      });
      navigate('/carrinho');
    }
  };
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        pixPrice: parseFloat(product.pixPrice),
        image: product.imageUrls[0]
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.productDetailContainer}>
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.productDetailContainer}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.productDetailContainer}>
        <p>Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.breadcrumb}>
        <Link to="/">Início</Link> &gt;
        <Link to={`/produtos#${product.category}`}>
          {product.category === 'aneis' ? 'Anéis' : 
           product.category === 'brincos' ? 'Brincos' :
           product.category === 'colares' ? 'Colares' :
           product.category === 'kits-revenda' ? "Kit's Revenda" :
           product.category === 'pulseiras' ? 'Pulseiras' : product.category}
        </Link> &gt;
        <span>{product.title}</span>
      </div>

      <div className={styles.productWrapper}>
        <div className={styles.gallerySection}>
          <div className={styles.thumbnailContainer}>
            {product.imageUrls.map((img, index) => (
              <div 
                key={index}
                className={`${styles.thumbnail} ${mainImage === img ? styles.active : ''}`}
                onClick={() => setMainImage(img)}
              >
                <img src={img} alt={`Vista ${index + 1}`} />
              </div>
            ))}
          </div>

          <div className={styles.mainImageContainer}>
            <div 
              className={`${styles.mainImageWrapper} ${zoomActive ? styles.zoomed : ''}`}
              onClick={() => setZoomActive(!zoomActive)}
            >
              {mainImage && <img src={mainImage} alt={product.title} />}
              <button className={styles.zoomButton}>
                <FaExpand />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.productHeader}>
            <h1>{product.title}</h1>
            <div className={styles.productCode}>Código: {id}</div>
          </div>

          <div className={styles.priceContainer}>
            <div className={styles.normalPrice}>
              <span>Valor:</span>
              <span className={styles.priceValue}>R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className={styles.pixPrice}>
              <span>No PIX/Dinheiro:</span>
              <span className={styles.priceValue}>R$ {Number(product.pixPrice).toFixed(2).replace('.', ',')}</span>
              <span className={styles.discountTag}>
                (Economize R$ {(Number(product.price) - Number(product.pixPrice)).toFixed(2).replace('.', ',')})
              </span>
            </div>
          </div>

          <div className={styles.stockInfo}>
            {product.stock > 0 ? (
              <span className={styles.inStock}>Em estoque ({product.stock} unidades)</span>
            ) : (
              <span className={styles.outOfStock}>Esgotado</span>
            )}
          </div>

          <button className={styles.buyButton} onClick={handleBuy}>
            Comprar Agora
          </button>
          <button 
    className={styles.addToCartButton}
    onClick={handleAddToCart}
  >
    Adicionar ao Carrinho
  </button>
          <div className={styles.whatsappContact}>
            <FaWhatsapp />
            <span>Tire suas dúvidas pelo WhatsApp</span>
          </div>
        </div>
      </div>

      <div className={styles.detailsSection}>
        <h2>Descrição do Produto</h2>
        <p>{product.description}</p>

        <h3>Detalhes</h3>
        <ul className={styles.detailsList}>
          {FIXED_DETAILS.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>

      <div className={styles.relatedProducts}>
        <MoreSells name='' />
      </div>
    </div>
  );
}