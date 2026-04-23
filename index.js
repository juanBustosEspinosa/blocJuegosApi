import express from 'express';
import jwt from 'jsonwebtoken'; //Mirar el archivo env para acordad donde debe poner el codigo
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import multer from "multer";
import { darUsuario, crearUsuario, loginUsuario, crearJuego,inicioJuegos,buscarJuegos ,darJuegos, darUsuarios, eliminarUsuario, eliminarJuego, actualizarUsuario, actualizarJuego, buscarUsuario, crearLike, eliminarlike, darLikes, darJuegosGustados} from './db.js';
dotenv.config();

const servidor = express();

servidor.use(cors());
servidor.use(express.json());

/*-----VERIFICAR TOKEN-----*/
function verificarToken(peticion,respuesta,siguiente)
{
    
    let headers = peticion.headers.authorization;// aqui hay saber que se envie en el headers y que se pase el token
    if (!headers) {
        return respuesta.status(401).json({ mensaje: "Token no proporcionado" });
    }
    let token = headers.split(" ")[1]
    
    jwt.verify(token,process.env.SECRET,(error,datos) => {
        if (error)
            return respuesta.status(400).send("token invalido")
        peticion.usuario = datos;
        siguiente();
    })
}

/*-----FUNCIONES HASH-----*/
async function passwordHash(password)
{
    return await bcrypt.hash(password, 10);
}
async function passwordCompare(password,passwordhash)
{
    return await bcrypt.compare(password, passwordhash);
}

/*-------MULTER-----------*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'fotos/'); 
    },
    filename: function (req, file, cb) {
        const fecha = Date.now();
        cb(null, `${fecha}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

servidor.use("/fotos", express.static("fotos"));

/*----METODOS USUARIO----*/
//cuando pasemos el usuario lo pasamos entero para que sea mas facil
servidor.post("/crearUsuario",async (peticion, respuesta) => {
    try
    {
        //le pasamos el correo para saber si esta creado
        let usuario = peticion.body.usuario;
        let usuarioComprobacion = await darUsuario(usuario.correo); 

        if (usuarioComprobacion)
            return respuesta.status(403).json({mensaje : "Ya esta asignado ese correo"});
        usuario.password = await passwordHash(usuario.password);
        await crearUsuario(usuario);
        respuesta.status(201).json({mensaje : "se ha creado correctamente"})
    }
    catch(error)
    {
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.post("/login", async (peticion,respuesta) => {
    try
    {
        let {correo,password} = peticion.body;
        let usuario = await darUsuario(correo);
        if (!usuario)
            return respuesta.status(403).json({mensaje : "No existe el usuario"})
        if (!(await passwordCompare(password,usuario.password)))
            return respuesta.status(403).json({mensaje : "La contraseña no es igual"})
        let token = jwt.sign({
            nickname : usuario.nickname,
            correo : usuario.correo,
            descripcion : usuario.descripcion
        },process.env.SECRET);
        let {nickname,descripcion,_id} = usuario;
        respuesta.status(201).json({_id ,nickname,correo,descripcion,token}); //cuidado si se cambia el status
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});





/*-----TODA ACCION QUE SE PONGA NECESITA TOKEN------*/
servidor.use(verificarToken); 

servidor.delete("/eliminarUsuario", async (peticion,respuesta) => { 
    try
    {
        let idUsuario = peticion.body.idUsuario;
        let usuario = peticion.usuario;
        if (usuario.correo != "admin@admin")
            respuesta.status(403).json({ mensaje : "Este usuario no puede acceder a esta informacion"});
        await eliminarUsuario(idUsuario);
        respuesta.status(201).json({mensaje : "Se elimino correctamente"});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});


servidor.get("/darUsuarios", async (peticion,respuesta) => { 
    try
    {
        let usuario = peticion.usuario;
        if (usuario.correo != "admin@admin")
            respuesta.status(403).json({ mensaje : "Este usuario no puede acceder a esta informacion"});
        let usuarios = await darUsuarios();
        respuesta.status(201).json({usuarios});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.put("/actualizarUsuario",async (peticion, respuesta) => {
    try
    {
        let usuario = peticion.body.usuario;
        if (usuario.password)
            usuario.password = await passwordHash(usuario.password);
        await actualizarUsuario(usuario);
        respuesta.status(201).json({mensaje : "se ha actualizado correctamente"})
    }
    catch(error)
    {
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});


servidor.get("/buscarUsuarios", async (peticion,respuesta) => { 
    try
    {
        let nickname = peticion.query.nickname;

        let usuarios = await buscarUsuario(nickname);
        respuesta.status(201).json({usuarios});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

/*--------JUEGO-----------*/
servidor.delete("/eliminarJuego", async (peticion,respuesta) => { 
    try
    {
        let idJuego = peticion.body.idJuego;
        let usuario = peticion.usuario;
        if (usuario.correo != "admin@admin")
            respuesta.status(403).json({ mensaje : "Este usuario no puede acceder a esta informacion"});
        await eliminarJuego(idJuego);
        respuesta.status(201).json({mensaje : "Se elimino correctamente"});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.post("/subirJuego", upload.single('imagen'), async (peticion,respuesta) => {
    try
    {
        let juego = peticion.body;
        juego.rutaImagen = peticion.file.path;
        await crearJuego(juego);
        respuesta.status(201).json({mensaje : "Juego Creado"})
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.get("/darJuegos", async (peticion,respuesta) => { 
    try
    {
        let usuario = peticion.usuario;
        if (usuario.correo != "admin@admin")
            respuesta.status(403).json({ mensaje : "Este usuario no puede acceder a esta informacion"});
        let juegos = await darJuegos();
        respuesta.status(201).json({juegos});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.get("/inicioJuegos", async (peticion,respuesta) => { 
    try
    {
        let juegos = await inicioJuegos();
        respuesta.status(201).json({juegos});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.get("/buscarJuegos", async (peticion,respuesta) => { 
    try
    {
        let titulo = peticion.query.titulo
        let juegos = await buscarJuegos(titulo);
        respuesta.status(201).json({juegos});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});
servidor.put("/actualizarJuego",async (peticion, respuesta) => {
    try
    {
        let juego = peticion.body.juego;
        await actualizarJuego(juego);
        respuesta.status(201).json({mensaje : "se ha actualizado correctamente"})
    }
    catch(error)
    {
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

/*---------------LIKES------------------*/

servidor.post("/crearLike", async (peticion,respuesta) => {
    try
    {
        let like = peticion.body.Like;
        await crearLike(like);
        respuesta.status(201).json({mensaje : "Like Creado"})
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.delete("/eliminarlike", async (peticion,respuesta) => { 
    try
    {
        let idUsuario = peticion.body.idUsuario;
        let idJuego = peticion.body.idJuego;
        
        await eliminarlike(idUsuario, idJuego);
        respuesta.status(201).json({mensaje : "Se elimino correctamente"});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.get("/darLikes", async (peticion,respuesta) => { 
    try
    {
        let idUsuario = peticion.query.idUsuario;
        let likes = await darLikes(idUsuario);
        respuesta.status(201).json(likes);
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

/*---------------LIKES-JUEGOS------------------*/
servidor.get("/darJuegosLikes", async (peticion,respuesta) => { 
    try
    {
        let idUsuario = peticion.query.idUsuario;
        let juegos = await darJuegosGustados(idUsuario);
        respuesta.status(201).json({juegos});
    }
    catch(error)
    {
        console.log(error);
        respuesta.status(500).json({mensaje : "Error en el servidor"});
    }
});

servidor.listen(process.env.PORT);
