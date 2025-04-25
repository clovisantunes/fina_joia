// src/pages/Manager/index.tsx
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import styles from "./styles.module.scss";
import AddProduct from "./components/productForm";
import ListProducts from "./components/ProductList";
import { useNavigate } from "react-router-dom";


function Manager() {
  const [activeSection, setActiveSection] = useState<"add" | "list">("add");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/auth"); 
    }
  }, []); 

  return (
    <div className={styles.managerContainer}>
      <Sidebar setActiveSection={setActiveSection} />
      <main className={styles.content}>
        {activeSection === "add" ? <AddProduct /> : <ListProducts />}
      </main>
    </div>
  );
}

export default Manager;
