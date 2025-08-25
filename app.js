const fs = require("fs")
const EventEmitter = require("events")
const os = require("os")
const path = require("path")
const { URL } = require("url")

const emitter = new EventEmitter()

const pastaTeste = path.join(__dirname, "minha_pasta")
if (!fs.existsSync(pastaTeste)) {
    fs.mkdirSync(pastaTeste, { recursive: true })
    
    const arquivosExemplo = [
        "documento.txt",
        "foto.jpg", 
        "script.js",
        "planilha.xlsx",
        "apresentacao.pptx",
        "arquivo_sem_extensao",
        "config.json",
        "estilo.css"
    ]
    
    arquivosExemplo.forEach(arquivo => {
        fs.writeFileSync(path.join(pastaTeste, arquivo), `Conteúdo do arquivo: ${arquivo}`)
    })
    
    console.log("Pasta 'minha_pasta' criada com arquivos de exemplo!")
}

function organizarArquivos(pastaInput) {
    const pasta = path.isAbsolute(pastaInput) ? pastaInput : path.join(__dirname, pastaInput)
    
    if (!fs.existsSync(pasta)) {
        console.error(`Erro: A pasta "${pastaInput}" não existe!`)
        console.log(`Tente usar: "minha_pasta" (já criada automaticamente)`)
        console.log(`Ou crie uma pasta manualmente no diretório: ${__dirname}`)
        return
    }
    
    if (!fs.statSync(pasta).isDirectory()) {
        console.error(`Erro: "${pastaInput}" não é uma pasta!`)
        return
    }
    
    fs.readdir(pasta, (err, arquivos) => {
        if (err) {
            console.error("Erro ao ler a pasta:", err)
            return
        }
        
        let arquivosProcessados = 0
        let totalArquivos = 0
        
        arquivos.forEach(arquivo => {
            const caminhoCompleto = path.join(pasta, arquivo)
            if (fs.statSync(caminhoCompleto).isFile()) {
                totalArquivos++
            }
        })
        
        if (totalArquivos === 0) {
            console.log("A pasta está vazia ou só contém subpastas!")
            return
        }
        
        console.log(`Encontrados ${totalArquivos} arquivos para organizar...`)
        
        arquivos.forEach(arquivo => {
            const caminhoCompleto = path.join(pasta, arquivo)
            
            if (!fs.statSync(caminhoCompleto).isFile()) {
                arquivosProcessados++
                if (arquivosProcessados === arquivos.length) {
                    console.log("Processamento concluído!")
                }
                return
            }
            
            const extensao = path.extname(arquivo).toLowerCase() || '.sem_extensao'
            const nomePastaExtensao = extensao.substring(1) || 'sem_extensao'
            
            const pastaDestino = path.join(pasta, nomePastaExtensao)
            
            if (!fs.existsSync(pastaDestino)) {
                fs.mkdirSync(pastaDestino, { recursive: true })
            }
            
            const novoCaminho = path.join(pastaDestino, arquivo)
            const novaLocalizacao = path.resolve(novoCaminho)
            
            fs.rename(caminhoCompleto, novoCaminho, (err) => {
                if (err) {
                    console.error("Erro ao mover arquivo:", err)
                    arquivosProcessados++
                    return
                }
                
                emitter.emit("arquivoMovido", {
                    nome: path.basename(arquivo),
                    novaLocalizacao: novaLocalizacao,
                    usuario: os.userInfo().username,
                    url: new URL('file://' + novaLocalizacao).href
                })
                
                arquivosProcessados++
                
                if (arquivosProcessados === totalArquivos) {
                    console.log("\nOrganização concluída!")
                }
            })
        })
    })
}

emitter.on("arquivoMovido", (dados) => {
    console.log(`\nArquivo "${dados.nome}" movido para ${dados.novaLocalizacao}`)
    console.log("Usuário:", dados.usuario)
    console.log("URL do arquivo:", dados.url)
})

console.log("Diretório atual:", __dirname)
console.log("Pasta 'minha_pasta' criada com arquivos de exemplo!")

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

readline.question('Digite a pasta a ser organizada: ', (pasta) => {
    organizarArquivos(pasta)
    readline.close()
})