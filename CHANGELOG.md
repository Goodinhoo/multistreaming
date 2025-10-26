# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Não Versão] - 2024

### Adicionado
- Sistema de layout responsivo para cards de streamers nas opções
  - 2 colunas em telas de 1920px
  - 3 colunas em telas de 3440px
  - Modal ajustável conforme resolução

- Correções no chat da Twitch
  - Tema escuro nativo do embed (`darkpopout`)
  - Permitir envio de mensagens (atributos `sandbox` e `allow`)
  - Ajuste do parâmetro `parent` para localhost e produção

- Ajustes de largura das colunas
  - Largura padrão do chat: 350px
  - Largura padrão da sidebar: 350px

- Sistema de notificações completo
  - Notificações de desktop (Windows)
  - Sons personalizados de notificação
  - Múltiplos arquivos de som disponíveis (`public/sounds/`)
  - Volume configurável para notificações
  - Opção "notificar apenas favoritos"
  - Teste de som integrado nas opções

- Sistema de colunas redimensionáveis
  - Drag-and-drop para redimensionar sidebar e chat
  - Botões de reset para voltar ao tamanho padrão
  - Botões toggle para ocultar/mostrar colunas
  - Coluna de streams sempre no meio, independente da posição do chat

- Sistema de animações
  - Toggle para ativar/desativar animações globalmente
  - Ícone de configurações rotacionando quando animações ativas
  - Pulse animation nos cards de streamers no hover
  - Suporte para animate.css
  - CSS otimizado para desabilitar todas as animações quando necessário

- Sistema de favoritos
  - Marcar/desmarcar streamers como favoritos
  - Filtro por favoritos na sidebar
  - Indicador visual de favoritos

- Sistema de notificações por streamer
  - Toggle individual de notificações por streamer
  - Indicador visual (sino) nos cards

- Layout otimizado dos cards de streamers
  - Botões de plataforma em scroll horizontal
  - Botões de ação (notificação, favorito, deletar) em linha separada
  - Cards mais compactos

- Sistema de backup e importação
  - Exportar dados em JSON
  - Importar dados de backup
  - Limpar todos os dados

- Interface responsiva
  - Scrollbars personalizadas
  - Animações suaves
  - Tema escuro consistente

### Modificado
- Modal de opções com layout responsivo para streamers
- Grid de streamers ajustado para diferentes resoluções
- Chat da Twitch com tema escuro nativo
- Larguras padrão de colunas ajustadas

### Corrigido
- Autoplay do Twitch não funcionava (requer interação manual)
- Cards desapareciam rapidamente ao remover cursor (corrigido com transições suaves)
- Chat da Twitch não permitia envio de mensagens (corrigido com atributos `sandbox`)
- Notificações não funcionavam no Opera GX (instruções adicionadas)
- Random notification sounds (corrigido com controle de instâncias de áudio)
- Animações não desabilitavam completamente (corrigido com CSS mais agressivo)
- Direção de redimensionamento invertida (corrigido para chat e sidebar)
- Delete icon saindo dos cards quando múltiplas plataformas (corrigido com novo layout)

### Melhorado
- UI/UX geral
- Performance das animações
- Responsividade do layout
- Experiência do usuário nas opções

---

**Nota**: Este changelog será atualizado conforme novas funcionalidades forem implementadas.

