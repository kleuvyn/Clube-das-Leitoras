Brevo (Sendinblue) – configuração rápida

1) Conta e validação
- Crie uma conta em https://brevo.com (Sendinblue) e configure o remetente (verificação de domínio / e-mail) conforme instruções da plataforma.

2) Variáveis de ambiente
- Defina no ambiente de produção (Vercel / Render / etc):
  - `BREVO_API_KEY` = (sua API key para Transactional Emails)
  - `BREVO_FROM` = "Clube das Leitoras <no-reply@clubedasleitoras.com.br>" (opcional — há fallback)
  - `NEXT_PUBLIC_SITE_URL` = https://clubedasleitoras.com.br

Observação: o projeto aceita `RESEND_API_KEY`/`RESEND_FROM` como fallback temporário, mas recomendamos mover para `BREVO_*`.

3) Dependência
Execute localmente:

```bash
pnpm add sib-api-v3-sdk
```

4) Reinício
- Após configurar as variáveis, redeploy ou reinicie a aplicação.
