# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roda-vozes.spec.ts >> roda de vozes allows selecting a speaker and moving to the next participant
- Location: tests/playwright/roda-vozes.spec.ts:22:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="digite seu nome..."]')
    - locator resolved to <input disabled value="" type="text" placeholder="digite seu nome..." class="flex-1 px-8 py-5 rounded-[2rem] border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-lg"/>
    - fill("Playwright Voz 1 1777554810171")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
      - waiting 100ms
    9 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
      - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic:
      - img "Logo"
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "Logo Clube das Leitoras Clube das Leitoras Brasília • DF" [ref=e5] [cursor=pointer]:
          - /url: /
          - img "Logo Clube das Leitoras" [ref=e7]
          - generic [ref=e8]:
            - generic [ref=e9]: Clube das Leitoras
            - generic [ref=e10]: Brasília • DF
        - generic [ref=e11]:
          - button "Conexões" [ref=e14]:
            - text: Conexões
            - img [ref=e15]
          - link "Entrar" [ref=e18] [cursor=pointer]:
            - /url: /login
            - img [ref=e19]
            - text: Entrar
    - main [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e27]: Presença • Conexão • Vivência
          - heading "Roda de Vozes" [level=1] [ref=e29]
          - generic [ref=e30]:
            - paragraph [ref=e31]: "\"Um espaço de escuta e respeito. Cada participante pode se inscrever, seguindo a ordem da lista e compartilhando sua voz no tempo certo.\""
            - generic [ref=e33]: Presença • Acolhimento • Troca
        - main [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e37]: Guia Rápido
            - heading "Como funciona" [level=2] [ref=e38]
            - generic [ref=e39]:
              - generic [ref=e41]:
                - img [ref=e43]
                - generic [ref=e45]: "01"
                - heading "Coloque seu nome na lista" [level=3] [ref=e46]
                - paragraph [ref=e47]: A ordem de inscrição será a ordem de fala
              - generic [ref=e49]:
                - img [ref=e51]
                - generic [ref=e54]: "02"
                - heading "Tempo de fala" [level=3] [ref=e55]
                - paragraph [ref=e56]: Cada participante tem até 2 minutos. Pode solicitar +1 minuto adicional
              - generic [ref=e58]:
                - img [ref=e60]
                - generic [ref=e64]: "03"
                - heading "Regras" [level=3] [ref=e65]
                - paragraph [ref=e66]: Respeitar o tempo de cada uma. Escutar sem interromper. Espaço seguro e sem julgamentos
          - generic [ref=e67]:
            - generic [ref=e69]: Entrada na roda
            - heading "Inscrição" [level=2] [ref=e70]
            - generic [ref=e71]:
              - textbox "Roda de Vozes desativada" [disabled] [ref=e72]
              - button "entrar na roda" [disabled] [ref=e73]:
                - img [ref=e74]
                - generic [ref=e75]: entrar na roda
            - generic [ref=e76]: Roda de Vozes está atualmente desativada. Inscrições fechadas.
          - generic [ref=e77]:
            - generic [ref=e78]:
              - generic [ref=e80]: Ordem de fala
              - heading "Participantes" [level=2] [ref=e81]
              - paragraph [ref=e82]: Ninguém ainda na lista...
            - generic [ref=e83]:
              - generic [ref=e85]: Tempo de partilha
              - heading "Cronômetro" [level=2] [ref=e86]
              - generic [ref=e89]: 2:00
              - generic [ref=e90]:
                - button "iniciar" [ref=e91]:
                  - img [ref=e92]
                  - generic [ref=e94]: iniciar
                - button "reiniciar" [ref=e95]:
                  - img [ref=e96]
                  - generic [ref=e99]: reiniciar
              - button "1 minuto adicional" [ref=e100]:
                - img [ref=e102]
                - generic [ref=e103]: 1 minuto adicional
          - generic [ref=e104]:
            - img [ref=e106]
            - paragraph [ref=e109]: "\"Esse é um espaço de escuta e acolhimento. Enquanto uma fala, as outras escutam com respeito e atenção. Cada voz aqui importa.\""
    - contentinfo [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - generic [ref=e113]:
            - generic [ref=e114]:
              - img "Logo Clube das Leitoras" [ref=e116]
              - generic [ref=e118]: Clube das Leitoras
            - paragraph [ref=e119]: "\"Uma comunidade feminina em Brasília, ocupando espaços e cafés com o poder das páginas.\""
          - generic [ref=e120]:
            - heading "Nossa Sede" [level=3] [ref=e121]:
              - img [ref=e122]
              - text: Nossa Sede
            - generic [ref=e125]:
              - paragraph [ref=e126]: Biblioteca Nacional de Brasília
              - paragraph [ref=e127]: Setor Cultural Sul, Lote 2
              - paragraph [ref=e128]: Brasília - DF
          - generic [ref=e129]:
            - heading "Explorar" [level=3] [ref=e130]
            - list [ref=e131]:
              - listitem [ref=e132]:
                - link "Livros do Mês" [ref=e133] [cursor=pointer]:
                  - /url: /livro-do-mes
                  - text: Livros do Mês
                  - img [ref=e134]
              - listitem [ref=e137]:
                - link "Dicas da Gabi" [ref=e138] [cursor=pointer]:
                  - /url: /dicas
              - listitem [ref=e139]:
                - link "Nossas Parcerias" [ref=e140] [cursor=pointer]:
                  - /url: /parcerias
              - listitem [ref=e141]:
                - link "Empreendedoras" [ref=e142] [cursor=pointer]:
                  - /url: /empreendedoras
                  - img [ref=e143]
                  - text: Empreendedoras
              - listitem [ref=e145]:
                - link "Política de Privacidade" [ref=e146] [cursor=pointer]:
                  - /url: /privacidade
          - generic [ref=e147]:
            - heading "Social Club" [level=3] [ref=e148]
            - generic [ref=e149]:
              - link [ref=e150] [cursor=pointer]:
                - /url: https://instagram.com/elaeasviagens
                - img [ref=e151]
              - link [ref=e154] [cursor=pointer]:
                - /url: mailto:clubedasleitorasbsb@gmail.com
                - img [ref=e155]
            - generic [ref=e158]:
              - img [ref=e159]
              - paragraph [ref=e161]: Brasília, 2026 • Ano II
        - generic [ref=e162]:
          - paragraph [ref=e163]:
            - text: © 2026 Clube das Leitoras
            - img [ref=e164]
            - text: Brasília • DF
          - generic [ref=e166]:
            - text: Feito com
            - img [ref=e167]
            - link "Kleuvyn" [ref=e169] [cursor=pointer]:
              - /url: https://portfolio.kleuvyn.tec.br
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e175] [cursor=pointer]:
    - generic [ref=e178]:
      - text: Compiling
      - generic [ref=e179]:
        - generic [ref=e180]: .
        - generic [ref=e181]: .
        - generic [ref=e182]: .
  - alert [ref=e183]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('roda de vozes page loads and allows adding a participant', async ({ page }) => {
  4  |   await page.goto('/roda-vozes');
  5  |   await expect(page).toHaveTitle(/Clube das Leitoras/i);
  6  | 
  7  |   const participanteNome = `Vozes Playwright ${Date.now()}`;
  8  | 
  9  |   const nomeInput = page.locator('input[placeholder="digite seu nome..."]');
  10 |   const entrarButton = page.locator('button', { hasText: 'entrar na roda' });
  11 | 
  12 |   await expect(nomeInput).toBeVisible();
  13 |   await nomeInput.fill(participanteNome);
  14 |   await Promise.all([
  15 |     page.waitForResponse((response) => response.url().endsWith('/api/roda-vozes') && response.request().method() === 'POST'),
  16 |     entrarButton.click(),
  17 |   ]);
  18 | 
  19 |   await expect(page.locator(`text=${participanteNome}`)).toBeVisible({ timeout: 5000 });
  20 | });
  21 | 
  22 | test('roda de vozes allows selecting a speaker and moving to the next participant', async ({ page }) => {
  23 |   await page.goto('/roda-vozes');
  24 |   await expect(page).toHaveTitle(/Clube das Leitoras/i);
  25 | 
  26 |   const primeiroNome = `Playwright Voz 1 ${Date.now()}`;
  27 |   const segundoNome = `Playwright Voz 2 ${Date.now()}`;
  28 | 
> 29 |   await page.fill('input[placeholder="digite seu nome..."]', primeiroNome);
     |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  30 |   await page.click('button:has-text("entrar na roda")');
  31 |   await expect(page.locator(`text=${primeiroNome}`)).toBeVisible({ timeout: 5000 });
  32 | 
  33 |   await page.fill('input[placeholder="digite seu nome..."]', segundoNome);
  34 |   await page.click('button:has-text("entrar na roda")');
  35 |   await expect(page.locator(`text=${segundoNome}`)).toBeVisible({ timeout: 5000 });
  36 | 
  37 |   const participanteCard = page.locator('div').filter({ hasText: primeiroNome }).first();
  38 |   await participanteCard.scrollIntoViewIfNeeded();
  39 |   await expect(participanteCard).toBeVisible({ timeout: 10000 });
  40 |   await participanteCard.click();
  41 |   await expect(page.getByText('falando agora')).toBeVisible({ timeout: 10000 });
  42 |   await expect(page.getByText(primeiroNome)).toBeVisible({ timeout: 10000 });
  43 | 
  44 |   await page.click('button:has-text("próxima pessoa")');
  45 |   await expect(page.getByText('falando agora')).toBeVisible({ timeout: 10000 });
  46 |   await expect(page.getByText(segundoNome)).toBeVisible({ timeout: 10000 });
  47 | });
  48 | 
```