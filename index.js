const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const path = require('path')

const app = express();

const Posts = require('./Posts')

mongoose.connect('mongodb+srv://root:tKl8SZeV7pEFIyQS@cluster0.nkyzl.mongodb.net/dankicode?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('Conectado com sucesso');
}).catch((err)=>{
    console.log(err.message);
});

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

app.get('/', (req,res) => {

    // console.log(req.query.busca)

    if(req.query.busca == null){
        Posts.find({}).exec()
        .then((posts) => {
            posts = posts.map((val) =>{
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })
            res.render('home',{posts:posts});
        }).catch((err) => {
            console.log(err.message);
        })
    }else{
        res.render('busca',{});
    }

})

app.get('/:slug', (req,res) => {
    // res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new: true})
    .then(resposta => {
        console.log(resposta);
        res.render('single',{noticia:resposta});
    })
    .catch(err => {
        console.log(err.message)
    })
        
    

})

app.listen(5000, () =>{
    console.log('server rodando!');
});