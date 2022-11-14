var bulk = db.Usuarios.initializeUnorderedBulkOp();
for (var i=0; i<usuarios.length;i++){
    bulk.insert({nombre:'pepito'})
if(i%700==0){
    console.log("nuevo bulk")
    bulk.execute()
    var bulk=db.Usuarios.initializeUnorderedBulkOp()
    }
}
bulk.execute()