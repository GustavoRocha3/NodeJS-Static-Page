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