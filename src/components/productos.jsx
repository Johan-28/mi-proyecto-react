import { useEffect, useState } from "react";
import { FaBox, FaExclamationTriangle, FaPlus, FaTrash } from "react-icons/fa";
import Movimientos from "./movimientos";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [resumen, setResumen] = useState({
    total_productos: 0,
    bajo_stock: 0,
    proximos_vencer: 0,
    total_movimientos: 0,
  });

  const [formulario, setFormulario] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    stock: "",
    fecha_vencimiento: "",
  });

  const obtenerProductos = async () => {
    const res = await fetch("http://127.0.0.1:5000/productos");
    const data = await res.json();
    setProductos(data);
  };

  const obtenerVencimientos = async () => {
    const res = await fetch("http://127.0.0.1:5000/vencimientos");
    const data = await res.json();
    setVencimientos(data);
  };

  const obtenerResumen = async () => {
    const res = await fetch("http://127.0.0.1:5000/resumen");
    const data = await res.json();
    setResumen(data);
  };

  useEffect(() => {
    obtenerProductos();
    obtenerVencimientos();
    obtenerResumen();
  }, []);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    await fetch("http://127.0.0.1:5000/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formulario),
    });

    setFormulario({
      codigo: "",
      nombre: "",
      categoria: "",
      stock: "",
      fecha_vencimiento: "",
    });

    obtenerProductos();
    obtenerVencimientos();
    obtenerResumen();
  };

  const eliminarProducto = async (id) => {
    await fetch(`http://127.0.0.1:5000/productos/${id}`, {
      method: "DELETE",
    });

    obtenerProductos();
    obtenerVencimientos();
    obtenerResumen();
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Inventario</h2>
        <p>Travesuras y Picardías</p>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#entradas">Entradas</a>
          <a href="#entradas">Salidas</a>
          <a href="#vencimientos">Vencimientos</a>
          <a href="#reportes">Reportes</a>
        </nav>
      </aside>

      <main className="main" id="inicio">
        <header className="topbar">
          <div>
            <span className="subtitle">SISTEMA DE</span>
            <h1>Sistema de Control de Inventarios</h1>
            <p>Gestión de productos, stock y vencimientos</p>
          </div>

          <span className="user">Administrador</span>
        </header>

        <section className="cards" id="reportes">
          <div className="card">
            <FaBox />
            <div>
              <h3>{resumen.total_productos}</h3>
              <p>Total productos</p>
            </div>
          </div>

          <div className="card warning">
            <FaExclamationTriangle />
            <div>
              <h3>{resumen.bajo_stock}</h3>
              <p>Productos bajo stock</p>
            </div>
          </div>

          <div className="card warning">
            <FaExclamationTriangle />
            <div>
              <h3>{resumen.proximos_vencer}</h3>
              <p>Próximos a vencer</p>
            </div>
          </div>

          <div className="card">
            <FaBox />
            <div>
              <h3>{resumen.total_movimientos}</h3>
              <p>Total movimientos</p>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="form-card" id="productos">
            <h2>
              <FaPlus /> Registrar producto
            </h2>

            <form onSubmit={guardarProducto}>
              <input name="codigo" placeholder="Código" value={formulario.codigo} onChange={handleChange} required />
              <input name="nombre" placeholder="Nombre del producto" value={formulario.nombre} onChange={handleChange} required />
              <input name="categoria" placeholder="Categoría" value={formulario.categoria} onChange={handleChange} />
              <input name="stock" type="number" placeholder="Stock" value={formulario.stock} onChange={handleChange} required />
              <input name="fecha_vencimiento" type="date" value={formulario.fecha_vencimiento} onChange={handleChange} />
              <button type="submit">Guardar producto</button>
            </form>
          </div>

          <div className="table-card">
            <h2>Productos registrados</h2>

            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Vencimiento</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td className={Number(p.stock) <= 5 ? "danger" : ""}>{p.stock}</td>
                    <td>{p.fecha_vencimiento}</td>
                    <td>
                      <button className="delete" onClick={() => eliminarProducto(p.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-card full-width" id="vencimientos">
            <h2>Productos próximos a vencer</h2>

            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Fecha vencimiento</th>
                </tr>
              </thead>

              <tbody>
                {vencimientos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.stock}</td>
                    <td className="danger">{p.fecha_vencimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="movimientos-section" id="entradas">
            <Movimientos />
          </section>
        </section>
      </main>
    </div>
  );
}

export default Productos;