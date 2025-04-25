export const addToCart = (product: {
    id: string;
    title: string;
    price: number;
    pixPrice: number;
    image: string;
  }) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verifica se o produto já está no carrinho
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    // Dispara evento para atualizar o contador no navbar
    window.dispatchEvent(new Event('storage'));
  };
  
  export const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total: number, item: any) => total + item.quantity, 0);
  };