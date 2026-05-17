import { useEffect, useState } from "react";

function Movimientos() {

  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  const [formulario, setFormulario] = useState({
    producto_id: "",
    tipo: "entrada",
    cantidad: "",
    descripcion: ""
  });

  const obtenerProductos = async () => {
    const respuesta = await fetch("http://127.0.0.1:5000/productos");
    const data = await respuesta.json();

    setProductos(data);
  };

  const obtenerMovimientos = async () => {
    const respuesta = await fetch("http://127.0.0.1:5000/movimientos");
    const data = await respuesta.json();

    setMovimientos(data);
  };

  useEffect(() => {
    obtenerProductos();
    obtenerMovimientos();
  }, []);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const registrarMovimiento = async (e) => {

    e.preventDefault();

    await fetch("http://127.0.0.1:5000/movimientos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formulario)
    });

    setFormulario({
      producto_id: "",
      tipo: "entrada",
      cantidad: "",
      descripcion: ""
    });

    obtenerProductos();
    obtenerMovimientos();
  };

  return (
    <div className="table-card">

      <h2>Entradas y Salidas</h2>

      <form onSubmit={registrarMovimiento}>

        <select
          name="producto_id"
          value={formulario.producto_id}
          onChange={handleChange}
          required
        >

          <option value="">
            Seleccionar producto
          </option>

          {productos.map((producto) => (

            <option
              key={producto.id}
              value={producto.id}
            >
              {producto.nombre}
            </option>

          ))}

        </select>

        <br /><br />

        <select
          name="tipo"
          value={formulario.tipo}
          onChange={handleChange}
        >
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>

        <br /><br />

        <input
          type="number"
          name="cantidad"
          placeholder="Cantidad"
          value={formulario.cantidad}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={formulario.descripcion}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Registrar Movimiento
        </button>

      </form>

      <hr />

      <h3>Historial de movimientos</h3>

      <table border="1" cellPadding="10">

        <thead>
          <tr>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Descripción</th>
            <th>Fecha</th>
          </tr>
        </thead>

        <tbody>

          {movimientos.map((movimiento) => (

            <tr key={movimiento.id}>

              <td>{movimiento.producto}</td>
              <td>{movimiento.tipo}</td>
              <td>{movimiento.cantidad}</td>
              <td>{movimiento.descripcion}</td>
              <td>{movimiento.fecha_movimiento}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Movimientos;