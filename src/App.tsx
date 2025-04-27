import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import News from './components/News';
import Items from './components/Items';
import MoreSells from './components/MoreSells';
import Produtos from './pages/Products';
import ProductDetail from './pages/productDetails';
import Auth from './pages/auth';
import Manager from './pages/manager';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResult';
import useScrollToTop from './Utils/useScrollToTop';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {


  useScrollToTop();
  return (
    <>
      {window.location.pathname !== "/auth" && window.location.pathname !== "/manager" && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <News name="novidades" />
              <MoreSells name="maisvendidos" />
              <Items name="colecao" />
            </>
          }
        />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produto/:id" element={<ProductDetail />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/busca" element={<SearchResults />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
      </Routes>
      {window.location.pathname !== "/auth" && window.location.pathname !== "/manager" && <Footer />}
    </>
  );
}

export default AppWrapper;
