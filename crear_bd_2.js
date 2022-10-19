var cantidad_usuarios = 100000
var cantidad_direcciones = 100000
var cantidad_servicios = 60
var cantidad_categorias = 10
var cantidad_resenas = 10000

function main(nombre)
{
	console.clear()
	use(nombre)
	console.log("-> Base de datos "+nombre+" creada!")
	const colecciones = ["usuarios", "direcciones", "servicios", "categorias", "resenas"]
	colecciones.map((coleccion) =>
	{
		db.createCollection(coleccion)
		console.log("-> Coleccion "+coleccion+" creada!")
		agregar_documentos(coleccion)
	})
	console.log("-> Creando relaciones...")
	//generar_relaciones()
	console.log("-> Finalizado!")
}

function agregar_documentos(coleccion)
{
	let data = []
	let objeto
	switch(coleccion)
	{
		case "usuarios":
			for(let index=0;index<cantidad_usuarios;index++)
			{
				let tipo = Math.floor(Math.random()*2)
				objeto = new Object()
				objeto.id = index
				objeto.nombre = "nombre_"+index
				objeto.apellido = "apellido_"+index
				objeto.edad = Math.floor(Math.random()*(80-16)+16)
				objeto.avatar = "imagen/"+index
				objeto.tipo_usuario = tipo
				objeto.servicio = ""
				objeto.direccion = ""
				objeto.dni = Math.floor(Math.random()*(99999999-10000000)+10000000)
				objeto.fecha_nacimiento = ('0'+Math.floor(Math.random()*(30-1)+1)).slice(-2)+"-"+('0'+Math.floor(Math.random()*(12-1)+1)).slice(-2)+"-"+Math.floor(Math.random()*(2005-1950)+1950)
				objeto.telefono_1 = Math.floor(Math.random()*(4999999-4000000)+4000000)
				objeto.telefono_2 = Math.floor(Math.random()*(2709999999-2500000000)+2500000000)
				objeto.historial = ""
				data.push(objeto)
			}
		break
		
		case "direcciones":
			for(let index=0;index<cantidad_direcciones;index++)
			{
				objeto = new Object()
				objeto.id = index
				objeto.calle = "calle_"+index
				objeto.numero = Math.floor(Math.random()*(9000-100)+100)
				objeto.codigo_postal = Math.floor(Math.random()*(6000-5000)+5000)
				objeto.localidad = "localidad_"+Math.floor(Math.random()*(100-0)+0)
				objeto.edificio = Math.floor(Math.random()*(4-1)+1)
				objeto.piso = Math.floor(Math.random()*(60-0)+0)
				objeto.departamento = Math.floor(Math.random()*(8-1)+1)
				data.push(objeto)
			}
		break
		
		case "servicios":
			for(let index=0;index<cantidad_servicios;index++)
			{
				objeto = new Object()
				objeto.tipo = "servicio_"+index
				objeto.descripcion = "servicio_"+index
				objeto.visita_precio = Math.floor(Math.random()*(1000-200)+200)
				objeto.categoria = ""
				objeto.reseña = ""
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

		case "resenas":
			for(let index=0;index<cantidad_resenas;index++)
			{
				objeto = new Object()
				objeto.valoracion = Math.floor(Math.random()*(5-1)+1)
				objeto.comentario = "Esto es un comentario de prueba... Muy buena atencion, todo ok. Cobro lo que corresponde"
				objeto.fecha = ('0'+Math.floor(Math.random()*(30-1)+1)).slice(-2)+"-"+('0'+Math.floor(Math.random()*(12-1)+1)).slice(-2)+"-"+Math.floor(Math.random()*(2022-2018)+2018)
				data.push(objeto)
			}
		break
	}
	db[coleccion].insertMany(data)
	console.log("# Documentos agregados a la coleccion "+coleccion)
}

function generar_relaciones()
{
	let random
	init = Date.now()
	for(let index=0; index<cantidad_usuarios; index++)
	{
		db.usuarios.updateOne({id : index }, { $set: { direccion: db.direcciones.findOne({id : index }, {roll:1})._id } })
	}
	time = Date.now() - init
	console.log("# Relaciones Usuario - Direccion asignadas! tiempo: "+time/1000+" segundos")

	// Relacion entre Usuarios y Servicios
	const servicios = db.servicios.find({}, {roll:1}).toArray()
	for(let index=0; index<usuarios.length; index++)
	{
		if(usuarios[index].tipo_usuario == 1)
		{
			random = Math.floor(Math.random()*60)
			db.usuarios.updateOne({_id: usuarios[index]._id }, { $set: { servicio: servicios[random]._id } })
		}
	}
	console.log("# Relaciones Usuario - Servicio asignadas!")
}
