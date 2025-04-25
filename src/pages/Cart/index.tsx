import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import styles from "./styles.module.scss";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  title: string;
  price: number;
  pixPrice: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const navigate = useNavigate();

  // Atualiza localStorage quando o carrinho muda
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Calcula o frete com base na cidade selecionada
  const calculateShipping = () => {
    if (!selectedCity) return 0;

    switch (selectedCity) {
      case "sapiranga":
        return 5;
      case "campo-bom":
        return 10;
      case "novo-hamburgo":
      case "parobe":
        return 15;
      case "outra":
        return 20;
      default:
        return 0;
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price =
        paymentMethod === "pix" || paymentMethod === "cash"
          ? item.pixPrice
          : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const sendWhatsAppMessage = () => {
    if (cartItems.length === 0) return;

    const itemsText = cartItems
      .map((item) => {
        const price =
          paymentMethod === "pix" || paymentMethod === "cash"
            ? item.pixPrice
            : item.price;
        return `- ${item.title} - R$ ${price.toFixed(2)} x ${item.quantity}`;
      })
      .join("%0A");

    const shippingCost = calculateShipping();
    const subtotal = calculateSubtotal();
    const total = calculateTotal().toFixed(2);

    const message = `Olá, quero fazer um pedido:%0A%0A${itemsText}%0A%0AMétodo de Pagamento: ${getPaymentMethodName()}%0ASubtotal: R$ ${subtotal.toFixed(
      2
    )}%0AFrete: R$ ${shippingCost.toFixed(
      2
    )}%0ATotal: R$ ${total}%0A%0ANome: ${customerName}%0ACidade: ${
      selectedCity === "outra" ? customCity : getCityName(selectedCity)
    }%0AEndereço: ${customerAddress}`;

    window.open(`https://wa.me/5511999999999?text=${message}`, "_blank");
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case "pix":
        return "PIX";
      case "credit":
        return "Cartão de Crédito";
      case "debit":
        return "Cartão de Débito";
      case "cash":
        return "Dinheiro";
      default:
        return paymentMethod;
    }
  };

  const getCityName = (cityValue: string) => {
    switch (cityValue) {
      case "sapiranga":
        return "Sapiranga";
      case "campo-bom":
        return "Campo Bom";
      case "novo-hamburgo":
        return "Novo Hamburgo";
      case "parobe":
        return "Parobé";
      default:
        return "";
    }
  };

  const getItemPrice = (item: CartItem) => {
    return paymentMethod === "pix" || paymentMethod === "cash"
      ? item.pixPrice
      : item.price;
  };

  return (
    <div className={styles.container}>
      <h1>Seu Carrinho</h1>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Seu carrinho está vazio</p>
          <Link to="/produtos" className={styles.continueShopping}>
            Continuar comprando
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <Link to={`/produto/${item.id}`} className={styles.productLink}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.itemImage}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/produto/${item.id}`);
                    }}
                  />
                </Link>

                <div className={styles.itemDetails}>
                  <Link
                    to={`/produto/${item.id}`}
                    className={styles.productTitle}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/produto/${item.id}`);
                    }}
                  >
                    <h3>{item.title}</h3>
                  </Link>
                  <div className={styles.priceContainer}>
                    {paymentMethod === "pix" || paymentMethod === "cash" ? (
                      <p className={styles.pixPrice}>
                        R$ {item.pixPrice.toFixed(2)} (PIX/Dinheiro)
                      </p>
                    ) : (
                      <p className={styles.normalPrice}>
                        R$ {item.price.toFixed(2)} (Cartão)
                      </p>
                    )}
                  </div>

                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.removeButton}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.customerInfo}>
            <h2>Informações para Entrega</h2>

            <div className={styles.formGroup}>
              <label>Nome Completo:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Cidade:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                required
              >
                <option value="">Selecione sua cidade</option>
                <option value="sapiranga">Sapiranga (R$ 5,00)</option>
                <option value="campo-bom">Campo Bom (R$ 10,00)</option>
                <option value="novo-hamburgo">Novo Hamburgo (R$ 15,00)</option>
                <option value="parobe">Parobé (R$ 15,00)</option>
                <option value="outra">Outra cidade</option>
              </select>
            </div>

            {selectedCity === "outra" && (
              <div className={styles.formGroup}>
                <label>Digite sua cidade:</label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  required={selectedCity === "outra"}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Endereço Completo:</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Forma de Pagamento:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="pix">PIX - Com desconto</option>
                <option value="cash">Dinheiro - Com desconto</option>
                <option value="debit">Cartão de Débito</option>
                <option value="credit">Cartão de Crédito</option>
              </select>
            </div>
          </div>

          <div className={styles.cartSummary}>
            <h2>Resumo do Pedido</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal ({getPaymentMethodName()}):</span>
              <span>R$ {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Frete:</span>
              <span>
                {selectedCity
                  ? `R$ ${calculateShipping().toFixed(2)} (${
                      selectedCity === "outra"
                        ? customCity
                        : getCityName(selectedCity)
                    })`
                  : "Selecione uma cidade"}
              </span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total:</span>
              <span>R$ {calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={sendWhatsAppMessage}
            className={styles.checkoutButton}
            disabled={
              !customerName ||
              !customerAddress ||
              !selectedCity ||
              (selectedCity === "outra" && !customCity)
            }
          >
            <FaWhatsapp /> Finalizar Pedido via WhatsApp
          </button>
        </>
      )}
    </div>
  );
}
