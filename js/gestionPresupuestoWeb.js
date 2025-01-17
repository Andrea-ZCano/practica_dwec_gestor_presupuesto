'use strict';
import * as gestionPresupuesto from  "./gestionPresupuesto.js";

function mostrarDatoEnId(idElemento, valor)
{
    if(idElemento != undefined)
    {
        let elemento = document.getElementById(idElemento);
        elemento.innerHTML += valor;
    }
}

function mostrarGastoWeb(idElemento, gasto){
    if(idElemento != undefined){
        let elemento = document.getElementById(idElemento);
        let divGasto = document.createElement("div");
        divGasto.className="gasto";

        if (gasto.descripcion){
            let divGastoDescripcion = document.createElement("div");
            divGastoDescripcion.className = "gasto-descripcion";
            divGastoDescripcion.innerHTML += gasto.descripcion;
            divGasto.append(divGastoDescripcion);
        }

        if(gasto.valor){
            let divGastoValor = document.createElement("div");
            divGastoValor.className = "gasto-valor";
            divGastoValor.innerHTML += gasto.valor;
            divGasto.append(divGastoValor);
        }

        if (gasto.fecha){
            let divGastoFecha = document.createElement("div");
            divGastoFecha.className = "gasto-fecha";
            divGastoFecha.innerHTML += gasto.fecha;
            divGasto.append(divGastoFecha);  
        }

        let divGastoEtiquetas = document.createElement("div");
        divGastoEtiquetas.className = "gasto-etiquetas";
        
        for(let etiqueta of gasto.etiquetas){
            let spanEtiquetas = document.createElement('span');
            spanEtiquetas.className= "gasto-etiquetas-etiqueta";
            spanEtiquetas.textContent = etiqueta;
            divGastoEtiquetas.append(spanEtiquetas)

            let etBorradas = new BorrarEtiquetasHandle(gasto);
            etBorradas.gasto = gasto;
            etBorradas.etiquetas = etiqueta;
            spanEtiquetas.addEventListener("click", etBorradas);
        }
        divGasto.append(divGastoEtiquetas);
        
        let salto=document.createElement("br");
        divGasto.append(divGastoEtiquetas, salto);

        let btedit = document.createElement('button');
        btedit.type = 'button';
        btedit.className = 'gasto-editar';
        btedit.textContent = 'Editar';

        let objedit= new EditarHandle();
        objedit.gasto = gasto;
        btedit.addEventListener('click', objedit);
        divGasto.append(btedit);

        let btborrar = document.createElement('button');
        btborrar.type = 'button';
        btborrar.className = 'gasto-borrar';
        btborrar.textContent = 'Borrar';
        
        let objborrar = new BorrarHandle();
        objborrar.gasto = gasto;
        btborrar.addEventListener('click', objborrar);
        divGasto.append(btborrar);

        let btnGastosBorrarAPI = document.createElement("button");
        btnGastosBorrarAPI.className = "gasto-borrar-api";
        btnGastosBorrarAPI.elemento = "gasto-borrar-api";
        btnGastosBorrarAPI.type = "button";
        btnGastosBorrarAPI.textContent = "Borrar(API)";

        let handleBorrarApi = new borrarApiHandle();
        handleBorrarApi.gasto = gasto;

        btnGastosBorrarAPI.addEventListener("click", handleBorrarApi);
        divGasto.append(btnGastosBorrarAPI);

        let btnEditForm = document.createElement("button");
        btnEditForm.className = "gasto-editar-formulario";
        btnEditForm.elemento = "gasto-editar-formulario";
        btnEditForm.type = "button";
        btnEditForm.textContent = "Editar (formulario)";


        let handleEditForm = new EditarHandleFormulario();
        handleEditForm.gasto = gasto;
        btnEditForm.addEventListener('click', handleEditForm);
        divGasto.append(btnEditForm);

        let btnGastosEnviarAPI = document.createElement("button");
        btnGastosEnviarAPI.className = "gasto-enviar-api";
        btnGastosEnviarAPI.elemento = "gasto-enviar-api";
        btnGastosEnviarAPI.type = "button";
        btnGastosEnviarAPI.textContent = "Enviar(API)";

        divGasto.append(divGastoEtiquetas);
        elemento.append(divGasto);
    };
};

