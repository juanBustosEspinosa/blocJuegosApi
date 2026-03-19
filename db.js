import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const urlMongo = process.env.MONGO_URL; 

function conectar()
{
    return(MongoClient.connect(urlMongo));
}




/*---------USUARIOS---------*/
export function darUsuario(correo)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("usuarios");
            return (coleccion.findOne({correo : correo}));
        })
        .then(usuario => ok(usuario))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}

export function loginUsuario(correo,password)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("usuarios");
            return (coleccion.findOne({correo : correo, password : password}));
        })
        .then(usuario => ok(usuario))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}


export function crearUsuario(usuario)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("usuarios");
            return (coleccion.insertOne({...usuario}));
        })
        .then(usuario => ok(usuario))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}

export function actualizarUsuario(usuario)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("usuarios");
            return (coleccion.updateOne({correo : usuario.correo},{$set : usuario}));
        })
        .then(usuario => ok(usuario))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}

export function darUsuarios()
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("usuarios");
            return (coleccion.find().toArray());
        })
        .then(usuarios => ok(usuarios))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}

export function eliminarUsuario(correo)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("usuarios");
            return (coleccion.deleteOne({correo : correo}));
        })
        .then(usuario => ok(usuario))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}


/*---------JUEGOS-----------*/

export function eliminarJuego(titulo, desarrollador)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("juegos");
            return (coleccion.deleteOne({titulo : titulo, desarrollador : desarrollador}));
        })
        .then(juego => ok(juego))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}


export function crearJuego(juego)
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("juegos");
            return (coleccion.insertOne({...juego}));
        })
        .then(juego => ok(juego))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}

export function darJuegos()
{
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then((objConexion) => {
            conexion = objConexion;
            let coleccion = conexion.db("ProyectoFinal").collection("juegos");
            return (coleccion.find().toArray());
        })
        .then(juegos => ok(juegos))
        .catch((error) => ko(error))
        .finally(() => {
            if (conexion)
                conexion.close();
        })
    })
}