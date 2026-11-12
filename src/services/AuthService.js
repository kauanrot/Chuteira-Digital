const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { AppError, ConflictError, UnauthorizedError } = require('../errors');

const CUSTO_BCRYPT = 10;
const SENHA_MINIMA = 8;
// Hash de uma senha qualquer: usado para gastar o mesmo tempo quando o e-mail
// nao existe, sem revelar pela demora quais e-mails estao cadastrados.
const HASH_FALSO = bcrypt.hashSync('senha-que-ninguem-usa', CUSTO_BCRYPT);

/** Autenticacao (JWT + bcrypt) e cadastro de usuarios. */
class AuthService {
  constructor(usuarioRepo, { segredo, expiraEm = '8h', custo = CUSTO_BCRYPT } = {}) {
    if (!segredo) throw new Error('Segredo do JWT nao configurado (JWT_SECRET).');
    this.usuarioRepo = usuarioRepo;
    this.segredo = segredo;
    this.expiraEm = expiraEm;
    this.custo = custo;
  }

  async cadastrar({ nome, email, senha, perfil } = {}) {
    if (typeof senha !== 'string' || senha.length < SENHA_MINIMA) {
      throw new AppError(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`, 400);
    }
    let usuario;
    try {
      usuario = new Usuario({ nome, email, perfil, senhaHash: await bcrypt.hash(senha, this.custo) });
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    if (await this.usuarioRepo.buscarPorEmail(usuario.email)) {
      throw new ConflictError('Ja existe um usuario com este e-mail.');
    }
    return this.usuarioRepo.salvar(usuario);
  }

  async login({ email, senha } = {}) {
    if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
      throw new AppError('Informe e-mail e senha.', 400);
    }
    const usuario = await this.usuarioRepo.buscarPorEmail(email);
    const confere = await bcrypt.compare(senha, usuario ? usuario.senhaHash : HASH_FALSO);
    // Mesma mensagem para e-mail inexistente e senha errada.
    if (!usuario || !confere) throw new UnauthorizedError('E-mail ou senha incorretos.');
    return { token: this.gerarToken(usuario), usuario };
  }

  gerarToken(usuario) {
    return jwt.sign({ perfil: usuario.perfil }, this.segredo, {
      subject: String(usuario.id),
      expiresIn: this.expiraEm,
      algorithm: 'HS256',
    });
  }

  /** Devolve o usuario dono do token, ou lanca 401. */
  async autenticar(token) {
    let dados;
    try {
      dados = jwt.verify(token, this.segredo, { algorithms: ['HS256'] });
    } catch (e) {
      throw new UnauthorizedError(e.name === 'TokenExpiredError'
        ? 'Sessao expirada. Entre novamente.'
        : 'Token invalido.');
    }
    // Busca no banco a cada requisicao: usuario removido ou com perfil alterado
    // perde o acesso antigo mesmo com um token ainda valido.
    const usuario = await this.usuarioRepo.buscarPorId(dados.sub);
    if (!usuario) throw new UnauthorizedError('Usuario nao encontrado.');
    return usuario;
  }

  async listar() {
    return this.usuarioRepo.listar();
  }

  /** Cria o primeiro administrador quando ainda nao ha nenhum usuario. */
  async garantirAdminInicial({ nome = 'Administrador', email, senha } = {}) {
    if ((await this.usuarioRepo.contar()) > 0) return null;
    if (!email || !senha) return null;
    return this.cadastrar({ nome, email, senha, perfil: 'ADMIN' });
  }
}

module.exports = AuthService;