function mostrarGastosAgrupadosWeb(idElemento, agrup, periodo)
{
    // Obtener la capa donde se muestran los datos agrupados por el período indicado.
    // Seguramente este código lo tengas ya hecho pero el nombre de la variable sea otro.
    // Puedes reutilizarlo, por supuesto. Si lo haces, recuerda cambiar también el nombre de la variable en el siguiente bloque de código
    //var elemento = document.getElementById(idElemento);
    // Borrar el contenido de la capa para que no se duplique el contenido al repintar
    let elemento = document.getElementById(idElemento);

    elemento.innerHTML = "";
    
    let agrupDIV = document.createElement('div');
    agrupDIV.className = 'agrupacion';

    let agrupTit = document.createElement('h1');
    agrupTit.innerHTML = 'Gastos agrupados por ' + periodo;
    agrupDIV.append(agrupTit);

    for(let valor of Object.keys(agrup))
    {
        let datoDIV = document.createElement('div');
        datoDIV.className = 'agrupacion-dato';

        let datoClaveSPAN = document.createElement('span');
        datoClaveSPAN.className = 'agrupacion-dato-clave';
        datoClaveSPAN.innerHTML += `${valor}`;

        let datoValorSPAN = document.createElement('span');
        datoValorSPAN.className = 'agrupacion-dato-valor';
        datoValorSPAN.innerHTML += " " + agrup[valor] + " €";
        
        datoDIV.append(datoClaveSPAN);
        datoDIV.append(datoValorSPAN);
        agrupDIV.append(datoDIV);
    }

    
    elemento.append(agrupDIV);

    // Estilos
    elemento.style.width = "33%";
    elemento.style.display = "inline-block";
    // Crear elemento <canvas> necesario para crear la gráfica
    // https://www.chartjs.org/docs/latest/getting-started/
    let chart = document.createElement("canvas");
    // Variable para indicar a la gráfica el período temporal del eje X
    // En función de la variable "periodo" se creará la variable "unit" (anyo -> year; mes -> month; dia -> day)
    let unit = "";
    switch (periodo) {
    case "anyo":
        unit = "year";
        break;
    case "mes":
        unit = "month";
        break;
    case "dia":
    default:
        unit = "day";
        break;
    }

    // Creación de la gráfica
    // La función "Chart" está disponible porque hemos incluido las etiquetas <script> correspondientes en el fichero HTML
    const myChart = new Chart(chart.getContext("2d"), {
        // Tipo de gráfica: barras. Puedes cambiar el tipo si quieres hacer pruebas: https://www.chartjs.org/docs/latest/charts/line.html
        type: 'bar',
        data: {
            datasets: [
                {
                    // Título de la gráfica
                    label: `Gastos por ${periodo}`,
                    // Color de fondo
                    backgroundColor: "#555555",
                    // Datos de la gráfica
                    // "agrup" contiene los datos a representar. Es uno de los parámetros de la función "mostrarGastosAgrupadosWeb".
                    data: agrup
                }
            ],
        },
        options: {
            scales: {
                x: {
                    // El eje X es de tipo temporal
                    type: 'time',
                    time: {
                        // Indicamos la unidad correspondiente en función de si utilizamos días, meses o años
                        unit: unit
                    }
                },
                y: {
                    // Para que el eje Y empieza en 0
                    beginAtZero: true
                }
            }
        }
    });
    // Añadimos la gráfica a la capa
    elemento.append(chart);
}

function repintar()
{
   document.getElementById("presupuesto").innerHTML="";
   mostrarDatoEnId("presupuesto" , gestionPresupuesto.mostrarPresupuesto());

   document.getElementById("gastos-totales").innerHTML="";
   mostrarDatoEnId("gastos-totales" , gestionPresupuesto.calcularTotalGastos());

   document.getElementById("balance-total").innerHTML="";
   mostrarDatoEnId("balance-total" , gestionPresupuesto.calcularBalance());

   document.getElementById("listado-gastos-completo").innerHTML="";

   //gestionPresupuesto.listarGastos.array.forEach(element => mostrarGastoWeb("listado-gastos-completo", element));

   for(let element of gestionPresupuesto.listarGastos()){
    mostrarGastoWeb("listado-gastos-completo", element);
    }

    let gastosDia = gestionPresupuesto.agruparGastos("dia");
    mostrarGastosAgrupadosWeb("agrupacion-dia",gastosDia,"día");

    let gastosMes = gestionPresupuesto.agruparGastos("mes");
    mostrarGastosAgrupadosWeb("agrupacion-mes",gastosMes,"mes");

    let gastosAnyo = gestionPresupuesto.agruparGastos("anyo");
    mostrarGastosAgrupadosWeb("agrupacion-anyo",gastosAnyo,"año");
}

function actualizarPresupuestoWeb()
{
    let presup = prompt ("introducir presupuesto:", '');
    let res= parseFloat(presup);
    gestionPresupuesto.actualizarPresupuesto(res);
    repintar();
}



