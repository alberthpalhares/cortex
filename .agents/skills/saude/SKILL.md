---
name: saude
description: "Faz um raio-x da estrutura do Córtex: pilares ausentes, marcadores REVISAR pendentes, META.md desatualizado e um índice de completude. Acione com: 'saúde do córtex', 'diagnóstico', 'cortex doctor', 'o que falta preencher'."
---

# Skill: Saúde do Córtex

Esta skill não julga o conteúdo do negócio — ela audita a **estrutura** do Córtex e aponta lacunas de preenchimento, para o usuário saber exatamente o que falta completar (comum depois de um onboarding em modo Quickstart).

## Passo a Passo

1. **Verifique se o Córtex existe.** Se não houver `Memoria/META.md`, informe que o Córtex ainda não foi montado e ofereça iniciar o onboarding. Pare aqui.

2. **Leia `Memoria/META.md`** e extraia o Mapa de Arquivos declarado ali.

3. **Liste os arquivos reais** em `Pilares/` e `Memoria/` (nomes, não conteúdo).

4. **Compare o mapa do META com a realidade do disco:**
   - Arquivos no mapa que não existem no disco → `❌ Quebrado`
   - Arquivos no disco que não estão no mapa → `⚠️ Não indexado`
   - Os 6 pilares obrigatórios (`01` a `06`) que não existem → `🔴 Faltando (obrigatório)`

5. **Leia cada arquivo em `Pilares/`** e conte quantos marcadores `<!-- REVISAR -->` ou seções em branco (título seguido só de comentário HTML) cada um tem.

6. **Verifique a camada do system prompt:**
   - Se `Frameworks/CEREBRO.md` existir → formato atual (fonte única). Confirme que os 5 arquivos de raiz existem.
   - Se não existir mas os 5 arquivos de raiz (`GEMINI.md` etc.) tiverem conteúdo completo → formato antigo, funcional, mas sugira migrar via `revisar córtex`.

7. **Calcule um índice de completude simples:** proporção de pilares obrigatórios sem nenhum marcador `REVISAR` restante. Não invente decimais de precisão — arredonde para a dezena mais próxima (ex: "~70% preenchido").

8. **Gere o relatório** no formato abaixo.

## Formato de Saída

```
🩺 **SAÚDE DO CÓRTEX — [Nome do Negócio]**

📊 Completude estimada: ~[X]% dos pilares obrigatórios sem pendências

🔴 Pilares obrigatórios faltando:
   • [lista, ou "Nenhum ✅"]

📝 Pilares com marcadores REVISAR pendentes:
   • [Nome do Pilar] — [N] pendência(s)
   • [lista, ou "Nenhum ✅"]

⚠️ Inconsistências no META.md:
   • [arquivos quebrados ou não indexados, ou "Nenhuma ✅"]

🧠 System prompt: [Fonte única (Frameworks/CEREBRO.md) ✅ | Formato antigo — considere migrar]

💡 Sugestão: [próximo passo mais útil — ex: "diga 'revisar córtex' para completar o Pilar Financeiro" ou "está tudo em dia!"]
```

## Regras

1. **Não reescreva nada sozinha.** Esta skill só diagnostica; qualquer correção deve ser feita via `registrar` ou `revisar córtex`, nunca automaticamente aqui.
2. **Seja honesta sobre lacunas**, mas sem alarmismo — o tom é de "aqui está o que falta", não de erro grave.
3. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace.
4. **Se estiver tudo completo**, comemore brevemente em vez de listar seções vazias de "nada a reportar".
