var nome = "A confusão";  

var filme = {  
    nome:"O Iluminado",
    ano:1980,
    diretor: "Stanley Kubrick",
    iniciar: function(){
        console.log(this.nome + " está começando: REDRUM!");
    },
    finalizar: function(){
        console.log(this.nome + "acabou.");
    }
};
var iniciar = filme.iniciar;

filme.iniciar(); //Caso 1: O Iluminado está começando: REDRUM!  
iniciar(); //Caso 2: A confusão está começando!