function nuevoGastoWeb()
{
    let descripcion = prompt("introducir descripcion:");
    let valor = parseFloat(prompt("introducir valor:"));
    let fecha = Date.parse(prompt("introducir fecha:"));
    let etiquetas = prompt("introducir etiquetas:").split(',');

    let gastonuevo = new gestionPresupuesto.CrearGasto(descripcion,valor,fecha,etiquetas);
    gestionPresupuesto.anyadirGasto(gastonuevo);
    repintar();

    let gastonew = document.getElementById('anyadirgasto');
    gastonew.addEventListener('click',nuevoGastoWeb);
};

function nuevoGastoWebFormulario(){
    let plantillaFormulario = document.getElementById("formulario-template").content.cloneNode(true);
    let form = plantillaFormulario.querySelector("form");

    let formControl = document.getElementById("controlesprincipales");
    formControl.appendChild(form);

    let btnAnyadir = document.getElementById("anyadirgasto-formulario");
    btnAnyadir.disabled = true;

    let btnEnviar = new EnviarFormHandle();
    form.addEventListener("submit", btnEnviar);

    let btnCancelar = formControl.querySelector("button.cancelar");
    let cancelar = new CancelarHandleFormulario();
    btnCancelar.addEventListener("click", cancelar);
};

function guardarGastosWeb(){
    let guardarGasto = gestionPresupuesto.listarGastos();
    localStorage.GestorGastosDWEC = JSON.stringify(guardarGasto);
};
let guardarListado = document.getElementById("guardar-gastos");
guardarListado.addEventListener("click", guardarGastosWeb);

function cargarGastosWeb(){
    if (localStorage.GestorGastosDWEC == null){
        gestionPresupuesto.cargarGastos([]);
    }else{
        gestionPresupuesto.cargarGastos(JSON.parse(localStorage.GestorGastosDWEC));
    }
    repintar();
};
let cargarFormulario = document.getElementById("cargar-gastos");
cargarFormulario.addEventListener("click", cargarGastosWeb);

function cargarGastosApi(){
    let nombreUsu = document.getElementById("nombre_usuario").value;
    let url = `https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/${nombreUsu}`;

    fetch (url, {method: 'GET'})

    .then (response => response.json())
    .then (data =>
        {
            console.log(data);
            gestionPresupuesto.cargarGastos(data);
            repintar();   
        })
    
    .catch (error => console.log(error));
};
let btncargarGastoApi = document.getElementById("cargar-gastos-api");
btncargarGastoApi.addEventListener('click',new cargarGastosApiHandle());

let filtrarGastosWeb = function (){
    this.handleEvent = function(event){
        event.preventDefault();

        let valorMinimo = this.form.elements["formulario-filtrado-valor-minimo"].value;
        let valorMaximo = this.form.elements["formulario-filtrado-valor-maximo"].value;
        let fechaDesde = this.form.elements["formulario-filtrado-fecha-desde"].value;
        let fechaHasta = this.form.elements["formulario-filtrado-fecha-hasta"].value;
        let descripcionContiene = this.form.elements["formulario-filtrado-descripcion"].value;
        let etiquetasTiene = this.form.elements["formulario-filtrado-etiquetas-tiene"].value;

        if (etiquetasTiene)
        {
            etiquetasTiene = gestionPresupuesto.transformarListadoEtiquetas(etiquetasTiene);
        }

        document.getElementById("listado-gastos-completo").innerHTML = "";

        let filtro = gestionPresupuesto.filtrarGastos({valorMinimo, valorMaximo, fechaDesde, fechaHasta, 
            descripcionContiene, etiquetasTiene});

        filtro.forEach(gasto => 
        {
            mostrarGastoWeb ("listado-gastos-completo", gasto);
        });
    } 
};
let formFiltrado = document.getElementById("formulario-filtrado");

let formFiltradoRes = new filtrarGastosWeb();
formFiltradoRes.form = formFiltrado;
formFiltrado.addEventListener('submit', formFiltradoRes);

function EditarHandle()
{
    this.handleEvent = function ()
    {
        let edFecha = Date.parse(prompt("introducir fecha en formato internacional: ", this.gasto.fecha));
        let edvalor = prompt ("Introducir valor: ", this.gasto.valor);
        let edDesc = prompt ("Introducir descripción: ", this.gasto.descripcion);
        let edetiquetas = prompt ("Introducir etiquetas separadas por ','", this.gasto.etiquetas).split(',');
        let res = parseFloat(edvalor);

        this.gasto.actualizarDescripcion(edDesc);
        this.gasto.actualizarFecha(edFecha);
        this.gasto.actualizarValor(res);
        this.gasto.anyadirEtiquetas(...edetiquetas);  
        repintar();
    };
};

