function tirarDados() {
    const dado1 = Math.floor(Math.random() * 6) + 1;  
    const dado2 = Math.floor(Math.random() * 6) + 1;  
    const dado3 = Math.floor(Math.random() * 6) + 1;
    const dado4 = Math.floor(Math.random() * 6) + 1;    
    const dado5 = Math.floor(Math.random() * 6) + 1;  
    const dado6 = Math.floor(Math.random() * 6) + 1;  


    return { dado1, dado2 };  
}

function tirarDados2() {

    const dado1 = Math.floor(Math.random() * 6) + 1;  
    const dado2 = Math.floor(Math.random() * 6) + 1;  
    const dado3 = Math.floor(Math.random() * 6) + 1;
    const dado4 = Math.floor(Math.random() * 6) + 1;    
    const dado5 = Math.floor(Math.random() * 6) + 1;  
    const dado6 = Math.floor(Math.random() * 6) + 1;  

    
    return { dado1, dado2, dado3, dado4, dado5, dado6 };  
}

module.exports = { tirarDados, tirarDados2 };