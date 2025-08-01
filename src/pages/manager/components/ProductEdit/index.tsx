import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import styles from "./styles.module.scss";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  pixPrice: number;
  description: string;
  imageUrls: string[];
  stock: number;
  stockId?: string;
  featured: boolean;
};

type EditProductModalProps = {
  product: Product;
  onClose: () => void;
  onUpdate: (updatedProduct: Product) => void;
};

export default function EditProductModal({ product, onClose, onUpdate }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product>(product);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const storage = getStorage();
  const newImageUrls: string[] = [];

  try {
    for (const file of Array.from(files)) {
      const imageRef = ref(storage, `products/${formData.id}/${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      newImageUrls.push(url);
    }

    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...newImageUrls],
    }));
  } catch (error) {
    console.error("Erro ao fazer upload das imagens:", error);
    setError("Erro ao enviar imagem. Tente novamente.");
  }
};
const handleRemoveImage = (indexToRemove: number) => {
  setFormData(prev => ({
    ...prev,
    imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
  }));
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const productRef = doc(db, "products", formData.id);
      await updateDoc(productRef, {
        title: formData.title,
        category: formData.category,
        price: formData.price,
        pixPrice: formData.pixPrice,
        description: formData.description,
        stock: formData.stock,
        featured: formData.featured,
         imageUrls: formData.imageUrls,
      });

      onUpdate(formData);
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      setError("Erro ao atualizar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Editar Produto</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.editForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nome do Produto</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Categoria</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Preço Normal (R$)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Preço PIX (R$)</label>
              <input
                type="number"
                name="pixPrice"
                value={formData.pixPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Estoque</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>ID de Estoque</label>
              <input
                type="text"
                name="stockId"
                value={formData.stockId || ''}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                />
                Produto Destacado
              </label>
            </div>
          </div>
<div className={styles.formGroup}>
  <label>Imagens Atuais</label>
  <div className={styles.imagePreviewContainer}>
    {formData.imageUrls.map((url, index) => (
      <div key={index} className={styles.imageItem}>
        <img src={url} alt={`Imagem ${index + 1}`} className={styles.imagePreview} />
        <button
          type="button"
          className={styles.removeImageButton}
          onClick={() => handleRemoveImage(index)}
        >
          X
        </button>
      </div>
    ))}
  </div>
</div>


<div className={styles.formGroup}>
  <label>Adicionar Novas Imagens</label>
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageUpload}
  />
</div>

          <div className={styles.formGroup}>
            <label>Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              required
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}


          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}