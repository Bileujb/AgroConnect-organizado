package br.com.agroconnect;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {
    private static final Logger log = LoggerFactory.getLogger(PerfilService.class);
    final Banco banco;
    public PerfilService(Banco banco) { this.banco = banco; }
    static String texto(Map<String,?> dados, String campo) {
        Object valor = dados.get(campo); return valor instanceof String ? valor.toString().trim() : "";
    }
    static String seguro(String valor) { return valor == null ? "" : valor.trim(); }
    static void validarEndereco(String tipo, String fazenda, String cnpj, String enderecoFazenda, String enderecoEntrega) {
        if (tipo.equals("produtor")) {
            if (seguro(fazenda).isBlank() || seguro(enderecoFazenda).isBlank() || !seguro(cnpj).replaceAll("\\D", "").matches("[0-9]{14}")) {
                throw ApiException.invalido("Preencha nome da fazenda, CNPJ com 14 números e endereço da fazenda.");
            }
        } else if (seguro(enderecoEntrega).isBlank()) throw ApiException.invalido("Informe o endereço de entrega.");
    }
    @SuppressWarnings("unchecked")
    public Map<String,Object> obterOuCriar(Map<String,Object> auth) {
        UUID id = UUID.fromString(auth.get("id").toString());
        String email = texto(auth, "email");
        var existentes = banco.listar("select * from agroconnect.usuarios where id = ?", id);
        if (existentes.isEmpty()) {
            Map<String,Object> meta = auth.get("user_metadata") instanceof Map ? (Map<String,Object>) auth.get("user_metadata") : Map.of();
            // São perfis públicos do marketplace, nunca papéis administrativos.
            String tipo = "produtor".equals(meta.get("tipoUsuario")) ? "produtor" : "consumidor";
            String nome = texto(meta, "nome");
            if (nome.isBlank()) nome = email.contains("@") ? email.substring(0, email.indexOf('@')) : "Minha conta";
            banco.jdbc.update("""
                insert into agroconnect.usuarios (id,nome,email,tipo_usuario,cidade,nome_fazenda,cnpj,endereco_fazenda,endereco_entrega)
                values (?,?,?,?,?,?,?,?,?) on conflict (id) do nothing
                """, id, nome, email, tipo, texto(meta,"cidade"), texto(meta,"nomeFazenda"),
                texto(meta,"cnpj"), texto(meta,"enderecoFazenda"), texto(meta,"enderecoEntrega"));
        }
        if (!existentes.isEmpty() && existentes.get(0).get("excluidoEm") != null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Esta conta foi excluída.");
        }
        // O e-mail vem do Auth validado, não de um campo editável do aplicativo.
        banco.jdbc.update("update agroconnect.usuarios set email=? where id=? and email<>?", email, id, email);
        return banco.um("select * from agroconnect.usuarios where id=?", id);
    }
    public Map<String,Object> atualizar(Map<String,Object> usuario, Dados.Perfil dados) {
        validarEndereco(usuario.get("tipoUsuario").toString(), dados.nomeFazenda(), dados.cnpj(), dados.enderecoFazenda(), dados.enderecoEntrega());
        banco.jdbc.update("""
            update agroconnect.usuarios set nome=?,cidade=?,nome_fazenda=?,cnpj=?,endereco_fazenda=?,endereco_entrega=? where id=?
            """, dados.nome().trim(), dados.cidade().trim(), seguro(dados.nomeFazenda()), seguro(dados.cnpj()).replaceAll("\\D", ""),
            seguro(dados.enderecoFazenda()), seguro(dados.enderecoEntrega()), Banco.id(usuario));
        return banco.um("select * from agroconnect.usuarios where id=?", Banco.id(usuario));
    }
    @Transactional
    public void excluir(Map<String,Object> usuario) {
        UUID id = Banco.id(usuario);
        banco.um("select id from agroconnect.usuarios where id=? for update", id);
        banco.jdbc.update("update agroconnect.produtos set ativo=false where produtor_id=?", id);
        Long ativos = banco.jdbc.queryForObject("""
            select count(*) from agroconnect.pedidos
            where (consumidor_id=? or produtor_id=?) and status in ('aguardando','confirmado','em_rota')
            """, Long.class, id, id);
        if (ativos != null && ativos > 0) {
            throw ApiException.conflito("Você tem pedidos em andamento. Conclua ou cancele esses pedidos antes de excluir a conta.");
        }
        banco.jdbc.update("update agroconnect.avaliacoes set comentario='' where consumidor_id=?", id);
        banco.jdbc.update("""
            update agroconnect.usuarios set nome='Conta excluída',email='',cidade='',nome_fazenda='',cnpj='',
            endereco_fazenda='',endereco_entrega='',excluido_em=now() where id=?
            """, id);
        try {
            banco.jdbc.update("delete from auth.users where id=?", id);
        } catch (DataAccessException erro) {
            log.error("Falha ao excluir usuário do Auth: {}", erro.getClass().getSimpleName());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível excluir a conta agora. Tente novamente mais tarde.");
        }
    }
}
