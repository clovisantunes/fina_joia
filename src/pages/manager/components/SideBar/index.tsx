// src/pages/Manager/components/Sidebar.tsx
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase/firebase";
import { LogOut, PlusCircle, List } from "lucide-react";
import styles from "./styles.module.scss";

type Props = {
  setActiveSection: (section: "add" | "list") => void;
};

export default function Sidebar({ setActiveSection }: Props) {
  const handleLogout = () => {
    signOut(auth);
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Painel</h2>

      <nav className={styles.nav}>
        <button onClick={() => setActiveSection("add")}>
          <PlusCircle size={18} />
          Adicionar Produto
        </button>
        <button onClick={() => setActiveSection("list")}>
          <List size={18} />
          Listar Produtos
        </button>
      </nav>

      <button onClick={handleLogout} className={styles.logout}>
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  );
}