function BorrarHandle()
{
    this.handleEvent = function (event)
    {
        gestionPresupuesto.borrarGasto(this.gasto.id);
        repintar();
    };
};

function BorrarEtiquetasHandle()
{
    this.handleEvent = function (event)
    {
        this.gasto.borrarEtiquetas(this.etiquetas);
        repintar();
    };
};

function EnviarFormHandle(){
    this.handleEvent = function(event){
        event.preventDefault();
        let form = event.currentTarget;
        let desc = form.elements.descripcion.value;
        let valor = parseFloat(form.elements.valor.value)
        let fecha = form.elements.fecha.value;
        let etiq = form.elements.etiquetas.value;

        let gastoEnviar = new gestionPresupuesto.CrearGasto(desc, valor, fecha, etiq);

        gestionPresupuesto.anyadirGasto(gastoEnviar);
        repintar();
        let id = document.getElementById("anyadirgasto-formulario");
        id.disabled = false;
    }
};

function CancelarHandleFormulario(){
    this.handleEvent = function(event){
        event.preventDefault();

        event.currentTarget.parentNode.remove();
        document.getElementById("anyadirgasto-formulario").removeAttribute("disabled");
        repintar();
    }
};

function EditarHandleFormulario(){
    this.handleEvent = function(event){
        let plantForm = document.getElementById("formulario-template").content.cloneNode(true);
        var form = plantForm.querySelector("form");

        let formControles = document.getElementById("controlesprincipales");
        formControles.append(form);

        let btnEditarForm = event.currentTarget;
        btnEditarForm.after(form);
        btnEditarForm.disabled = true;

        /*let btnEditarAPI = form.querySelector("button.gasto-enviar-api");
        let editAPI = new editarGastoApiHandle();
        editAPI.gasto = this.gasto;
        btnEditarAPI.addEventListener('click', editAPI);*/

        form.elements.descripcion.value = this.gasto.descripcion;
        form.elements.valor.value = this.gasto.valor;
        form.elements.fecha.value = this.gasto.fecha
        form.elements.etiquetas.value = this.gasto.etiquetas;

        let envForm = new EditarHandleFormSubm();
        envForm.gasto = this.gasto;
        form.addEventListener('submit', envForm);

        let cancelForm = new CancelarHandleFormulario();
        let btnCancelHandle = form.querySelector("button.cancelar");
        btnCancelHandle.addEventListener('click', cancelForm);
    }
};

function EditarHandleFormSubm(){
    this.handleEvent = function(event){
        event.preventDefault();
        let form = event.currentTarget;

        let descripcion = form.elements.descripcion.value;
        this.gasto.actualizarDescripcion(descripcion);

        let valor = parseFloat(form.elements.valor.value);
        this.gasto.actualizarValor(valor);

        let fecha = form.elements.fecha.value;
        this.gasto.actualizarFecha(fecha);

        let etiq = form.elements.etiquetas.value;
        this.gasto.anyadirEtiquetas(etiq);
        repintar();
    }
};
actualizarpresupuesto.addEventListener("click",actualizarPresupuestoWeb);
anyadirgasto.addEventListener("click",nuevoGastoWeb);

let anyadirgastoForm = document.getElementById("anyadirgasto-formulario");
anyadirgastoForm.addEventListener('click', nuevoGastoWebFormulario);

function cargarGastosApiHandle(){
    this.handleEvent = function(event)    {
        event.preventDefault();
        cargarGastosApi();
    }
};

function borrarApiHandle()
{
    this.handleEvent = function(event)
    {
        event.preventDefault();
        let userName = document.getElementById("nombre_usuario").value;
        let url = `https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/${userName}`;

        fetch(url +"/"+this.gasto.gastoId, {method: 'Delete'})
            .then(response => response.json())
            .then(data => {
                console.log(data);
                gestionPresupuesto.borrarGasto(this.gasto.gastoId);
            })
            .then (cargarGastosApi())
            .catch(error => console.log(error))
    }
};

export{
    mostrarDatoEnId,
    mostrarGastoWeb,
    mostrarGastosAgrupadosWeb,
    repintar,
    actualizarPresupuestoWeb,
    nuevoGastoWeb,
    nuevoGastoWebFormulario,
    guardarGastosWeb,
    cargarGastosWeb,
    cargarGastosApi,
    EditarHandle,
    BorrarHandle,
    BorrarEtiquetasHandle,
    EnviarFormHandle,
    EditarHandleFormulario,
    CancelarHandleFormulario,
    EditarHandleFormSubm,
    cargarGastosApiHandle,
    borrarApiHandle, 
}