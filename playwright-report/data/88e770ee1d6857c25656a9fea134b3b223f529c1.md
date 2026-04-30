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
    - fill("Playwright Voz 1 1777554810696")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
      - waiting 100ms
    11 × waiting for element to be visible, enabled and editable
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
                - generic [ref=e46]: "01"
                - heading "Coloque seu nome na lista" [level=3] [ref=e47]
                - paragraph [ref=e48]: A ordem de inscrição será a ordem de fala
              - generic [ref=e50]:
                - img [ref=e52]
                - generic [ref=e56]: "02"
                - heading "Tempo de fala" [level=3] [ref=e57]
                - paragraph [ref=e58]: Cada participante tem até 2 minutos. Pode solicitar +1 minuto adicional
              - generic [ref=e60]:
                - img [ref=e62]
                - generic [ref=e68]: "03"
                - heading "Regras" [level=3] [ref=e69]
                - paragraph [ref=e70]: Respeitar o tempo de cada uma. Escutar sem interromper. Espaço seguro e sem julgamentos
          - generic [ref=e71]:
            - generic [ref=e73]: Entrada na roda
            - heading "Inscrição" [level=2] [ref=e74]
            - generic [ref=e75]:
              - textbox "Roda de Vozes desativada" [disabled] [ref=e76]
              - button "entrar na roda" [disabled] [ref=e77]:
                - img [ref=e78]
                - generic [ref=e81]: entrar na roda
            - generic [ref=e82]: Roda de Vozes está atualmente desativada. Inscrições fechadas.
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e86]: Ordem de fala
              - heading "Participantes" [level=2] [ref=e87]
              - paragraph [ref=e88]: Ninguém ainda na lista...
            - generic [ref=e89]:
              - generic [ref=e91]: Tempo de partilha
              - heading "Cronômetro" [level=2] [ref=e92]
              - generic [ref=e95]: 2:00
              - generic [ref=e96]:
                - button "iniciar" [ref=e97]:
                  - img [ref=e98]
                  - generic [ref=e100]: iniciar
                - button "reiniciar" [ref=e101]:
                  - img [ref=e102]
                  - generic [ref=e105]: reiniciar
              - button "1 minuto adicional" [ref=e106]:
                - img [ref=e108]
                - generic [ref=e111]: 1 minuto adicional
          - generic [ref=e112]:
            - img [ref=e114]
            - paragraph [ref=e117]: "\"Esse é um espaço de escuta e acolhimento. Enquanto uma fala, as outras escutam com respeito e atenção. Cada voz aqui importa.\""
    - contentinfo [ref=e118]:
      - generic [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]:
            - generic [ref=e122]:
              - img "Logo Clube das Leitoras" [ref=e124]
              - generic [ref=e126]: Clube das Leitoras
            - paragraph [ref=e127]: "\"Uma comunidade feminina em Brasília, ocupando espaços e cafés com o poder das páginas.\""
          - generic [ref=e128]:
            - heading "Nossa Sede" [level=3] [ref=e129]:
              - img [ref=e130]
              - text: Nossa Sede
            - generic [ref=e133]:
              - paragraph [ref=e134]: Biblioteca Nacional de Brasília
              - paragraph [ref=e135]: Setor Cultural Sul, Lote 2
              - paragraph [ref=e136]: Brasília - DF
          - generic [ref=e137]:
            - heading "Explorar" [level=3] [ref=e138]
            - list [ref=e139]:
              - listitem [ref=e140]:
                - link "Livros do Mês" [ref=e141] [cursor=pointer]:
                  - /url: /livro-do-mes
                  - text: Livros do Mês
                  - img [ref=e142]
              - listitem [ref=e145]:
                - link "Dicas da Gabi" [ref=e146] [cursor=pointer]:
                  - /url: /dicas
              - listitem [ref=e147]:
                - link "Nossas Parcerias" [ref=e148] [cursor=pointer]:
                  - /url: /parcerias
              - listitem [ref=e149]:
                - link "Empreendedoras" [ref=e150] [cursor=pointer]:
                  - /url: /empreendedoras
                  - img [ref=e151]
                  - text: Empreendedoras
              - listitem [ref=e157]:
                - link "Política de Privacidade" [ref=e158] [cursor=pointer]:
                  - /url: /privacidade
          - generic [ref=e159]:
            - heading "Social Club" [level=3] [ref=e160]
            - generic [ref=e161]:
              - link [ref=e162] [cursor=pointer]:
                - /url: https://instagram.com/elaeasviagens
                - img [ref=e163]
              - link [ref=e167] [cursor=pointer]:
                - /url: mailto:clubedasleitorasbsb@gmail.com
                - img [ref=e168]
            - generic [ref=e171]:
              - img [ref=e172]
              - paragraph [ref=e177]: Brasília, 2026 • Ano II
        - generic [ref=e178]:
          - paragraph [ref=e179]:
            - text: © 2026 Clube das Leitoras
            - img [ref=e180]
            - text: Brasília • DF
          - generic [ref=e182]:
            - text: Feito com
            - img [ref=e183]
            - link "Kleuvyn" [ref=e185] [cursor=pointer]:
              - /url: https://portfolio.kleuvyn.tec.br
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e191] [cursor=pointer]:
    - generic [ref=e194]:
      - text: Compiling
      - generic [ref=e195]:
        - generic [ref=e196]: .
        - generic [ref=e197]: .
        - generic [ref=e198]: .
  - alert [ref=e199]
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