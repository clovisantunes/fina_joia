import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import styles from "./styles.module.scss";

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
        featured: formData.featured
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