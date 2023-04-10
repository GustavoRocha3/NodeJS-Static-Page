const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const defaultJs = require('./public/javascripts/default');

const path = require('path')

const app = express();

const Posts = require('./Posts');
const Users = require('./Users');

//conexão com mongodb utilizando o mongoose
mongoose.connect('mongodb+srv://admin:mega6401@cluster0.nkyzl.mongodb.net/dankicode?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
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

function getNews(res, login) {
    Posts.find({}).sort({'_id': -1}).exec()
        .then((posts, auth) => {
            auth = {login: login};
            posts = posts.map((val) =>{
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            });
            console.log(auth)
            //requisição para ordenar criar o card de Mais Lidas por ordem de mais visualizadas
            Posts.find({}).sort({'views': -1}).limit(3).exec()
            .then((postsTop) => {
                postsTop = postsTop.map((val) => {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,35),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
                res.render('home',{posts:posts,postsTop:postsTop});

            }).catch((err) => {
                console.log(err.message);
            })

        }).catch((err) => {
            console.log(err.message);
        })
}

app.get('/', (req,res) => {

    // console.log(req.query.busca)

    if(req.query.busca == null){
        //requisição para trazer todas as noticias, da mais nova para a mais antiga
        getNews(res);
    }else{

        Posts.find({titulo: {$regex: req.query.busca, $options:"i"}})
        .then((posts) =>{
            // console.log(posts)
            res.render('busca',{posts:posts, contagem:posts.length});
        })
        .catch((err) => {
            console.log(err.message);
        })

    }

})

app.get('/login', (req,res) => {
    res.render('login')
})

app.post('/login', async (req,res) => {
    const {usuario, senha} = req.body;

    const user = await Users.findOne({ usuario });

    // console.log(user, await bcrypt.hash(user.senha,10));


    if(!user || !await bcrypt.compare(senha, user.senha)){
        return res.status(401).json({ message: 'Usuário e/ou senha inválido'});
    } else {
        getNews(res, user.nome);
        console.log(user.nome)
    }

})

app.get('/writeArticle', (req,res) => {
    res.render('writeArticle')
})

app.get('/categorias', (req,res) => {
    res.render('categorias')
})

//acessa a notícia selecionada
app.get('/:slug', (req,res) => {
    //requisição para atualizar a quantidade de views
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new: true})
    .then(resposta => {
        if(resposta != null){
            // traz as informações de todas as noticias para mostrar na tela
            Posts.find({}).sort({'views': -1}).limit(3).exec()
            .then((postsTop) => {
                postsTop = postsTop.map((val) => {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,35),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
                res.render('single',{noticia:resposta, postsTop:postsTop});

            }).catch((err) => {
                console.log(err.message);
            })
        } else {
            res.redirect('/');
        }
    })
    .catch(err => {
        console.log(err.message)
    })
        
    

})

app.listen(5000, () =>{
    console.log('server rodando!');
});