import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const JWT_SECRET = 'innyx-secret-key-demo'

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `produto-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Dados mock
let usuarios = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@innyx.com',
    senha: bcrypt.hashSync('123456', 10),
    role: 'admin'
  }
]

let categorias = [
  { id: 1, nome: 'Eletrônicos', created_at: '2024-01-15T10:00:00Z' },
  { id: 2, nome: 'Roupas', created_at: '2024-01-15T10:00:00Z' },
  { id: 3, nome: 'Casa e Jardim', created_at: '2024-01-15T10:00:00Z' },
  { id: 4, nome: 'Livros', created_at: '2024-01-15T10:00:00Z' },
  { id: 5, nome: 'Esportes', created_at: '2024-01-15T10:00:00Z' }
]

let produtos = [
  {
    id: 1,
    nome: 'Smartphone Samsung Galaxy',
    descricao: 'Smartphone com 128GB de armazenamento, câmera tripla e tela AMOLED de 6.1 polegadas.',
    preco: 1299.99,
    data_validade: '2025-12-31',
    imagem: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoria_id: 1,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    nome: 'Camiseta Polo Masculina',
    descricao: 'Camiseta polo de algodão 100%, confortável e elegante para o dia a dia.',
    preco: 89.90,
    data_validade: '2025-06-30',
    imagem: 'https://images.pexels.com/photos/769733/pexels-photo-769733.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoria_id: 2,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 3,
    nome: 'Notebook Dell Inspiron',
    descricao: 'Notebook com processador Intel i5, 8GB RAM, 256GB SSD e tela de 15.6 polegadas.',
    preco: 2899.99,
    data_validade: '2026-01-31',
    imagem: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
    categoria_id: 1,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 4,
    nome: 'Livro - Arquitetura Limpa',
    descricao: 'Guia do artesão para estrutura e design de software por Robert C. Martin.',
    preco: 79.90,
    data_validade: '2030-12-31',
    imagem: 'https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoria_id: 4,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 5,
    nome: 'Tênis Nike Air Max',
    descricao: 'Tênis esportivo com tecnologia Air Max, ideal para corrida e caminhada.',
    preco: 299.99,
    data_validade: '2025-08-15',
    imagem: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoria_id: 5,
    created_at: '2024-01-15T10:00:00Z'
  }
]

let nextProdutoId = 6
let nextCategoriaId = 6

// Middleware de autenticação
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body
    
    const usuario = usuarios.find(u => u.email === email)
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }
    
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    const { senha: _, ...usuarioSemSenha } = usuario
    
    res.json({
      token,
      usuario: usuarioSemSenha
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

app.get('/api/auth/me', auth, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.user.id)
  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado' })
  }
  
  const { senha: _, ...usuarioSemSenha } = usuario
  res.json(usuarioSemSenha)
})

// Rotas de categorias
app.get('/api/categorias', auth, (req, res) => {
  res.json(categorias)
})

app.post('/api/categorias', auth, (req, res) => {
  const { nome } = req.body
  
  if (!nome || nome.length > 100) {
    return res.status(400).json({ message: 'Nome é obrigatório e deve ter no máximo 100 caracteres' })
  }
  
  const novaCategoria = {
    id: nextCategoriaId++,
    nome,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  categorias.push(novaCategoria)
  res.status(201).json(novaCategoria)
})

app.put('/api/categorias/:id', auth, (req, res) => {
  const id = parseInt(req.params.id)
  const { nome } = req.body
  
  const categoriaIndex = categorias.findIndex(c => c.id === id)
  if (categoriaIndex === -1) {
    return res.status(404).json({ message: 'Categoria não encontrada' })
  }
  
  if (!nome || nome.length > 100) {
    return res.status(400).json({ message: 'Nome é obrigatório e deve ter no máximo 100 caracteres' })
  }
  
  categorias[categoriaIndex] = {
    ...categorias[categoriaIndex],
    nome,
    updated_at: new Date().toISOString()
  }
  
  res.json(categorias[categoriaIndex])
})

app.delete('/api/categorias/:id', auth, (req, res) => {
  const id = parseInt(req.params.id)
  
  const categoriaIndex = categorias.findIndex(c => c.id === id)
  if (categoriaIndex === -1) {
    return res.status(404).json({ message: 'Categoria não encontrada' })
  }
  
  // Verificar se há produtos usando esta categoria
  const produtosUsandoCategoria = produtos.filter(p => p.categoria_id === id)
  if (produtosUsandoCategoria.length > 0) {
    return res.status(400).json({ message: 'Não é possível excluir categoria que possui produtos' })
  }
  
  categorias.splice(categoriaIndex, 1)
  res.status(204).send()
})

// Rotas de produtos
app.get('/api/produtos', auth, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const perPage = parseInt(req.query.per_page) || 10
  const search = req.query.search || ''
  const categoriaId = req.query.categoria_id ? parseInt(req.query.categoria_id) : null
  
  let produtosFiltrados = produtos
  
  // Filtro por busca
  if (search) {
    produtosFiltrados = produtosFiltrados.filter(p => 
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.descricao.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Filtro por categoria
  if (categoriaId) {
    produtosFiltrados = produtosFiltrados.filter(p => p.categoria_id === categoriaId)
  }
  
  // Adicionar informações da categoria
  const produtosComCategoria = produtosFiltrados.map(produto => ({
    ...produto,
    categoria: categorias.find(c => c.id === produto.categoria_id)
  }))
  
  // Paginação
  const total = produtosComCategoria.length
  const lastPage = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const end = start + perPage
  
  const produtosPaginados = produtosComCategoria.slice(start, end)
  
  res.json({
    data: produtosPaginados,
    total,
    current_page: page,
    per_page: perPage,
    last_page: lastPage
  })
})

app.get('/api/produtos/:id', auth, (req, res) => {
  const id = parseInt(req.params.id)
  const produto = produtos.find(p => p.id === id)
  
  if (!produto) {
    return res.status(404).json({ message: 'Produto não encontrado' })
  }
  
  const produtoComCategoria = {
    ...produto,
    categoria: categorias.find(c => c.id === produto.categoria_id)
  }
  
  res.json(produtoComCategoria)
})

app.post('/api/produtos', auth, upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco, data_validade, categoria_id } = req.body
  
  // Validações
  if (!nome || nome.length > 50) {
    return res.status(400).json({ message: 'Nome é obrigatório e deve ter no máximo 50 caracteres' })
  }
  
  if (!descricao || descricao.length > 200) {
    return res.status(400).json({ message: 'Descrição é obrigatória e deve ter no máximo 200 caracteres' })
  }
  
  const precoNum = parseFloat(preco)
  if (!preco || precoNum <= 0) {
    return res.status(400).json({ message: 'Preço deve ser um valor positivo' })
  }
  
  if (!data_validade || new Date(data_validade) <= new Date()) {
    return res.status(400).json({ message: 'Data de validade deve ser posterior à data atual' })
  }
  
  const categoriaIdNum = parseInt(categoria_id)
  if (!categoria_id || !categorias.find(c => c.id === categoriaIdNum)) {
    return res.status(400).json({ message: 'Categoria é obrigatória e deve existir' })
  }
  
  const novoProduto = {
    id: nextProdutoId++,
    nome,
    descricao,
    preco: precoNum,
    data_validade,
    categoria_id: categoriaIdNum,
    imagem: req.file ? `/uploads/${req.file.filename}` : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  produtos.push(novoProduto)
  
  const produtoComCategoria = {
    ...novoProduto,
    categoria: categorias.find(c => c.id === novoProduto.categoria_id)
  }
  
  res.status(201).json(produtoComCategoria)
})

app.post('/api/produtos/:id', auth, upload.single('imagem'), (req, res) => {
  const id = parseInt(req.params.id)
  const { nome, descricao, preco, data_validade, categoria_id } = req.body
  
  const produtoIndex = produtos.findIndex(p => p.id === id)
  if (produtoIndex === -1) {
    return res.status(404).json({ message: 'Produto não encontrado' })
  }
  

  if (!nome || nome.length > 50) {
    return res.status(400).json({ message: 'Nome é obrigatório e deve ter no máximo 50 caracteres' })
  }
  
  if (!descricao || descricao.length > 200) {
    return res.status(400).json({ message: 'Descrição é obrigatória e deve ter no máximo 200 caracteres' })
  }
  
  const precoNum = parseFloat(preco)
  if (!preco || precoNum <= 0) {
    return res.status(400).json({ message: 'Preço deve ser um valor positivo' })
  }
  
  if (!data_validade || new Date(data_validade) <= new Date()) {
    return res.status(400).json({ message: 'Data de validade deve ser posterior à data atual' })
  }
  
  const categoriaIdNum = parseInt(categoria_id)
  if (!categoria_id || !categorias.find(c => c.id === categoriaIdNum)) {
    return res.status(400).json({ message: 'Categoria é obrigatória e deve existir' })
  }
  
  produtos[produtoIndex] = {
    ...produtos[produtoIndex],
    nome,
    descricao,
    preco: precoNum,
    data_validade,
    categoria_id: categoriaIdNum,
    imagem: req.file ? `/uploads/${req.file.filename}` : produtos[produtoIndex].imagem,
    updated_at: new Date().toISOString()
  }
  
  const produtoComCategoria = {
    ...produtos[produtoIndex],
    categoria: categorias.find(c => c.id === produtos[produtoIndex].categoria_id)
  }
  
  res.json(produtoComCategoria)
})

app.delete('/api/produtos/:id', auth, (req, res) => {
  const id = parseInt(req.params.id)
  
  const produtoIndex = produtos.findIndex(p => p.id === id)
  if (produtoIndex === -1) {
    return res.status(404).json({ message: 'Produto não encontrado' })
  }
  
  produtos.splice(produtoIndex, 1)
  res.status(204).send()
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`)
  console.log(`📍 Base URL: http://localhost:${PORT}/api`)
  console.log(`👤 Login demo: admin@innyx.com / 123456`)
})