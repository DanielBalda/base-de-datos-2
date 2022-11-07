// variables globales para la cantidad de documentos a crear
var cantidad_usuarios = 1000
var cantidad_servicios = 60
var cantidad_categorias = 10
var cantidad_resenas = 1000
var cantidad_historial = 1000
main() // recibe el nombre de la base de datos como parametro, si queda en blanco se crea con el nombre "ServiciosYa"

function main(nombre = "ServiciosYa")
{
	let init = Date.now()
	console.clear()
	use(nombre) // crea la base de datos
	console.log("-> Base de datos \""+nombre+"\" creada!")
	const colecciones = ["usuarios", "servicios", "categorias", "publicaciones", "resenas", "historial"]
	colecciones.map((coleccion) =>
	{
		db.createCollection(coleccion) // crea las colecciones
		console.log("-> Coleccion "+coleccion+" creada!")
		agregar_documentos(coleccion) // agrega los documentos pasado por parametro a la coleccion
	})
	console.log("-> Creando relaciones...")
	generar_relaciones()
	console.log("-> Finalizado! tiempo total: "+Math.floor((Date.now() - init)/1000)+" segundos")
}

function agregar_documentos(coleccion)
{
	let data = []
	let objeto
	let indices = []
	switch(coleccion)
	{
		case "usuarios":
			indices = [{email:1},{dni:1}]
			for(let index=0;index<cantidad_usuarios;index++)
			{
				let tipo = Math.floor(Math.random()*2)
				objeto = new Object()
				objeto.nombre = "nombre_"+index
				objeto.apellido = "apellido_"+index
				objeto.email = "usuario_"+index+"@email.com" // se usa para el login
				objeto.contrasena = "ab58s1968w1fas81gw"+index
				objeto.avatar = "imagen/"+index
				objeto.tipo_usuario = tipo
				objeto.publicacion = "" // ObjetoId de publicacion
				objeto.countServicios = 0
				direcciones = []
				for(let dir=0;dir<3;dir++)
				{
					let direccionJson = new Object()
					direccionJson.calle = "calle_"+index
					direccionJson.numero = Math.floor(Math.random()*(9000-100)+100)
					direccionJson.codigo_postal = Math.floor(Math.random()*(6000-5000)+5000)
					direccionJson.localidad = "localidad_"+Math.floor(Math.random()*(100-0)+0)
					if(dir > 1)
					{
						direccionJson.edificio = Math.floor(Math.random()*(4-1)+1)
						direccionJson.piso = Math.floor(Math.random()*(60-0)+0)
						direccionJson.departamento = Math.floor(Math.random()*(8-1)+1)
					}
					else
					{
						direccionJson.edificio = ""
						direccionJson.piso = ""
						direccionJson.departamento = ""
					}
					direcciones.push(direccionJson)
				}
				objeto.direccion = direcciones
				objeto.dni = Math.floor(Math.random()*(99999999-10000000)+10000000)
				objeto.fecha_nacimiento = ('0'+Math.floor(Math.random()*(30-1)+1)).slice(-2)+"-"+('0'+Math.floor(Math.random()*(12-1)+1)).slice(-2)+"-"+Math.floor(Math.random()*(2005-1950)+1950)
				let telefonoJson = new Object()
				telefonoJson.casa = Math.floor(Math.random()*(4999999-4000000)+4000000)
				telefonoJson.celular_1 = Math.floor(Math.random()*(2709999999-2500000000)+2500000000)
				telefonoJson.celular_2 = Math.floor(Math.random()*(2709999999-2500000000)+2500000000)
				objeto.telefono = telefonoJson
				objeto.historial = "" // ObjetoId de historial
				data.push(objeto)
			}
		break
		
		case "servicios":
			for(let index=0;index<cantidad_servicios;index++)
			{
				objeto = new Object()
				objeto.tipo = "servicio_"+index
				objeto.categoria = "" // ObjectId de categoria
				data.push(objeto)
			}
		break
		
		case "categorias":
			for(let index=0;index<cantidad_categorias;index++)
			{
				objeto = new Object()
				objeto.tipo = "categoria_"+index
				data.push(objeto)
			}
		break

		case "publicaciones":
			usuarios_tipo_1 = db.usuarios.find({tipo_usuario:1}).count()
			for(let index=0;index<usuarios_tipo_1;index++)
			{
				objeto = new Object()
				objeto.descripcion = "Descripcion sobre el servicio brindado por el usuario, con detalles puntuales."
				objeto.fecha_publicacion = ('0'+Math.floor(Math.random()*(30-1)+1)).slice(-2)+"-"+('0'+Math.floor(Math.random()*(12-1)+1)).slice(-2)+"-"+Math.floor(Math.random()*(2022-2018)+2018)
				objeto.costo_visita = Math.floor(Math.random()*(1000-200)+200)
				objeto.resena = "" // ObjectId de reseña
				objeto.servicio = "" // ObjectId de servicio
				data.push(objeto)
			}
		break

		case "resenas":
			for(let index=0;index<cantidad_resenas;index++)
			{
				objeto = new Object()
				objeto.valoracion = Math.floor(Math.random()*(5-1)+1)
				objeto.comentario = "Esto es un comentario de prueba... Muy buena atencion, todo ok. Cobro lo que corresponde"
				objeto.fecha = ('0'+Math.floor(Math.random()*(30-1)+1)).slice(-2)+"-"+('0'+Math.floor(Math.random()*(12-1)+1)).slice(-2)+"-"+Math.floor(Math.random()*(2022-2018)+2018)
				objeto.cliente = "" // ObjectId de usuario (tipo_usuario = 0)
				data.push(objeto)
			}
		break

		case "historial":
			for(let index=0;index<cantidad_historial;index++)
			{
				objeto = new Object()
				objeto.estado = Math.floor(Math.random()*(3-0)+0) // 0 - Cancelado, 1 - En proceso, 2 - Completado
				objeto.oferente = "" // ObjectId de usuario (tipo_usuario = 1)
				objeto.cliente = "" // ObjectId de usuario (tipo_usuario = 0)
				objeto.publicacion = "" // ObjectId de publicacion
				objeto.fecha = ('0'+Math.floor(Math.random()*(30-1)+1)).slice(-2)+"-"+('0'+Math.floor(Math.random()*(12-1)+1)).slice(-2)+"-"+Math.floor(Math.random()*(2022-2018)+2018)
				objeto.costo_total = Math.floor(Math.random()*(30000-8000)+8000)
				data.push(objeto)
			}
		break
	}
	db[coleccion].insertMany(data)
	if(indices.length > 0)
	{
		indices.map((indice)=>{
			db[coleccion].createIndex(indice, {"unique":true})
		})
	}
	console.log("# Documentos agregados a la coleccion "+coleccion)
}

