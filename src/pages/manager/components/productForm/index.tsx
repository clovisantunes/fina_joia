import { useState, useEffect } from "react";
import { addDoc, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase/firebase";
import styles from "./styles.module.scss";

type Product = {
  title: string;
  category: string;
  price: number;
  pixPrice: number;
  description: string;
  imageUrls: string[];
  stock: number;
  sold: number;
  featured: boolean;
  stockId: string;
  createdAt: {
    day: number;
    month: number;
    year: number;
  };
};

type Category = {
  value: string;
  label: string;
};

export default function AddProduct() {
  const [product, setProduct] = useState<Omit<Product, "imageUrls">>({
    title: "",
    category: "",
    price: 0,
    pixPrice: 0,
    description: "",
    stock: 0,
    sold: 0,
    featured: false,
    stockId: "",
    createdAt: {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const loadedCategories = querySnapshot.docs.map(doc => ({
          value: doc.id,
          label: doc.data().name || doc.id
        }));
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const getNextStockId = async (): Promise<string> => {
    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      
      let maxId = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.stockId) {
          const idNum = parseInt(data.stockId.replace("E-", ""));
          if (idNum > maxId) maxId = idNum;
        }
      });
      
      return `STK-${maxId + 1}`;
    } catch (error) {
      console.error("Erro ao gerar ID sequencial:", error);
      return `STK-${Date.now()}`;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct(prev => ({ ...prev, [name]: checked }));
    } else {
      setProduct(prev => ({ 
        ...prev, 
        [name]: name.includes("price") || name === "stock" || name === "sold" ? Number(value) : value 
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const newCategoryValue = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    const newCategory = {
      value: newCategoryValue,
      label: newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1)
    };

    try {
      await setDoc(doc(db, "categories", newCategoryValue), {
        name: newCategory.label,
        createdAt: new Date().toISOString()
      });

      setCategories([...categories, newCategory]);
      setProduct(prev => ({ ...prev, category: newCategoryValue }));
      setNewCategoryName("");
      setShowNewCategoryInput(false);
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Erro ao adicionar nova categoria");
    }
  };

  const uploadImages = async (productId: string): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      const storageRef = ref(storage, `products/${productId}/${image.name}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });
    
    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentDate = new Date();
      const createdAt = {
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };

      // Gera o ID sequencial
      const stockId = await getNextStockId();

      const productData = {
        ...product,
        stockId,
        createdAt,
        imageUrls: [],
        sold: product.sold || 0
      };

      const docRef = await addDoc(collection(db, "products"), productData);
      
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(docRef.id);
        await setDoc(docRef, { imageUrls }, { merge: true });
      }
      
      alert(`
        Produto cadastrado com sucesso!
        ID de Estoque: ${stockId}
        ID do Documento: ${docRef.id}
      `);
      
      setProduct({
        title: "",
        category: "",
        price: 0,
        pixPrice: 0,
        description: "",
        stock: 0,
        sold: 0,
        featured: false,
        stockId: "",
        createdAt: {
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      setImages([]);
      setPreviewUrls([]);
      
    } catch (error) {
      console.error("Erro ao cadastrar produto: ", error);
      alert("Erro ao cadastrar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Adicionar Produto</h2>

      <div className={styles.grid2}>
        <label className={styles.inputGroup}>
          Nome do produto
          <input type="text" name="title" value={product.title} onChange={handleInputChange} required />
        </label>

        <label className={styles.inputGroup}>
          Categoria
          <div className={styles.categorySelector}>
            {loadingCategories ? (
              <select disabled>
                <option>Carregando categorias...</option>
              </select>
            ) : (
              <>
                <select 
                  name="category" 
                  value={product.category} 
                  onChange={handleInputChange} 
                  required
                  disabled={showNewCategoryInput}
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className={styles.addCategoryButton}
                  onClick={() => setShowNewCategoryInput(true)}
                >
                  +
                </button>
              </>
            )}
          </div>
          
          {showNewCategoryInput && (
            <div className={styles.newCategoryInput}>
              <input
                type="text"
                placeholder="Nome da nova categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
              <div className={styles.newCategoryActions}>
                <button 
                  type="button" 
                  onClick={handleAddNewCategory}
                  className={styles.confirmButton}
                  disabled={!newCategoryName.trim()}
                >
                  Confirmar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName("");
                  }}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </label>
      </div>

      <div className={styles.grid2}>
        <label className={styles.inputGroup}>
          Preço padrão (R$)
          <input type="number" name="price" value={product.price} onChange={handleInputChange} required />
        </label>

        <label className={styles.inputGroup}>
          Preço no Pix (R$)
          <input type="number" name="pixPrice" value={product.pixPrice} onChange={handleInputChange} required />
        </label>
      </div>

      <label className={styles.inputGroup}>
        Descrição detalhada
        <textarea name="description" value={product.description} onChange={handleInputChange} required />
      </label>

      <div className={styles.grid3}>
        <label className={styles.inputGroup}>
          Estoque disponível
          <input type="number" name="stock" value={product.stock} onChange={handleInputChange} required />
        </label>

        <label className={styles.inputGroup}>
          Quantidade vendida
          <input type="number" name="sold" value={product.sold} onChange={handleInputChange} />
        </label>

        <label className={styles.checkboxGroup}>
          <div className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              name="featured" 
              checked={product.featured} 
              onChange={handleInputChange}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxLabel}>Produto Destacado</span>
          </div>
        </label>
      </div>

      <label className={styles.imageLabel}>
        Fotos do produto (Máx. 10 imagens)
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleImageChange}
          max={10}
        />
      </label>

      <div className={styles.imagePreview}>
        {previewUrls.map((url, idx) => (
          <div key={idx} className={styles.previewImageContainer}>
            <img src={url} alt={`preview-${idx}`} />
          </div>
        ))}
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Salvando..." : "Salvar Produto"}
      </button>
    </form>
  );
}