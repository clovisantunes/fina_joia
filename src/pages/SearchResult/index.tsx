import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import styles from './styles.module.scss';
import { addToCart } from '../../components/UI/Cart';

interface Produto {
  id: string;
  title: string;
  category: string;
  price: number;
  pixPrice: string;
  description: string;
  imageUrls: string[];
  stock: number;
  featured: boolean;
}

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    setTermoBusca(query);
    
    if (query) {
      fetchProdutos(query);
    } else {
      setLoading(false);
      setError('Digite um termo para buscar');
    }
  }, [location.search]);

  const fetchProdutos = async (searchTerm: string) => {
    try {
      setLoading(true);
      const produtosRef = collection(db, 'products');
      const searchTermLower = searchTerm.toLowerCase();
      
      // Primeiro filtro: busca exata na categoria
      const qCategory = query(
        produtosRef,
        where('category', '==', searchTermLower)
      );
      
      // Segundo filtro: busca por correspondência parcial no título
      const qTitle = query(
        produtosRef,
        where('titleLower', '>=', searchTermLower),
        where('titleLower', '<=', searchTermLower + '\uf8ff')
      );
      
      // Terceiro filtro: busca por correspondência parcial na descrição
      const qDescription = query(
        produtosRef,
        where('descriptionLower', '>=', searchTermLower),
        where('descriptionLower', '<=', searchTermLower + '\uf8ff')
      );

      // Executa todas as queries em paralelo
      const [categorySnapshot, titleSnapshot, descriptionSnapshot] = await Promise.all([
        getDocs(qCategory),
        getDocs(qTitle),
        getDocs(qDescription)
      ]);

      const produtosMap = new Map<string, Produto>();
      
      const processSnapshot = (snapshot: any) => {
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (!produtosMap.has(doc.id)) {
            produtosMap.set(doc.id, {
              id: doc.id,
              title: data.title || '',
              category: data.category || '',
              price: data.price || 0,
              pixPrice: data.pixPrice || '0',
              description: data.description || '',
              imageUrls: data.imageUrls || [],
              stock: data.stock || 0,
              featured: data.featured || false
            });
          }
        });
      };
      
      processSnapshot(categorySnapshot);
      processSnapshot(titleSnapshot);
      processSnapshot(descriptionSnapshot);
      
      const produtosData = Array.from(produtosMap.values());
      
      setProdutos(produtosData);
      setError(produtosData.length === 0 ? 'Nenhum produto encontrado' : null);
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao buscar produtos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
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
        <h1 className={styles.titulo}>
          Buscando por: {termoBusca}
        </h1>
        <div className={styles.loadingAnimation}>
          <div className={styles.spinner}></div>
          <p>Procurando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>
        {error ? 'Resultados da busca' : `Resultados para: ${termoBusca}`}
      </h1>

      {error ? (
        <div className={styles.erroContainer}>
          <p className={styles.erro}>{error}</p>
          <button 
            className={styles.botaoVoltar}
            onClick={() => navigate('/')}
          >
            Voltar à loja
          </button>
        </div>
      ) : (
        <>
          <div className={styles.metaInfo}>
            <p className={styles.contagem}>
              {produtos.length} {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
            <div className={styles.ordenacao}>
              <label htmlFor="ordenar">Ordenar por:</label>
              <select id="ordenar" className={styles.selectOrdenacao}>
                <option value="relevancia">Relevância</option>
                <option value="preco-asc">Preço: menor para maior</option>
                <option value="preco-desc">Preço: maior para menor</option>
                <option value="novidades">Novidades</option>
              </select>
            </div>
          </div>

          <div className={styles.listaProdutos}>
            {produtos.map(produto => (
              <div key={produto.id} className={styles.cardProduto}>
                {produto.featured && (
                  <div className={styles.destaqueTag}>Destaque</div>
                )}
                
                <div className={styles.imagemContainer}>
                  <img 
                    src={produto.imageUrls[0] || '/images/placeholder.jpg'} 
                    alt={produto.title} 
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className={styles.infoProduto}>
                  <h3>{produto.title}</h3>
                  <p className={styles.categoria}>{produto.category}</p>
                  <p className={styles.descricao}>
                    {produto.description.substring(0, 60)}...
                  </p>
                  
                  <div className={styles.precos}>
                    <p className={styles.preco}>
                      R$ {produto.price.toFixed(2).replace('.', ',')}
                    </p>
                    {produto.pixPrice && (
                      <p className={styles.precoPix}>
                        <span className={styles.pixBadge}>PIX</span> 
                        R$ {parseFloat(produto.pixPrice).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                  
                  <div className={styles.botoesAcao}>
                    <button 
                      className={styles.botaoDetalhes}
                      onClick={() => navigate(`/produto/${produto.id}`)}
                    >
                      Ver Detalhes
                    </button>
                    <button 
                      className={styles.botaoComprar}
                      onClick={() => handleComprar(produto)}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}