function generar_relaciones()
{

	// Relaciona usuarios tipo 1 con publicacion 
	init = Date.now()
	usuarios = db.usuarios.find({tipo_usuario:1})
	publicaciones = db.publicaciones.find()
	while (usuarios.hasNext())
	{
		db.usuarios.updateOne({_id:usuarios.next()._id}, {$set:{publicacion:publicaciones.next()._id}})
	}
	console.log("# Relaciones Usuario - Publicacion asignadas! Tiempo: "+Math.floor((Date.now() - init)/1000)+" segundos")

	// Relaciona Servicio con Categoria
	init = Date.now()
	servicios = db.servicios.find({})
	categorias = db.categorias.aggregate({ $sample: { size: db.categorias.countDocuments() } })
	while (servicios.hasNext())
	{
		if(!categorias.hasNext())
		{
			categorias = db.categorias.aggregate({ $sample: { size: db.categorias.countDocuments() } })
		}
		db.servicios.updateOne({_id:servicios.next()._id}, {$set:{categoria:categorias.next()._id}})
	}
	console.log("# Relaciones Servicio - Categoria asignadas! Tiempo: "+Math.floor((Date.now() - init)/1000)+" segundos")

	// Relaciona Publicacion con Servicio
	init = Date.now()
	publicaciones = db.publicaciones.find({})
	servicios = db.servicios.aggregate({ $sample: { size: db.servicios.countDocuments() } })
	while (publicaciones.hasNext())
	{
		if(!servicios.hasNext())
		{
			servicios = db.servicios.aggregate({ $sample: { size: db.servicios.countDocuments() } })
		}
		db.publicaciones.updateOne({_id:publicaciones.next()._id}, {$set:{servicio:servicios.next()._id}})
	}
	console.log("# Relaciones Publicacion - Servicio asignadas! Tiempo: "+Math.floor((Date.now() - init)/1000)+" segundos")

	// Relaciona resenas con usuarios tipo 0 
	init = Date.now()
	resenas = db.resenas.find()
	usuarios = db.usuarios.aggregate([{$match:{tipo_usuario:0}},{$sample:{size:db.usuarios.countDocuments()}}])
	while (resenas.hasNext())
	{
		if(!usuarios.hasNext())
		{
			usuarios = db.usuarios.aggregate([{$match:{tipo_usuario:0}},{$sample:{size:db.usuarios.countDocuments()}}])
		}
		db.resenas.updateOne({_id:resenas.next()._id}, {$set:{cliente:usuarios.next()._id}})
	}
	console.log("# Relaciones Resena - Usuario asignadas!")
	console.log("Tiempo: "+Math.floor((Date.now() - init)/1000)+" segundos")

	// Relaciona historial con usuarios tipo 0 y 1
	init = Date.now()
	historial = db.historial.find()
	cliente = db.usuarios.aggregate([{$match:{tipo_usuario:0}},{$sample:{size:db.usuarios.countDocuments()}}])
	oferente = db.usuarios.aggregate([{$match:{tipo_usuario:1}},{$sample:{size:db.usuarios.countDocuments()}}])
	while (historial.hasNext())
	{
		if(!cliente.hasNext())
		{
			cliente = db.usuarios.aggregate([{$match:{tipo_usuario:0}},{$sample:{size:db.usuarios.countDocuments()}}])
		}

		if(!oferente.hasNext())
		{
			oferente = db.usuarios.aggregate([{$match:{tipo_usuario:1}},{$sample:{size:db.usuarios.countDocuments()}}])
		}
		db.historial.updateOne({_id:historial.next()._id}, {$set:{oferente:oferente.next()._id, cliente:cliente.next()._id}})
	}
	console.log("# Relaciones Historial - Usuario asignadas!")
	console.log("Tiempo: "+Math.floor((Date.now() - init)/1000)+" segundos")

	// Cantidad de servicios realizados por usuario tipo 1

	usuarios = db.usuarios.find({tipo_usuario:1})
	while(usuarios.hasNext())
	{
    usuario = usuarios.next()._id
    cantidad = db.historial.countDocuments({"oferente":usuario})
    db.usuarios.updateOne({_id:usuario}, {$set:{countServicios:cantidad}})
	}

}

//db.dropDatabase()
