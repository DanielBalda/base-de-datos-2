// variables globales para la cantidad de documentos a crear
var cantidad_usuarios = 5000
var cantidad_categorias = 15
var cantidad_resenas = 2000
var cantidad_historial = 1200
main() // recibe el nombre de la base de datos como parametro, si queda en blanco se crea con el nombre "ServiciosYa"

function randomDate(start, end) {
	var date = new Date(+start + Math.random() * (end - start))
	var day = date.getDate()
	var month = date.getMonth() + 1
	var year = date.getFullYear()
	month = month < 10 ? '0' + month : month
	day = day < 10 ? '0' + day : day
	return year + "-" + month + "-" + day
}

function main(nombre = "ServiciosYa")
{
	let init = Date.now()
	console.clear()
	use(nombre) // crea la base de datos
	console.log("-> Base de datos \""+nombre+"\" creada!")
	const colecciones = ["usuarios", "categorias", "publicaciones", "resenas", "historial"]
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
				direcciones = []
				for(let dir=0;dir<3;dir++)
				{
					let direccionJson = new Object()
					direccionJson.calle = "calle_"+index
					direccionJson.numero = Math.floor(Math.random()*(9000-100)+100)
					direccionJson.codigo_postal = Math.floor(Math.random()*(6000-5000)+5000)
					direccionJson.localidad = "localidad_"+Math.floor(Math.random()*(100-0)+0)
					direccionJson.provincia = "provincia_"+Math.floor(Math.random()*(100-0)+0)
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
				objeto.dni = parseInt(Math.floor(Math.random()*(99999999-10000000)+10000000)+""+index)
				objeto.fecha_nacimiento = randomDate(new Date(1990, 0, 1), new Date(2010, 0, 1))
				let telefonoJson = new Object()
				telefonoJson.casa = Math.floor(Math.random()*(4999999-4000000)+4000000)
				telefonoJson.celular_1 = Math.floor(Math.random()*(2709999999-2500000000)+2500000000)
				telefonoJson.celular_2 = Math.floor(Math.random()*(2709999999-2500000000)+2500000000)
				objeto.telefono = telefonoJson
				data.push(objeto)
			}
		break
		
		case "categorias":
			for(let index=0;index<cantidad_categorias;index++)
			{
				objeto = new Object()
				objeto.tipo = "categoria_"+index
				let servicio = []
				let random = Math.floor(Math.random()*(12-5)+5)
				for(let index=0;index<random;index++)
				{
					servicio.push("servicio_"+index)
				}
				objeto.servicios = servicio
				data.push(objeto)
			}
		break

		case "publicaciones":
			usuarios_tipo_1 = db.usuarios.find({tipo_usuario:1}).count()
			for(let index=0;index<usuarios_tipo_1;index++)
			{
				objeto = new Object()
				objeto.descripcion = "Descripcion sobre el servicio brindado por el usuario, con detalles puntuales."
				objeto.fecha_publicacion = randomDate(new Date(2019, 0, 1), new Date(2022, 0, 1))
				objeto.costo_visita = Math.floor(Math.random()*(1000-200)+200)
				objeto.usuario = "" // ObjetoId de usuarios
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
				objeto.fecha = randomDate(new Date(2019, 0, 1), new Date(2022, 0, 1))
				objeto.cliente = "" // ObjectId de usuario (tipo_usuario = 0)
				objeto.publicacion = "" // ObjectId de publicacion
				data.push(objeto)
			}
		break

		case "historial":
			for(let index=0;index<cantidad_historial;index++)
			{
				objeto = new Object()
				objeto.estado = Math.floor(Math.random()*(3-0)+0) // 0 - Cancelado, 1 - En proceso, 2 - Completado
				objeto.cliente = "" // ObjectId de usuario (tipo_usuario = 0)
				objeto.publicacion = "" // ObjectId de publicacion
				objeto.fecha = randomDate(new Date(2019, 0, 1), new Date(2022, 0, 1))
				objeto.costo_reparacion = Math.floor(Math.random()*(30000-8000)+8000)
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

	// Relaciona publicacion con usuarios tipo 1
	publicaciones = db.publicaciones.find()
	usuarios = db.usuarios.find({tipo_usuario:1})
	while (usuarios.hasNext())
	{
		db.publicaciones.updateOne({_id:publicaciones.next()._id}, {$set:{usuario:usuarios.next()._id}})
	}
	console.log("# Relacion publicacion - usuario")

	// Relaciona Publicacion con Servicio

	let categorias = db.categorias.find({}, {servicios:1})
	let publicacion = db.publicaciones.find()
	while(publicacion.hasNext())
	{
		if(!categorias.hasNext())
		{
			categorias = db.categorias.find({}, {servicios:1})
		}
		let servicios = categorias.next().servicios
		let random = Math.floor(Math.random()*(servicios.length-1)+1)
		db.publicaciones.updateOne({_id:publicacion.next()._id}, {$set:{servicio:servicios[random]}})
	}
	console.log("# Relacion publicacion - servicio")

	// Relaciona resenas con usuarios tipo 0 
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
	console.log("# Relacion resena - usuario")

	// Relaciona resenas con publicaciones
	resenas = db.resenas.find()
	publicaciones = db.publicaciones.find()
	count = 3
	repeat = ""
	repeat = publicaciones.next()._id
	while (resenas.hasNext())
	{
		if(!publicaciones.hasNext())
		{
			publicaciones = db.publicaciones.find()
		}
		if(count == 0)
		{
			repeat = publicaciones.next()._id
			count = 3
		}
		db.resenas.updateOne({_id:resenas.next()._id}, {$set:{publicacion:repeat}})
		count--
	}
	console.log("# Relacion resena - publicacion")

	// relacion usuario_tipo 0 con historial
	usuarios = db.usuarios.find({},{tipo_usuario:0})
	public = db.publicaciones.find()
	hist = db.historial.find()
	while(hist.hasNext())
	{
		if(!usuarios.hasNext())
		{
			usuarios = db.usuarios.find({},{tipo_usuario:0})
		}
		if(!public.hasNext())
		{
			public = db.publicaciones.find()
		}
		db.historial.updateOne({_id:hist.next()._id}, {$set:{cliente:usuarios.next()._id, publicacion:public.next()._id}})
	}
}

//db.dropDatabase()
