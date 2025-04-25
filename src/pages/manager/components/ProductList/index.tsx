import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
import EditProductModal from "../ProductEdit";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  pixPrice: number;
  description: string;
  imageUrls: string[]; // Alterado de 'images' para 'imageUrls' para consistência
  stock: number;
  stockId?: string;
  featured: boolean;
  createdAt?: {
    day: number;
    month: number;
    year: number;
  };
};

const ensureNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function ListProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            title: data.title || "",
            category: data.category || "",
            price: ensureNumber(data.price),
            pixPrice: ensureNumber(data.pixPrice),
            description: data.description || "",
            imageUrls: data.imageUrls || [], // Alterado para imageUrls
            stock: ensureNumber(data.stock),
            stockId: data.stockId || "",
            featured: data.featured || false,
            createdAt: data.createdAt || undefined
          });
        });

        // Ordena por data de criação (mais novos primeiro)
        productsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          const dateA = new Date(a.createdAt.year, a.createdAt.month - 1, a.createdAt.day);
          const dateB = new Date(b.createdAt.year, b.createdAt.month - 1, b.createdAt.day);
          return dateB.getTime() - dateA.getTime();
        });

        setProducts(productsData);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.stockId && product.stockId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Deseja realmente excluir este produto?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(prev => prev.filter(product => product.id !== id));
        alert("Produto excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert("Erro ao excluir produto");
      }
    }
  };
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  if (loading) {
    return <div className={styles.productList}>Carregando produtos...</div>;
  }

  if (error) {
    return <div className={styles.productList}>{error}</div>;
  }


  return (
    <div className={styles.productList}>
      <div className={styles.header}>
        <h2>Produtos Cadastrados</h2>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <ul className={styles.grid}>
          {filteredProducts.map((product) => (
            <li key={product.id} className={styles.productItem}>
              <div className={styles.productImage}>
                {product.imageUrls.length > 0 ? (
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className={styles.noImage}>Sem imagem</div>
                )}
                {product.featured && <span className={styles.featuredBadge}>Destaque</span>}
              </div>

              <div className={styles.info}>
                <h3>{product.title}</h3>
                <div className={styles.details}>
                  <p><strong>Categoria:</strong> {product.category}</p>
                  <p><strong>Preço:</strong> R$ {product.price.toFixed(2)}</p>
                  <p><strong>Pix:</strong> R$ {product.pixPrice.toFixed(2)}</p>
                  <p><strong>Estoque:</strong> {product.stock} un.</p>
                  {product.stockId && <p><strong>ID Estoque:</strong> {product.stockId}</p>}
                  {product.createdAt && (
                    <p><strong>Cadastrado em:</strong> {`${product.createdAt.day}/${product.createdAt.month}/${product.createdAt.year}`}</p>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
              <button 
              className={styles.edit}
              onClick={() => setEditingProduct(product)}
            >
              Editar
            </button>
                <button 
                  className={styles.delete} 
                  onClick={() => handleDelete(product.id)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
        {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
}