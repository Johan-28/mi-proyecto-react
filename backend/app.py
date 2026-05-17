from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="inventario_user",
    password="12345",
        database="inventario_db"
    )

@app.route("/")
def inicio():
    return jsonify({"mensaje": "API funcionando correctamente"})

@app.route("/productos", methods=["GET"])
def obtener_productos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("SELECT * FROM productos ORDER BY id DESC")
    productos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(productos)

@app.route("/productos", methods=["POST"])
def crear_producto():
    data = request.json

    conexion = conectar_db()
    cursor = conexion.cursor()

    sql = """
    INSERT INTO productos
    (codigo, nombre, categoria, stock, fecha_vencimiento)
    VALUES (%s, %s, %s, %s, %s)
    """

    valores = (
        data["codigo"],
        data["nombre"],
        data["categoria"],
        data["stock"],
        data["fecha_vencimiento"]
    )

    cursor.execute(sql, valores)
    conexion.commit()

    cursor.close()
    conexion.close()

    return jsonify({"mensaje": "Producto guardado correctamente"})

@app.route("/productos/<int:id>", methods=["DELETE"])
def eliminar_producto(id):
        conexion = conectar_db()
        cursor = conexion.cursor()

        cursor.execute("DELETE FROM productos WHERE id = %s", (id,))
        conexion.commit()

        cursor.close()
        conexion.close()

        return jsonify({"mensaje": "Producto eliminado"})
   



@app.route("/movimientos", methods=["GET", "POST"])
def movimientos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    if request.method == "POST":
        data = request.json

        sql = """
        INSERT INTO movimientos (producto_id, tipo, cantidad, descripcion)
        VALUES (%s, %s, %s, %s)
        """

        valores = (
            data["producto_id"],
            data["tipo"],
            data["cantidad"],
            data["descripcion"]
        )

        cursor.execute(sql, valores)

        if data["tipo"] == "entrada":
            cursor.execute(
                "UPDATE productos SET stock = stock + %s WHERE id = %s",
                (data["cantidad"], data["producto_id"])
            )
        else:
            cursor.execute(
                "UPDATE productos SET stock = stock - %s WHERE id = %s",
                (data["cantidad"], data["producto_id"])
            )

        conexion.commit()
        cursor.close()
        conexion.close()

        return jsonify({"mensaje": "Movimiento registrado correctamente"})

    cursor.execute("""
        SELECT 
            movimientos.id,
            productos.nombre AS producto,
            movimientos.tipo,
            movimientos.cantidad,
            movimientos.descripcion,
            movimientos.fecha_movimiento
        FROM movimientos
        INNER JOIN productos ON movimientos.producto_id = productos.id
        ORDER BY movimientos.id DESC
    """)

    movimientos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(movimientos)

@app.route("/vencimientos", methods=["GET"])
def productos_por_vencer():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM productos
        WHERE fecha_vencimiento IS NOT NULL
        AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY fecha_vencimiento ASC
    """)

    productos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(productos)

@app.route("/resumen", methods=["GET"])
def resumen():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) AS total_productos FROM productos")
    total_productos = cursor.fetchone()["total_productos"]

    cursor.execute("SELECT COUNT(*) AS bajo_stock FROM productos WHERE stock <= 5")
    bajo_stock = cursor.fetchone()["bajo_stock"]

    cursor.execute("""
        SELECT COUNT(*) AS proximos_vencer
        FROM productos
        WHERE fecha_vencimiento IS NOT NULL
        AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    """)
    proximos_vencer = cursor.fetchone()["proximos_vencer"]

    cursor.execute("SELECT COUNT(*) AS total_movimientos FROM movimientos")
    total_movimientos = cursor.fetchone()["total_movimientos"]

    cursor.close()
    conexion.close()

    return jsonify({
        "total_productos": total_productos,
        "bajo_stock": bajo_stock,
        "proximos_vencer": proximos_vencer,
        "total_movimientos": total_movimientos
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
