require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const User = require('./Model/User')

//rota inicial
app.get('/', (req, res) => {
    res.status(200).json({
        mensagem: "Turma das 9 criou a API"
    })
} )

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.set("strictQuery", false)

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.xtrtmh3.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    app.listen(3000)
    console.log("Conexão realizada com sucesso!")
} ).catch((err) => console.log(err) )

//criacao da rota de registro do usuário
app.post('/auth/register', async(req, res) => {
    const { name, email, password, confirmPassword } = req.body

    //validação
    if(!name) {
        return res.status(422).json({ mensagem: "Nome obrigatório"})
    }
    if(!email){
        return res.status(422).json({ mensagem: "O e-mail é obrigatório" })
    }
    if(!password){
        return res.status(422).json({ mensagem: "A senha é obrigatória" })
    }
    if(confirmPassword !== password){
        return res.status(422).json({ mensagem: "As senhas não conferem" })
    }

    //verifica se o usuario existe
    const userExists = await User.findOne({email: email})
    if(userExists){
        return res.status(422).json({ mensagem: "Utilize outro e-mail" })
    }

    //cria a hash da senha ou a cript
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //criar usuario
    const user = new User({
        name,
        email, 
        password: passwordHash
    })
    try{
        await user.save()
        res.status(201).json({mensagem: "Usuário criado com sucesso!"})
    } catch (err){
        console.log(err)
    }
} )

//rota de login
app.post('/auth/login', async(req, res) => {
    const { email, password } = req.body
    if(!email){
        return res.status(422).json({ mensagem: "E-mail é obrigatório"})
    }
    if(!password){
        return res.status(422).json({mensagem: "A senha é obrigatória" })
    }

    //verifica se o usuairo existe
    const user = await User.findOne({email: email})
    if(!user){
        return res.status(422).json({mensagem: "Usuario não existe" })
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    if(!checkPassword){
        return res.status(422).json({mensagem: "Senha incorreta!"})
    }

} )
